import Redis from './Redis.mjs'
import API_CRYPTO_CONFIG from '../API_CRYPTO_CONFIG.mjs'

const {
  API_CRYPTO_TYPE,
  STATIC_PUBLIC_KEY,
  STATIC_PRIVATE_KEY
} = API_CRYPTO_CONFIG

const KeyManager = {
  getPublicKey,
  getPrivateKey
}

export default KeyManager

async function getPublicKey (clientId = '') {
  if (API_CRYPTO_TYPE === 'STATIC') { return STATIC_PUBLIC_KEY }

  const cachedKey = await Redis.getPublicKey(clientId)
  if (cachedKey) { return { publicKey: cachedKey, newKey: false } }

  const { publicKey, privateKey } = await generateKeyPair()
  await Promise.allSettled([
    Redis.setPublicKey(clientId, publicKey),
    Redis.setPrivateKey(clientId, privateKey)
  ])

  return { publicKey, privateKey, newKey: true }
}

async function getPrivateKey (clientId = '') {
  if (API_CRYPTO_TYPE === 'STATIC') { return STATIC_PRIVATE_KEY }

  const cachedKey = await Redis.getPrivateKey(clientId)
  if (cachedKey) { return { privateKey: cachedKey, newKey: false } }

  const { publicKey, privateKey } = await generateKeyPair()
  await Promise.allSettled([
    Redis.setPublicKey(clientId, publicKey),
    Redis.setPrivateKey(clientId, privateKey)
  ])

  return { publicKey, privateKey, newKey: true }
}

async function generateKeyPair () {
  return { publicKey: '', privateKey: '' }
}
