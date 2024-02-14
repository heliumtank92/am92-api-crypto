import { AesCrypto } from '@am92/aes-crypto'
import JoseCrypto from '@am92/jose-crypto'
import KeyManager from './lib/KeyManager.mjs'
import Redis from './lib/Redis.mjs'
import CONFIG, { SERVICE } from './CONFIG.mjs'
import DEBUG from './DEBUG.mjs'

import ApiCryptoError from './ApiCryptoError.mjs'
import { INVALID_CLIENT_ID_ERROR } from './Constants/ERRORS.mjs'
import API_CRYPTO_TYPES from './Constants/API_CRYPTO_TYPES.mjs'
import API_CRYPTO_MODES from './Constants/API_CRYPTO_MODES.mjs'

const { MODE, TYPE, CLIENT_IDS } = CONFIG

const ApiCrypto = {
  initialize,
  getPublicKey,
  decryptKey,
  encryptData,
  decryptData
}

export default ApiCrypto

let customValidateClient = async clientId => false

async function initialize(validateClient = customValidateClient) {
  if (!MODE || DEBUG.disableCrypto) {
    console.info(`[${SERVICE} ApiCrypto] Bypassed`)
    return
  }

  console.info(`[${SERVICE} ApiCrypto] Initialising...`)
  customValidateClient = validateClient

  if (MODE === API_CRYPTO_MODES.MAP.DYNAMIC) {
    KeyManager.initialize()
    // TODO: Debug for Redis Connection
    if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
      await Redis.initialize()
    }
  }

  const successLogFunc = console.success || console.info
  successLogFunc(`[${SERVICE} ApiCrypto] Initialised`)
}

async function getPublicKey(clientId) {
  if (!MODE || DEBUG.disableCrypto) {
    return ''
  }

  const isValidClient = await _validateClientId(clientId)
  if (!isValidClient) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  const { publicKey } = await KeyManager.getPublicKey(clientId)
  return publicKey
}

async function decryptKey(clientId = '', ciphertextKey = '') {
  if (!MODE || DEBUG.disableCrypto) {
    return ''
  }

  // Validate Clinet ID
  const isValid = await _validateClientId(clientId)
  if (!isValid) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
    // Get Private Key
    const { privateKey, publicKey, newKey } = await KeyManager.getPrivateKey(
      clientId
    )
    if (newKey) {
      throw new ApiCryptoError({ publicKey }, PRIVATE_KEY_NOT_FOUND_ERROR)
    }

    // Decrypt Encrypted Encryption Key
    return JoseCrypto.decryptKey(ciphertextKey, privateKey)
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
    const { aesKey } = await KeyManager.getAesKey(ciphertextKey)
    return aesKey
  }
}

function encryptData(data, key) {
  if (!MODE || DEBUG.disableCrypto) {
    return ''
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
    return JoseCrypto.encryptData(data, key)
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
    return AesCrypto.encryptData(data, key)
  }
}

function decryptData(payload, key) {
  if (!MODE || DEBUG.disableCrypto) {
    return ''
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
    return JoseCrypto.decryptData(payload, key)
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
    return AesCrypto.decryptData(payload, key)
  }
}

async function _validateClientId(clientId) {
  if (!clientId) {
    return false
  }

  // Validate if client ids present in config provided
  if (CLIENT_IDS.includes(clientId)) {
    return true
  }

  // Call provided validate client functions
  return customValidateClient(clientId)
}
