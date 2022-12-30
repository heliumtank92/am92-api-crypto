import moment from 'moment'
import RedisSdk from '@am92/redis'
import CONFIG from '../CONFIG.mjs'

const { MODE, REDIS_CONFIG, KEY_ROTATION_IN_DAYS, PLAINTETX_KEY_CACHE_IN_SECS } = CONFIG
let redisSdk

const Redis = {
  initialize,
  getPublicKey,
  setPublicKey,
  getPrivateKey,
  setPrivateKey,
  getEncryptedPrivateKey,
  setEncryptedPrivateKey
}

export default Redis

async function initialize () {
  if (MODE === 'DYNAMIC') {
    redisSdk = new RedisSdk(REDIS_CONFIG)
    await redisSdk.initialize
  }
}

async function getPublicKey (clientId = '') {
  const redisKey = `AC_${clientId}_PUB`
  return redisSdk.get(redisKey)
}

async function setPublicKey (clientId = '', key = '') {
  const redisKey = `AC_${clientId}_PUB`
  const ttlInSecs = _getKeyRoationExpiry()
  return redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}

async function getPrivateKey (clientId = '') {
  const redisKey = `AC_${clientId}_PVT`
  return redisSdk.get(redisKey)
}

async function setPrivateKey (clientId = '', key = '') {
  const redisKey = `AC_${clientId}_PVT`
  const ttlInSecs = _getPlaintextKeyExpiry()
  return redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}

async function getEncryptedPrivateKey (clientId = '') {
  const redisKey = `AC_${clientId}_ENC_PVT`
  return redisSdk.get(redisKey)
}

async function setEncryptedPrivateKey (clientId = '', key = '') {
  const redisKey = `AC_${clientId}_ENC_PVT`
  const ttlInSecs = _getKeyRoationExpiry()
  return redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}

function _getKeyRoationExpiry () {
  const now = moment()
  const ttlInSecs = moment().add(KEY_ROTATION_IN_DAYS, 'days').endOf('day').diff(now, 'seconds')
  return ttlInSecs
}

function _getPlaintextKeyExpiry () {
  const now = moment()
  const diffInsec = moment().endOf('day').diff(now, 'seconds')
  return Math.min(diffInsec, PLAINTETX_KEY_CACHE_IN_SECS)
}
