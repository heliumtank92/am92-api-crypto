import Kms from '@am92/kms'
import Redis from './Redis.mjs'
import CONFIG from '../CONFIG.mjs'

const {
  MODE,
  STATIC_PUBLIC_KEY,
  STATIC_PRIVATE_KEY,
  KMS_CONFIG
} = CONFIG

const kms = new Kms(KMS_CONFIG)

const KeyManager = {
  getPublicKey,
  getPrivateKey
}

export default KeyManager

async function getPublicKey (clientId = '') {
  if (MODE === 'STATIC') { return STATIC_PUBLIC_KEY }

  const publicKey = await Redis.getPublicKey(clientId)
  if (publicKey) { return { publicKey } }

  const keyPair = await _generateKeyPairAndCache()
  return keyPair
}

async function getPrivateKey (clientId = '') {
  if (MODE === 'STATIC') { return STATIC_PRIVATE_KEY }

  const privateKey = await Redis.getPrivateKey(clientId)
  if (privateKey) { return { privateKey } }

  const encryptedPrivateKey = await Redis.getEncryptedPrivateKey(clientId)
  if (encryptedPrivateKey) {
    const privateKey = await kms.decrypt(encryptedPrivateKey)
    await Redis.setPrivateKey(clientId, privateKey)
    return { privateKey }
  }

  const keyPair = await _generateKeyPairAndCache()
  return keyPair
}

async function _generateKeyPairAndCache (clientId = '') {
  const { publicKey, privateKey, encryptedPrivateKey } = await kms.generateKeyPair()
  await Promise.allSettled([
    Redis.setPublicKey(clientId, publicKey),
    Redis.setPrivateKey(clientId, privateKey),
    Redis.setEncryptedPrivateKey(clientId, encryptedPrivateKey)
  ])
  return { publicKey, privateKey, encryptedPrivateKey, newKey: true }
}
