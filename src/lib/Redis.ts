import moment from 'moment'
import { RedisSdk } from '@am92/redis'
import CONFIG from '../CONFIG'

/** @ignore */
const { MODE, REDIS_CONFIG, KEY_ROTATION_IN_DAYS } = CONFIG

/** @ignore */
let redisSdk: RedisSdk

/** @ignore */
const Redis = {
  initialize,
  getPublicKey,
  setPublicKey,
  getPrivateKey,
  setPrivateKey,
  getEncryptedPrivateKey,
  setEncryptedPrivateKey,
  setAesKey,
  getAesKey
}

export default Redis

/** @ignore */
async function initialize(): Promise<void> {
  if (MODE === 'DYNAMIC') {
    redisSdk = new RedisSdk(REDIS_CONFIG)
    await redisSdk.connect()
  }
}

/** @ignore */
async function getPublicKey(clientId: string = ''): Promise<string | null> {
  const redisKey = `AC_${clientId}_PUB`
  const value = await redisSdk.get(redisKey)
  return value
}

/** @ignore */
async function setPublicKey(
  clientId: string = '',
  key: string = ''
): Promise<void> {
  const redisKey = `AC_${clientId}_PUB`
  const ttlInSecs = _getKeyRoationExpiry()
  await redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}

/** @ignore */
async function getPrivateKey(clientId: string = ''): Promise<string | null> {
  const redisKey = `AC_${clientId}_PVT`
  const value = await redisSdk.get(redisKey)
  return value
}

/** @ignore */
async function setPrivateKey(
  clientId: string = '',
  key: string = ''
): Promise<void> {
  const redisKey = `AC_${clientId}_PVT`
  const ttlInSecs = _getPlaintextKeyExpiry()
  await redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}

/** @ignore */
async function getEncryptedPrivateKey(
  clientId: string = ''
): Promise<string | null> {
  const redisKey = `AC_${clientId}_ENC_PVT`
  const value = await redisSdk.get(redisKey)
  return value
}

/** @ignore */
async function setEncryptedPrivateKey(
  clientId: string = '',
  key: string = ''
): Promise<void> {
  const redisKey = `AC_${clientId}_ENC_PVT`
  const ttlInSecs = _getKeyRoationExpiry()
  await redisSdk.setAndExpire(redisKey, key, ttlInSecs)
}

/** @ignore */
async function setAesKey(
  encryptedKey: string = '',
  plaintextKey: string = ''
): Promise<void> {
  const redisKey = `AC_${encryptedKey}_AES`
  const ttlInSecs = _getPlaintextKeyExpiry()
  await redisSdk.setAndExpire(redisKey, plaintextKey, ttlInSecs)
}

/** @ignore */
async function getAesKey(encryptedKey: string = ''): Promise<string | null> {
  const redisKey = `AC_${encryptedKey}_AES`
  const value = await redisSdk.get(redisKey)
  return value
}

/** @ignore */
function _getKeyRoationExpiry(): number {
  const now = moment()
  const ttlInSecs = moment()
    .add(KEY_ROTATION_IN_DAYS, 'days')
    .endOf('day')
    .diff(now, 'seconds')
  return ttlInSecs
}

/** @ignore */
function _getPlaintextKeyExpiry(): number {
  const now = moment()
  const diffInsec = moment().endOf('day').diff(now, 'seconds')
  return diffInsec
}
