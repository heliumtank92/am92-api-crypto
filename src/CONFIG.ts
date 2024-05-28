import {
  API_CRYPTO_MODES,
  API_CRYPTO_TYPES,
  ApiCryptoConfig,
  ApiCryptoModes,
  ApiCryptoTypes,
  IntConfigKeys,
  IntConfigs
} from './TYPES'
import { REDIS_CONFIG, RedisSdkConfig } from '@am92/redis'

/** @ignore */
const {
  npm_package_name: pkgName = '',
  npm_package_version: pkgVersion = '',
  API_CRYPTO_MODE = 'DISABLED',
  API_CRYPTO_TYPE = 'JOSE',
  API_CRYPTO_KMS_TYPE = '',
  API_CRYPTO_KMS_MASTER_KEY_HEX = '',
  API_CRYPTO_KMS_MASTER_IV_HEX = '',
  API_CRYPTO_KMS_AWS_KEY_ID = '',
  API_CRYPTO_KMS_AWS_REGION = 'ap-south-1',

  API_CRYPTO_DEDICATED_REDIS = 'false',
  API_CRYPTO_REDIS_AUTH_ENABLED = 'false',
  API_CRYPTO_REDIS_HOST = '',
  API_CRYPTO_REDIS_PORT = '',
  API_CRYPTO_REDIS_KEY_PREFIX = '',
  API_CRYPTO_REDIS_AUTH = '',

  API_CRYPTO_KEY_ROTATION_IN_DAYS = '1',
  API_CRYPTO_CLIENT_IDS = 'BROWSER',

  API_CRYPTO_STATIC_AES_KEY = '',
  API_CRYPTO_STATIC_PUBLIC_KEY = '',
  API_CRYPTO_STATIC_PRIVATE_KEY = ''
} = process.env

const errorLogFunc = console.fatal || console.error

/** @ignore */
export const SERVICE = `${pkgName}@${pkgVersion}`

/** @ignore */
const REQUIRED_CONFIG: string[] = []
/** @ignore */
const MISSING_CONFIGS: string[] = []

/** @ignore */
const INT_ENV: IntConfigs<string> = {
  API_CRYPTO_REDIS_PORT,
  API_CRYPTO_KEY_ROTATION_IN_DAYS
}

/** @ignore */
const INT_CONFIG: IntConfigs<number> = {}

/** @ignore */
const INVALID_INT_CONFIG: IntConfigs<string> = {}

/** @ignore */
const DEDICATED_REDIS = API_CRYPTO_DEDICATED_REDIS === 'true'
/** @ignore */
const REDIS_AUTH_ENABLED = API_CRYPTO_REDIS_AUTH_ENABLED === 'true'
/** @ignore */
let REDIS_CONNECTION_CONFIG: RedisSdkConfig['CONNECTION_CONFIG'] | undefined =
  undefined

if (
  API_CRYPTO_TYPE &&
  !API_CRYPTO_TYPES.ENUM.includes(API_CRYPTO_TYPE as ApiCryptoTypes)
) {
  errorLogFunc(
    `[${SERVICE} ApiCrypto] Invalid ApiCrypto Config API_CRYPTO_TYPE: ${API_CRYPTO_TYPE}`
  )
  process.exit(1)
}

if (
  API_CRYPTO_MODE &&
  !API_CRYPTO_MODES.ENUM.includes(API_CRYPTO_MODE as ApiCryptoModes)
) {
  errorLogFunc(
    `[${SERVICE} ApiCrypto] Invalid ApiCrypto Config API_CRYPTO_MODE: ${API_CRYPTO_MODE}`
  )
  process.exit(1)
}

if (API_CRYPTO_MODE === API_CRYPTO_MODES.MAP.STATIC) {
  if (API_CRYPTO_TYPE === API_CRYPTO_TYPES.MAP.AES) {
    REQUIRED_CONFIG.push('API_CRYPTO_STATIC_AES_KEY')
  }

  if (API_CRYPTO_TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
    REQUIRED_CONFIG.push('API_CRYPTO_STATIC_PUBLIC_KEY')
    REQUIRED_CONFIG.push('API_CRYPTO_STATIC_PRIVATE_KEY')
  }
} else if (API_CRYPTO_MODE === API_CRYPTO_MODES.MAP.DYNAMIC) {
  REQUIRED_CONFIG.push('API_CRYPTO_KMS_TYPE')

  if (API_CRYPTO_KMS_TYPE === 'NODE') {
    REQUIRED_CONFIG.push('API_CRYPTO_KMS_NODE_MASTER_KEY')
  } else if (API_CRYPTO_KMS_TYPE === 'AWS') {
    REQUIRED_CONFIG.push('API_CRYPTO_KMS_AWS_KEY_ID')
  } else {
    errorLogFunc(
      `[${SERVICE} ApiCrypto] Invalid ApiCrypto Config API_CRYPTO_KMS_TYPE. Must be either 'NODE' or 'AWS'`
    )
    process.exit(1)
  }

  if (DEDICATED_REDIS) {
    REQUIRED_CONFIG.push('API_CRYPTO_REDIS_HOST')
    REQUIRED_CONFIG.push('API_CRYPTO_REDIS_PORT')

    if (REDIS_AUTH_ENABLED) {
      REQUIRED_CONFIG.push('API_CRYPTO_REDIS_AUTH')
    }
  } else {
    console.warn(
      `[${SERVICE} ApiCrypto] ApiCrypto Config API_CRYPTO_DEDICATED_REDIS set to false. Ensure REDIS_ENABLED is set to true`
    )
  }
}

REQUIRED_CONFIG.forEach((key: string) => {
  if (!process.env[key]) {
    MISSING_CONFIGS.push(key)
  }
})

if (MISSING_CONFIGS.length) {
  const logFunc = console.fatal || console.error
  logFunc(
    `[${SERVICE} ApiCrypto] ApiCrypto Config Missing: ${MISSING_CONFIGS.join(
      ', '
    )}`
  )
  process.exit(1)
}

Object.keys(INT_ENV).forEach(key => {
  const configKey = key as IntConfigKeys
  const value = INT_ENV[configKey] || '0'
  const intValue = parseInt(value, 10)

  if (isNaN(intValue)) {
    INVALID_INT_CONFIG[configKey] = value
  } else {
    INT_CONFIG[configKey] = intValue
  }
})

if (Object.keys(INVALID_INT_CONFIG).length) {
  const logFunc = console.fatal || console.error
  logFunc(
    `[${SERVICE} ApiCrypto] Invalid ApiCrypto Integer Configs:`,
    INVALID_INT_CONFIG
  )
  process.exit(1)
}

if (DEDICATED_REDIS) {
  REDIS_CONNECTION_CONFIG = {
    socket: {
      host: API_CRYPTO_REDIS_HOST,
      port: INT_CONFIG.API_CRYPTO_REDIS_PORT,
      tls: false
    }
  }

  if (REDIS_AUTH_ENABLED && REDIS_CONNECTION_CONFIG.socket) {
    REDIS_CONNECTION_CONFIG.socket.tls = true
    REDIS_CONNECTION_CONFIG.password = API_CRYPTO_REDIS_AUTH
  }
}

const CONFIG: ApiCryptoConfig = {
  MODE: API_CRYPTO_MODE as ApiCryptoModes,
  TYPE: API_CRYPTO_TYPE as ApiCryptoTypes,
  CLIENT_IDS: API_CRYPTO_CLIENT_IDS.split(','),
  STATIC_AES_KEY: API_CRYPTO_STATIC_AES_KEY,
  STATIC_PUBLIC_KEY: API_CRYPTO_STATIC_PUBLIC_KEY,
  STATIC_PRIVATE_KEY: API_CRYPTO_STATIC_PRIVATE_KEY,
  KEY_ROTATION_IN_DAYS: INT_CONFIG.API_CRYPTO_KEY_ROTATION_IN_DAYS || 1,

  KMS_CONFIG: {
    TYPE: API_CRYPTO_KMS_TYPE,
    MASTER_KEY_HEX: API_CRYPTO_KMS_MASTER_KEY_HEX,
    MASTER_IV_HEX: API_CRYPTO_KMS_MASTER_IV_HEX,
    AWS_KEY_ID: API_CRYPTO_KMS_AWS_KEY_ID,
    AWS_CONNECTION_CONFIG: {
      region: API_CRYPTO_KMS_AWS_REGION
    }
  },

  REDIS_CONFIG: {
    CONNECTION_CONFIG:
      REDIS_CONNECTION_CONFIG || REDIS_CONFIG.CONNECTION_CONFIG,
    KEY_PREFIX: API_CRYPTO_REDIS_KEY_PREFIX || REDIS_CONFIG.KEY_PREFIX
  }
}

export default CONFIG
