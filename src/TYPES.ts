import { KmsConfig } from '@am92/kms'
import { RedisSdkConfig } from '@am92/redis'
import { constantGenerator } from './INTERNAL'

const TYPES = ['JOSE', 'AES'] as const
const MODES = ['DISABLED', 'STATIC', 'DYNAMIC'] as const

export type ApiCryptoTypes = (typeof TYPES)[number]
export type ApiCryptoModes = (typeof MODES)[number]

export const API_CRYPTO_MODES = constantGenerator<ApiCryptoModes>([...MODES])
export const API_CRYPTO_TYPES = constantGenerator<ApiCryptoTypes>([...TYPES])

/** @ignore */
export type IntConfigKeys =
  | 'API_CRYPTO_REDIS_PORT'
  | 'API_CRYPTO_KEY_ROTATION_IN_DAYS'

/** @ignore */
export type IntConfigs<T> = {
  [key in IntConfigKeys]?: T
}

export interface ApiCryptoConfig {
  MODE: ApiCryptoModes
  TYPE: ApiCryptoTypes
  CLIENT_IDS: string[]
  STATIC_AES_KEY: string
  STATIC_PUBLIC_KEY: string
  STATIC_PRIVATE_KEY: string
  KEY_ROTATION_IN_DAYS: number

  KMS_CONFIG: KmsConfig
  REDIS_CONFIG: RedisSdkConfig
}

export type ApiCryptoDebugFeatures = 'disableCrypto'

export interface ApiCryptoDebug {
  disableCrypto: boolean
}

export const DEBUG_FEATURES: ApiCryptoDebugFeatures[] = ['disableCrypto']

/**
 * Error mapping for customizing error messages and codes in ApiCrypto.
 *
 * @export
 * @interface ApiCryptoErrorMap
 * @typedef {ApiCryptoErrorMap}
 */
export interface ApiCryptoErrorMap {
  /**
   * Custom message string for ApiCryptoError instance.
   */
  message?: string
  /**
   * Custom error code string for ApiCryptoError instance.
   */
  errorCode?: string
  /**
   * Custom HTTP status code for ApiCryptoError instance.
   */
  statusCode?: number
}

export type ClientValidator = (clientId: string) => Promise<boolean>

declare global {
  /** @ignore */
  interface Console {
    success?(...data: any[]): void
    fatal?(...data: any[]): void
  }
}
