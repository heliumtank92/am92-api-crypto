import { KmsConfig } from '@am92/kms'
import { RedisSdkConfig } from '@am92/redis'
import { constantGenerator } from './INTERNAL'

/** @ignore */
const TYPES = ['JOSE', 'AES'] as const
/** @ignore */
const MODES = ['DISABLED', 'STATIC', 'DYNAMIC'] as const

/**
 * Types of cryptographic algorithms supported.
 *
 * @export
 * @typedef {ApiCryptoTypes}
 */
export type ApiCryptoTypes = (typeof TYPES)[number]
/**
 * Modes of operation for the cryptographic system.
 *
 * @export
 * @typedef {ApiCryptoModes}
 */
export type ApiCryptoModes = (typeof MODES)[number]

/**
 * Constant generator for API crypto modes.
 *
 * @type {*}
 */
export const API_CRYPTO_MODES = constantGenerator<ApiCryptoModes>([...MODES])
/**
 * Constant generator for API crypto types.
 *
 * @type {*}
 */
export const API_CRYPTO_TYPES = constantGenerator<ApiCryptoTypes>([...TYPES])

/** @ignore */
export type IntConfigKeys =
  | 'API_CRYPTO_REDIS_PORT'
  | 'API_CRYPTO_KEY_ROTATION_IN_DAYS'

/** @ignore */
export type IntConfigs<T> = {
  [key in IntConfigKeys]?: T
}

/**
 * Configuration interface for API cryptographic settings.
 *
 * @export
 * @interface ApiCryptoConfig
 * @typedef {ApiCryptoConfig}
 */
export interface ApiCryptoConfig {
  /**
   * Mode of operation for the cryptographic system.
   *
   * @type {ApiCryptoModes}
   */
  MODE: ApiCryptoModes
  /**
   * Type of cryptographic algorithm used.
   *
   * @type {ApiCryptoTypes}
   */
  TYPE: ApiCryptoTypes
  /**
   * List of client IDs authorized to use the cryptographic system.
   *
   * @type {string[]}
   */
  CLIENT_IDS: string[]
  /**
   * Static AES key for encryption.
   *
   * @type {string}
   */
  STATIC_AES_KEY: string
  /**
   * Static public key for encryption.
   *
   * @type {string}
   */
  STATIC_PUBLIC_KEY: string
  /**
   * Static private key for decryption.
   *
   * @type {string}
   */
  STATIC_PRIVATE_KEY: string
  /**
   * Number of days after which the cryptographic key should be rotated.
   *
   * @type {number}
   */
  KEY_ROTATION_IN_DAYS: number

  /**
   * Configuration for the KMS (Key Management Service).
   *
   * @type {KmsConfig}
   */
  KMS_CONFIG: KmsConfig
  /**
   * Configuration for the Redis SDK.
   *
   * @type {RedisSdkConfig}
   */
  REDIS_CONFIG: RedisSdkConfig
}

/**
 * Debug features available for the API cryptographic system.
 *
 * @type {readonly ["disableCrypto"]}
 */
export const API_CRYPTO_DEBUG_FEATURES = ['disableCrypto'] as const

/**
 * Type for the debug features of the API cryptographic system.
 *
 * @export
 * @typedef {ApiCryptoDebugFeatures}
 */
export type ApiCryptoDebugFeatures = (typeof API_CRYPTO_DEBUG_FEATURES)[number]

/**
 * Interface for the debug settings of the API cryptographic system.
 *
 * @export
 * @interface ApiCryptoDebug
 * @typedef {ApiCryptoDebug}
 */
export interface ApiCryptoDebug {
  /**
   * Flag to disable cryptographic operations.
   *
   * @type {boolean}
   */
  disableCrypto: boolean
}

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

/**
 * Validator function for client IDs.
 *
 * @export
 * @typedef {ClientValidator}
 */
export type ClientValidator = (clientId: string) => Promise<boolean>

declare global {
  /** @ignore */
  interface Console {
    success?(...data: any[]): void
    fatal?(...data: any[]): void
  }
}
