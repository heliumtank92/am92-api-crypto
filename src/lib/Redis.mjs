import RedisSdk from '@am92/redis'
import API_CRYPTO_CONFIG from '../API_CRYPTO_CONFIG.mjs'

const { API_CRYPTO_TYPE, REDIS_CONFIG } = API_CRYPTO_CONFIG
let redisSdk

const Redis = {
  initialize,
  getPrivateKey,
  setPublicKey,
  getPublicKey,
  setPrivateKey
}

export default Redis

async function initialize () {
  if (API_CRYPTO_TYPE === 'DYNAMIC') {
    redisSdk = new RedisSdk(REDIS_CONFIG)
    await redisSdk.initialize
  }
}

async function getPrivateKey (clientId = '') {
  const redisKey = `AC_${clientId}_PUB`
  return redisSdk.get(redisKey)
}

async function setPublicKey (clientId = '', key = '') {
  const redisKey = `AC_${clientId}_PUB`
  const ttlInSecs = 10000
  return redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}

async function getPublicKey (clientId = '') {
  const redisKey = `AC_${clientId}_PUB`
  return redisSdk.get(redisKey)
}

async function setPrivateKey (clientId = '', key = '') {
  const redisKey = `AC_${clientId}_PVT`
  const ttlInSecs = 10000
  return redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}
