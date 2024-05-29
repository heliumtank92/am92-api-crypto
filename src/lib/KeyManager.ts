import { AwsKms, generateKmsInstance, NodeKms } from '@am92/kms'
import Redis from './Redis'
import CONFIG from '../CONFIG'
import { ApiCryptoError } from '../ApiCryptoError'
import { MISSING_ENCRYPTED_AES_KEY_ERROR } from '../ERRORS'
import { API_CRYPTO_MODES } from '../TYPES'
import { AesKeyObject, RsaKeyObject } from '../INTERNAL'

/** @ignore */
const {
  MODE,
  STATIC_PUBLIC_KEY,
  STATIC_PRIVATE_KEY,
  STATIC_AES_KEY,
  KMS_CONFIG
} = CONFIG

/** @ignore */
let kms: AwsKms | NodeKms

/** @ignore */
const KeyManager = {
  initialize,
  getPublicKey,
  getPrivateKey,
  getAesKey
}

export default KeyManager

/** @ignore */
function initialize() {
  kms = generateKmsInstance(KMS_CONFIG)
}

/** @ignore */
async function getPublicKey(clientId = ''): Promise<RsaKeyObject> {
  if (MODE === API_CRYPTO_MODES.MAP.STATIC) {
    return {
      publicKey: STATIC_PUBLIC_KEY,
      privateKey: '',
      encryptedPrivateKey: '',
      newKey: false
    }
  }

  const publicKey = await Redis.getPublicKey(clientId)
  if (publicKey) {
    return {
      publicKey,
      privateKey: '',
      encryptedPrivateKey: '',
      newKey: false
    }
  }

  const keyPair = await _generateKeyPairAndCache()
  return keyPair
}

/** @ignore */
async function getPrivateKey(clientId = ''): Promise<RsaKeyObject> {
  if (MODE === API_CRYPTO_MODES.MAP.STATIC) {
    return {
      publicKey: '',
      privateKey: STATIC_PRIVATE_KEY,
      encryptedPrivateKey: '',
      newKey: false
    }
  }

  const privateKey = await Redis.getPrivateKey(clientId)
  if (privateKey) {
    return {
      publicKey: '',
      privateKey,
      encryptedPrivateKey: '',
      newKey: false
    }
  }

  const encryptedPrivateKey = await Redis.getEncryptedPrivateKey(clientId)
  if (encryptedPrivateKey) {
    const privateKey = await kms.decrypt(encryptedPrivateKey)
    await Redis.setPrivateKey(clientId, privateKey)
    return {
      publicKey: '',
      privateKey,
      encryptedPrivateKey,
      newKey: false
    }
  }

  const keyPair = await _generateKeyPairAndCache()
  return keyPair
}

/** @ignore */
async function getAesKey(encryptedAesKey = ''): Promise<AesKeyObject> {
  if (MODE === API_CRYPTO_MODES.MAP.STATIC) {
    return { aesKey: STATIC_AES_KEY }
  }

  if (!encryptedAesKey) {
    throw new ApiCryptoError({}, MISSING_ENCRYPTED_AES_KEY_ERROR)
  }

  // TODO: Debug for Redis Connection
  // const cachedAesKey = await Redis.getAesKey(encryptedAesKey)
  // if (cachedAesKey) {
  //   return { aesKey: cachedAesKey }
  // }

  const aesKey = await kms.decrypt(encryptedAesKey, {
    plainTextFormat: 'base64'
  })
  // TODO: Debug for Redis Connection
  // await Redis.setAesKey(encryptedAesKey, aesKey)
  return { aesKey }
}

/** @ignore */
async function _generateKeyPairAndCache(clientId = '') {
  const { publicKey, privateKey, encryptedPrivateKey } =
    await kms.generateDataKeyPair()

  await Promise.allSettled([
    Redis.setPublicKey(clientId, publicKey),
    Redis.setPrivateKey(clientId, privateKey),
    Redis.setEncryptedPrivateKey(clientId, encryptedPrivateKey)
  ])

  return { publicKey, privateKey, encryptedPrivateKey, newKey: true }
}
