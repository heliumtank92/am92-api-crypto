import Kms from '@am92/kms'
import Redis from './Redis.mjs'
import CONFIG from '../CONFIG.mjs'
import API_CRYPTO_MODES from '../Constants/API_CRYPTO_MODES.mjs'
import ApiCryptoError from '../ApiCryptoError.mjs'
import { MISSING_ENCRYPTED_AES_KEY_ERROR } from '../Constants/ERRORS.mjs'

const {
  MODE,
  STATIC_PUBLIC_KEY,
  STATIC_PRIVATE_KEY,
  STATIC_AES_KEY,
  KMS_CONFIG
} = CONFIG

let kms

const KeyManager = {
  initialize,
  getPublicKey,
  getPrivateKey,
  getAesKey
}

export default KeyManager

function initialize() {
  kms = new Kms(KMS_CONFIG)
}

async function getPublicKey(clientId = '') {
  if (MODE === API_CRYPTO_MODES.MAP.STATIC) {
    return { publicKey: STATIC_PUBLIC_KEY }
  }

  const publicKey = await Redis.getPublicKey(clientId)
  if (publicKey) {
    return { publicKey }
  }

  const keyPair = await _generateKeyPairAndCache()
  return keyPair
}

async function getPrivateKey(clientId = '') {
  if (MODE === API_CRYPTO_MODES.MAP.STATIC) {
    return { privateKey: STATIC_PRIVATE_KEY }
  }

  const privateKey = await Redis.getPrivateKey(clientId)
  if (privateKey) {
    return { privateKey }
  }

  const encryptedPrivateKey = await Redis.getEncryptedPrivateKey(clientId)
  if (encryptedPrivateKey) {
    const privateKey = await kms.decrypt(encryptedPrivateKey)
    await Redis.setPrivateKey(clientId, privateKey)
    return { privateKey }
  }

  const keyPair = await _generateKeyPairAndCache()
  return keyPair
}

async function getAesKey(encryptedAesKey = '') {
  if (MODE === API_CRYPTO_MODES.MAP.STATIC) {
    return { aesKey: STATIC_AES_KEY }
  }

  if (!encryptedAesKey) {
    throw new ApiCryptoError({}, MISSING_ENCRYPTED_AES_KEY_ERROR)
  }

  const cachedAesKey = await Redis.getAesKey(encryptedAesKey)
  if (cachedAesKey) {
    return { aesKey: cachedAesKey }
  }

  const aesKey = await kms.decrypt(encryptedAesKey, {
    plainTextFormat: 'base64'
  })
  await Redis.setAesKey(encryptedAesKey, aesKey)
  return { aesKey }
}

async function _generateKeyPairAndCache(clientId = '') {
  const { publicKey, privateKey, encryptedPrivateKey } =
    await kms.generateKeyPair()

  await Promise.allSettled([
    Redis.setPublicKey(clientId, publicKey),
    Redis.setPrivateKey(clientId, privateKey),
    Redis.setEncryptedPrivateKey(clientId, encryptedPrivateKey)
  ])

  return { publicKey, privateKey, encryptedPrivateKey, newKey: true }
}
