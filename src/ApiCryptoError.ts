import { SERVICE } from './CONFIG'
import { ApiCryptoErrorMap } from './TYPES'

/** @ignore */
const DEFAULT_ERROR_MSG = 'Api Crypto Error'
/** @ignore */
const DEFAULT_ERROR_STATUS_CODE = 500
/** @ignore */
const DEFAULT_ERROR_CODE = 'ApiCrypto::GENERIC'

/**
 * Error class whose instance is thrown in case of any error.
 *
 * @class
 * @typedef {ApiCryptoError}
 * @extends {Error}
 */
export class ApiCryptoError extends Error {
  /**
   * Flag to identify if error is a custom error.
   */
  readonly _isCustomError = true
  /**
   * Flag to identify if error is a ApiCryptoError.
   */
  readonly _isApiCryptoError = true
  /**
   * Node project from which Error is thrown.
   */
  readonly service: string
  /**
   * Error's message string.
   */
  message: string
  /**
   * HTTP status code associated with the error.
   */
  statusCode: number
  /**
   * Error Code.
   */
  errorCode: string
  /**
   * Error object.
   */
  error?: any
  /**
   * Creates an instance of ApiCryptoError.
   *
   * @constructor
   * @param [e] Any Error instance to wrap with ApiCryptoError.
   * @param [eMap] ApiCryptoErrorMap to rewrap error for better understanding.
   */
  constructor(e?: any, eMap?: ApiCryptoErrorMap) {
    super()

    this.service = SERVICE
    this.message = eMap?.message || e?.message || DEFAULT_ERROR_MSG
    this.statusCode =
      eMap?.statusCode || e?.statusCode || DEFAULT_ERROR_STATUS_CODE
    this.errorCode =
      eMap?.errorCode || e?.errorCode || e?.code || DEFAULT_ERROR_CODE
    this.error = e
  }
}
