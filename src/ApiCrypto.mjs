import JoseCrypto from '@am92/jose-crypto'
import KeyManager from './lib/KeyManager.mjs'
import Redis from './lib/Redis.mjs'
import CONFIG from './CONFIG.mjs'

import ApiCryptoError from './ApiCryptoError.mjs'
import { INVALID_CLIENT_ID_ERROR, PRIVATE_KEY_NOT_FOUND_ERROR } from './ERRORS.mjs'

const { CLIENT_IDS } = CONFIG
const ApiCrypto = {
  initialize,
  getPublicKey,
  decryptKey,
  encryptData: JoseCrypto.encryptData,
  decryptData: JoseCrypto.decryptData
}

export default ApiCrypto

let customValidateClient = async (clientIds) => false

async function initialize (validateClient = customValidateClient) {
  customValidateClient = validateClient
  await Redis.initialize()
}

async function getPublicKey (clientId) {
  const isValidClient = await _validateClientId(clientId)
  if (!isValidClient) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  const { publicKey } = await KeyManager.getPublicKey(clientId)
  return publicKey
}

async function decryptKey (clientId = '', ciphertextKey = '') {
  // Validate Clinet ID
  const isValid = await _validateClientId(clientId)
  if (!isValid) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  const { privateKey, publicKey, newKey } = await KeyManager.getPrivateKey(clientId)
  if (newKey) {
    throw new ApiCryptoError({ publicKey }, PRIVATE_KEY_NOT_FOUND_ERROR)
  }

  // Decrypt Key
  const plaintextKey = await JoseCrypto.decryptKey(ciphertextKey, privateKey)
  return plaintextKey
}

async function _validateClientId (clientId) {
  if (!clientId) { return false }

  // Validate if client ids present in config provided
  if (CLIENT_IDS.includes(clientId)) { return true }

  // Call provided validate client functions
  return customValidateClient(clientId)
}
