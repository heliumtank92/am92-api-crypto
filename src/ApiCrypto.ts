import { AesCrypto } from '@am92/aes-crypto'
import { JoseCrypto } from '@am92/jose-crypto'
import KeyManager from './lib/KeyManager'
import Redis from './lib/Redis'
import CONFIG, { SERVICE } from './CONFIG'
import DEBUG from './DEBUG'

import { ApiCryptoError } from './ApiCryptoError'
import { INVALID_CLIENT_ID_ERROR, PRIVATE_KEY_NOT_FOUND_ERROR } from './ERRORS'
import { API_CRYPTO_MODES, API_CRYPTO_TYPES, ClientValidator } from './TYPES'

const { MODE, TYPE, CLIENT_IDS } = CONFIG

export const ApiCrypto = {
  initialize,
  getPublicKey,
  decryptKey,
  encryptData,
  decryptData
}

let customValidateClient: ClientValidator = async () => false

async function initialize(
  validateClient: ClientValidator = customValidateClient
) {
  if (!MODE || MODE === API_CRYPTO_MODES.MAP.DISABLED || DEBUG.disableCrypto) {
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

async function getPublicKey(clientId: string) {
  if (
    !MODE ||
    MODE === API_CRYPTO_MODES.MAP.DISABLED ||
    TYPE === API_CRYPTO_TYPES.MAP.AES ||
    DEBUG.disableCrypto
  ) {
    return ''
  }

  const isValidClient = await _validateClientId(clientId)
  if (!isValidClient) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  const { publicKey } = await KeyManager.getPublicKey(clientId)
  return publicKey
}

async function decryptKey(clientId: string = '', ciphertextKey: string = '') {
  if (!MODE || MODE === API_CRYPTO_MODES.MAP.DISABLED || DEBUG.disableCrypto) {
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

  return ''
}

function encryptData(data: any, key: string) {
  if (!MODE || MODE === API_CRYPTO_MODES.MAP.DISABLED || DEBUG.disableCrypto) {
    return ''
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
    return JoseCrypto.encryptData(data, key)
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
    return AesCrypto.encryptData(data, key)
  }

  return ''
}

function decryptData(payload: string, key: string) {
  if (!MODE || MODE === API_CRYPTO_MODES.MAP.DISABLED || DEBUG.disableCrypto) {
    return {}
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
    return JoseCrypto.decryptData(payload, key)
  }

  if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
    return AesCrypto.decryptData(payload, key)
  }

  return {}
}

async function _validateClientId(clientId: string = ''): Promise<boolean> {
  if (!MODE || MODE === API_CRYPTO_MODES.MAP.DISABLED || DEBUG.disableCrypto) {
    return true
  }

  // Validate if client ids present in config provided
  if (CLIENT_IDS.includes(clientId)) {
    return true
  }

  // Call provided validate client functions
  const isCustomValid = await customValidateClient(clientId)
  return isCustomValid
}
