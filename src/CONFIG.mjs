const {
  npm_package_name: pkgName = '',
  npm_package_version: pkgVersion = '',

  API_CRYPTO_KMS_TYPE = '',
  API_CRYPTO_KMS_MASTER_KEY_HEX = '',
  API_CRYPTO_KMS_MASTER_IV_HEX = '',
  API_CRYPTO_KMS_AWS_KEY_ID = '',
  API_CRYPTO_KMS_AWS_REGION = 'ap-south-1',

  API_CRYPTO_DEDICATED_REDIS = 'false',
  API_CRYPTO_REDIS_AUTH_ENABLED = 'false',
  API_CRYPTO_REDIS_CHECK_SERVER_IDENTITY = 'false',
  API_CRYPTO_REDIS_HOST = '',
  API_CRYPTO_REDIS_PORT = '',
  API_CRYPTO_REDIS_KEY_PREFIX = '',
  API_CRYPTO_REDIS_AUTH = '',

  API_CRYPTO_KEY_ROTATION_IN_DAYS = '1',
  API_CRYPTO_CLIENT_IDS = 'BROWSER',

  API_CRYPTO_STATIC_PUBLIC_KEY = '',
  API_CRYPTO_STATIC_PRIVATE_KEY = ''
} = process.env

const { API_CRYPTO_MODE } = process.env

const SERVICE = `${pkgName}@${pkgVersion}`
const fatalLogFunc = console.fatal || console.error

const REQUIRED_CONFIG = []
const DEDICATED_REDIS = API_CRYPTO_DEDICATED_REDIS === 'true'
let REDIS_CONNECTION_CONFIG

if (API_CRYPTO_MODE === 'STATIC') {
  REQUIRED_CONFIG.push('API_CRYPTO_STATIC_PUBLIC_KEY')
  REQUIRED_CONFIG.push('API_CRYPTO_STATIC_PRIVATE_KEY')
} else if (API_CRYPTO_MODE === 'DYNAMIC') {
  REQUIRED_CONFIG.push('API_CRYPTO_KMS_TYPE')

  if (API_CRYPTO_KMS_TYPE === 'NODE ') {
    REQUIRED_CONFIG.push('API_CRYPTO_KMS_NODE_MASTER_KEY')
  } else if (API_CRYPTO_KMS_TYPE === 'KMS ') {
    REQUIRED_CONFIG.push('API_CRYPTO_KMS_AWS_KEY_ID')
  } else {
    fatalLogFunc(`[${SERVICE} ApiCrypto] Invalid ApiCrypto Config API_CRYPTO_KMS_TYPE. Must be either 'NODE' or 'AWS'`)
    process.exit(1)
  }

  if (DEDICATED_REDIS) {
    const REDIS_AUTH_ENABLED = API_CRYPTO_REDIS_AUTH_ENABLED === 'true'
    const REDIS_CHECK_SERVER_IDENTITY = API_CRYPTO_REDIS_CHECK_SERVER_IDENTITY === 'true'

    REQUIRED_CONFIG.push('API_CRYPTO_REDIS_HOST')
    REQUIRED_CONFIG.push('API_CRYPTO_REDIS_PORT')

    if (REDIS_AUTH_ENABLED) {
      REQUIRED_CONFIG.push('API_CRYPTO_REDIS_AUTH')
    }

    REDIS_CONNECTION_CONFIG = {
      host: API_CRYPTO_REDIS_HOST,
      port: API_CRYPTO_REDIS_PORT
    }

    if (REDIS_AUTH_ENABLED) {
      REDIS_CONNECTION_CONFIG.password = API_CRYPTO_REDIS_AUTH
    }

    if (REDIS_CHECK_SERVER_IDENTITY) {
      REDIS_CONNECTION_CONFIG.tls = { checkServerIdentity: () => undefined }
    }
  } else {
    console.warn(`[${SERVICE} ApiCrypto] ApiCrypto Config API_CRYPTO_DEDICATED_REDIS set to false. Ensure REDIS_ENABLED is set to true`)
  }
} else if (API_CRYPTO_MODE) {
  fatalLogFunc(`[${SERVICE} ApiCrypto] Invalid ApiCrypto Config API_CRYPTO_MODE: ${API_CRYPTO_MODE}`)
  process.exit(1)
}

const MISSING_CONFIGS = []
REQUIRED_CONFIG.forEach(function (key) {
  if (!process.env[key]) {
    MISSING_CONFIGS.push(key)
  }
})

if (MISSING_CONFIGS.length) {
  fatalLogFunc(`[${SERVICE} ApiCrypto] ApiCrypto Config Missing: ${MISSING_CONFIGS.join(', ')}`)
  process.exit(1)
}

const KEY_ROTATION_IN_DAYS = parseInt(API_CRYPTO_KEY_ROTATION_IN_DAYS, 10)

if (isNaN(KEY_ROTATION_IN_DAYS)) {
  fatalLogFunc(`[${SERVICE} ApiCrypto] Invalid ApiCrypto Integer Configs:`, { KEY_ROTATION_IN_DAYS })
  process.exit(1)
}

const CONFIG = {
  MODE: API_CRYPTO_MODE,
  CLIENT_IDS: API_CRYPTO_CLIENT_IDS,
  STATIC_PUBLIC_KEY: API_CRYPTO_STATIC_PUBLIC_KEY,
  STATIC_PRIVATE_KEY: API_CRYPTO_STATIC_PRIVATE_KEY,
  KEY_ROTATION_IN_DAYS: API_CRYPTO_KEY_ROTATION_IN_DAYS,

  KMS_CONFIG: {
    TYPE: API_CRYPTO_KMS_TYPE,
    MASTER_KEY_HEX: API_CRYPTO_KMS_MASTER_KEY_HEX,
    MASTER_IV_HEX: API_CRYPTO_KMS_MASTER_IV_HEX,
    AWS_KEY_ID: API_CRYPTO_KMS_AWS_KEY_ID,
    AWS_CONNECTION_CONFIG: {
      region: API_CRYPTO_KMS_AWS_REGION
    }
  },

  DEDICATED_REDIS,

  REDIS_CONFIG: {
    CONNECTION_CONFIG: REDIS_CONNECTION_CONFIG,
    KEY_PREFIX: API_CRYPTO_REDIS_KEY_PREFIX
  }
}

export default CONFIG

export { SERVICE }
