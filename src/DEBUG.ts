import { SERVICE } from './CONFIG'
import {
  ApiCryptoDebug,
  ApiCryptoDebugFeatures,
  API_CRYPTO_DEBUG_FEATURES
} from './TYPES'

/** @ignore */
const { DEBUG: debug = '' } = process.env

/** @ignore */
const DEBUG_ID = 'apiCrypto'
/** @ignore */
const debugAll = debug === '*' || debug?.includes(`${DEBUG_ID}:*`)
/** @ignore */
const debugFeatures = new RegExp(`${DEBUG_ID}:([A-Za-z0-9,]*);?`).exec(debug)
/** @ignore */
const debugFeaturesList = ((debugFeatures && debugFeatures[1]) ||
  []) as Partial<ApiCryptoDebugFeatures[]>

/** @ignore */
const DEBUG: ApiCryptoDebug = {
  disableCrypto: false
}

/** @ignore */
const DEBUG_ENABLED_FEATURES = []

for (const feature of API_CRYPTO_DEBUG_FEATURES) {
  const debugFeature = debugFeaturesList.includes(feature)
  DEBUG[feature] = debugAll || debugFeature

  if (DEBUG[feature]) {
    DEBUG_ENABLED_FEATURES.push(feature)
  }
}

if (DEBUG_ENABLED_FEATURES.length) {
  console.warn(
    `[${SERVICE} ApiCrypto] Debugging Features Enabled: ${DEBUG_ENABLED_FEATURES.join(
      ', '
    )}`
  )
}

export default DEBUG
