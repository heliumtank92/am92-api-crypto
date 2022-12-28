import JoseCrypto from '@am92/jose-crypto'
import API_CRYPTO_CONFIG from './API_CRYPTO_CONFIG.mjs'
import KeyManager from './lib/KeyManager.mjs'
import Redis from './lib/Redis.mjs'

const { CLIENT_IDS } = API_CRYPTO_CONFIG
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
  customValidateClient = validateClient
  await Redis.initialize()
}

async function getPublicKey (clientId) {
  const isValidClient = _validateClientId(clientId)

  if (!isValidClient) {
    // TODO: Throw Error
  }

  const { publicKey } = await KeyManager.getPublicKey(clientId)
  return publicKey
}

async function decryptKey (clientId = '', ciphertextKey = '') {
  const isValid = _validateClientId(clientId)

  if (!isValid) {
    // TODO: Throw Error
  }

  const { privateKey, publicKey, newKey } = await KeyManager.getPrivateKey(clientId)
  if (newKey) {
    // TODO: Throw Error
    // const errorObj = { ...PRIVATE_KEY_NOT_FOUND, publicKey }
    // throw errorObj
  }

  // Decrypt Key
  const plaintextKey = await JoseCrypto.decryptKey(ciphertextKey, privateKey)
  return plaintextKey
}

async function encryptData (plaintextKey = '', plaintextData = '') {
  if (!plaintextKey || !plaintextData) {
    // TODO: Throw Error
  }

  const ciphertextData = JoseCrypto.encryptData(plaintextData, plaintextKey)
  return ciphertextData
}

async function decryptData (plaintextKey = '', ciphertextData = '') {
  if (!plaintextKey || !ciphertextData) {
    // TODO: Throw Error
  }

  const plaintextData = JoseCrypto.encryptData(ciphertextData, plaintextKey)
  return plaintextData
}

async function _validateClientId (clientId) {
  if (!clientId) { return false }

  if (CLIENT_IDS.includes(clientId)) { return true }

  return customValidateClient(clientId)
}
