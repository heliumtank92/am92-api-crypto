import JoseCrypto from '@am92/jose-crypto'
import KeyManager from './lib/KeyManager.mjs'
import Redis from './lib/Redis.mjs'
import CONFIG, { SERVICE } from './CONFIG.mjs'
import DEBUG from './DEBUG.mjs'

import ApiCryptoError from './ApiCryptoError.mjs'
import {
  INVALID_CLIENT_ID_ERROR,
  PRIVATE_KEY_NOT_FOUND_ERROR
} from './ERRORS.mjs'

const { MODE, CLIENT_IDS } = CONFIG

const ApiCrypto = {
  initialize,
  getPublicKey,
  decryptKey,
  encryptData,
  decryptData
}

export default ApiCrypto

let customValidateClient = async (clientId) => false

async function initialize(validateClient = customValidateClient) {
  if (!MODE || DEBUG.disableCrypto) {
    console.info(`[${SERVICE} ApiCrypto] Bypassed`)
    return
  }

  console.info(`[${SERVICE} ApiCrypto] Initialising...`)
  customValidateClient = validateClient

  if (MODE === 'DYNAMIC') {
    await Redis.initialize()
    KeyManager.initialize()
  }

  const successLogFunc = console.success || console.info
  successLogFunc(`[${SERVICE} ApiCrypto] Initialised`)
}

async function getPublicKey(clientId) {
  if (!MODE || DEBUG.disableCrypto) { return '' }

  const isValidClient = await _validateClientId(clientId)
  if (!isValidClient) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  const { publicKey } = await KeyManager.getPublicKey(clientId)
  return publicKey
}

async function decryptKey(clientId = '', ciphertextKey = '') {
  if (!MODE || DEBUG.disableCrypto) { return '' }

  // Validate Clinet ID
  const isValid = await _validateClientId(clientId)
  if (!isValid) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  // Get Private Key
  const { privateKey, publicKey, newKey } = await KeyManager.getPrivateKey(clientId)
  if (newKey) {
    throw new ApiCryptoError({ publicKey }, PRIVATE_KEY_NOT_FOUND_ERROR)
  }

  // Decrypt Encrypted Encryption Key
  return JoseCrypto.decryptKey(ciphertextKey, privateKey)
}

function encryptData(data, key) {
  if (!MODE || DEBUG.disableCrypto) { return '' }
  return JoseCrypto.encryptData(data, key)
}

function decryptData(payload, key) {
  if (!MODE || DEBUG.disableCrypto) { return '' }
  return JoseCrypto.decryptData(payload, key)
}

async function _validateClientId(clientId) {
  if (!clientId) { return false }

  // Validate if client ids present in config provided
  if (CLIENT_IDS.includes(clientId)) { return true }

  // Call provided validate client functions
  return customValidateClient(clientId)
}
