import JoseCrypto from '@am92/jose-crypto'
import KeyManager from './lib/KeyManager.mjs'
import Redis from './lib/Redis.mjs'
import CONFIG, { SERVICE } from './CONFIG.mjs'

import ApiCryptoError from './ApiCryptoError.mjs'
import { INVALID_CLIENT_ID_ERROR, PRIVATE_KEY_NOT_FOUND_ERROR } from './ERRORS.mjs'

const { MODE, CLIENT_IDS } = CONFIG

const ApiCrypto = {
  initialize,
  getPublicKey,
  decryptKey,
  encryptData,
  decryptData
}

export default ApiCrypto

let customValidateClient = async (clientIds) => false

async function initialize (validateClient = customValidateClient) {
  if (!MODE) {
    console.info(`[${SERVICE} ApiCrypto] Bypassed`)
    return
  }

  console.trace(`[${SERVICE} ApiCrypto] Initialising...`)
  customValidateClient = validateClient
  if (MODE === 'DYNAMIC') { await Redis.initialize() }
  console.info(`[${SERVICE} ApiCrypto] Initialised`)
}

async function getPublicKey (clientId) {
  if (!MODE) { return '' }

  const isValidClient = await _validateClientId(clientId)
  if (!isValidClient) {
    throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
  }

  const { publicKey } = await KeyManager.getPublicKey(clientId)
  return publicKey
}

async function decryptKey (clientId = '', ciphertextKey = '') {
  if (!MODE) { return '' }

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

function encryptData (data, key) {
  if (!MODE) { return '' }
  return JoseCrypto.encryptData(data, key)
}

function decryptData (payload, key) {
  if (!MODE) { return '' }
  return JoseCrypto.decryptData(payload, key)
}

async function _validateClientId (clientId) {
  if (!clientId) { return false }

  // Validate if client ids present in config provided
  if (CLIENT_IDS.includes(clientId)) { return true }

  // Call provided validate client functions
  return customValidateClient(clientId)
}
