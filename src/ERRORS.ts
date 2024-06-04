import { ApiCryptoErrorMap } from './TYPES'

/** @ignore */
export const INVALID_CLIENT_ID_ERROR: ApiCryptoErrorMap = {
  message: 'Invalid Client Id',
  statusCode: 400,
  errorCode: 'ApiCrypto::INVALID_CLIENT_ID'
}

/** @ignore */
export const PRIVATE_KEY_NOT_FOUND_ERROR: ApiCryptoErrorMap = {
  message: 'Private Key Not Found',
  statusCode: 400,
  errorCode: 'ApiCrypto::PRIVATE_KEY_NOT_FOUND'
}

/** @ignore */
export const MISSING_ENCRYPTED_AES_KEY_ERROR: ApiCryptoErrorMap = {
  message: 'Missing Encrypted Aes Key',
  statusCode: 400,
  errorCode: 'ApiCrypto::MISSING_ENCRYPTED_AES_KEY'
}
