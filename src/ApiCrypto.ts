import { AesCrypto } from '@am92/aes-crypto'
import { JoseCrypto } from '@am92/jose-crypto'
import KeyManager from './lib/KeyManager'
import Redis from './lib/Redis'
import CONFIG, { SERVICE } from './CONFIG'
import DEBUG from './DEBUG'

import { ApiCryptoError } from './ApiCryptoError'
import { INVALID_CLIENT_ID_ERROR, PRIVATE_KEY_NOT_FOUND_ERROR } from './ERRORS'
import { API_CRYPTO_MODES, API_CRYPTO_TYPES, ClientValidator } from './TYPES'

/** @ignore */
const { MODE, TYPE, CLIENT_IDS } = CONFIG

/** @ignore */
let customValidateClient: ClientValidator = async () => false

/**
 * Class responsible for API cryptographic operations.
 *
 * @export
 * @class ApiCrypto
 * @typedef {ApiCrypto}
 */
export class ApiCrypto {
  /**
   * Initializes the ApiCrypto class with optional client validation.
   *
   * @static
   * @async
   * @param {ClientValidator} [validateClient=customValidateClient] - Custom client validation function.
   * @returns {*} - Initialization status.
   */
  static async initialize(
    validateClient: ClientValidator = customValidateClient
  ) {
    if (
      !MODE ||
      MODE === API_CRYPTO_MODES.MAP.DISABLED ||
      DEBUG.disableCrypto
    ) {
      console.info(`[${SERVICE} ApiCrypto] Bypassed`)
      return
    }

    console.info(`[${SERVICE} ApiCrypto] Initialising...`)
    customValidateClient = validateClient

    if (MODE === API_CRYPTO_MODES.MAP.DYNAMIC) {
      KeyManager.initialize()
      // TODO: Debug for Redis Connection
      if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
        await Redis.initialize()
      }
    }

    const successLogFunc = console.success || console.info
    successLogFunc(`[${SERVICE} ApiCrypto] Initialised`)
  }

  /**
   * Retrieves the public key for a given client ID.
   *
   * @static
   * @async
   * @param {string} clientId - The client ID.
   * @returns {Promise<string>} - The public key.
   */
  static async getPublicKey(clientId: string): Promise<string> {
    if (
      !MODE ||
      MODE === API_CRYPTO_MODES.MAP.DISABLED ||
      TYPE === API_CRYPTO_TYPES.MAP.AES ||
      DEBUG.disableCrypto
    ) {
      return ''
    }

    const isValidClient = await ApiCrypto.validateClientId(clientId)
    if (!isValidClient) {
      throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
    }

    const { publicKey } = await KeyManager.getPublicKey(clientId)
    return publicKey
  }

  /**
   * Decrypts an encrypted key for a given client ID.
   *
   * @static
   * @async
   * @param {string} [clientId=''] - The client ID.
   * @param {string} [ciphertextKey=''] - The encrypted key.
   * @returns {Promise<string>} - The decrypted key.
   */
  static async decryptKey(
    clientId: string = '',
    ciphertextKey: string = ''
  ): Promise<string> {
    if (
      !MODE ||
      MODE === API_CRYPTO_MODES.MAP.DISABLED ||
      DEBUG.disableCrypto
    ) {
      return ''
    }

    // Validate Client ID
    const isValid = await ApiCrypto.validateClientId(clientId)
    if (!isValid) {
      throw new ApiCryptoError({ clientId }, INVALID_CLIENT_ID_ERROR)
    }

    if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
      // Get Private Key
      const { privateKey, publicKey, newKey } = await KeyManager.getPrivateKey(
        clientId
      )
      if (newKey) {
        throw new ApiCryptoError({ publicKey }, PRIVATE_KEY_NOT_FOUND_ERROR)
      }

      // Decrypt Encrypted Encryption Key
      return JoseCrypto.decryptKey(ciphertextKey, privateKey)
    }

    if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
      const { aesKey } = await KeyManager.getAesKey(ciphertextKey)
      return aesKey
    }

    return ''
  }

  /**
   * Encrypts data using the specified key.
   *
   * @static
   * @param {*} data - The data to encrypt.
   * @param {string} key - The encryption key.
   * @returns {string} - The encrypted data.
   */
  static encryptData(data: any, key: string): string {
    if (
      !MODE ||
      MODE === API_CRYPTO_MODES.MAP.DISABLED ||
      DEBUG.disableCrypto
    ) {
      return ''
    }

    if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
      return JoseCrypto.encryptData(data, key)
    }

    if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
      return AesCrypto.encryptData(data, key)
    }

    return ''
  }

  /**
   * Decrypts data using the specified key.
   *
   * @static
   * @param {string} payload - The encrypted data.
   * @param {string} key - The decryption key.
   * @returns {*} - The decrypted data.
   */
  static decryptData(payload: string, key: string): any {
    if (
      !MODE ||
      MODE === API_CRYPTO_MODES.MAP.DISABLED ||
      DEBUG.disableCrypto
    ) {
      return {}
    }

    if (TYPE === API_CRYPTO_TYPES.MAP.JOSE) {
      return JoseCrypto.decryptData(payload, key)
    }

    if (TYPE === API_CRYPTO_TYPES.MAP.AES) {
      return AesCrypto.decryptData(payload, key)
    }

    return {}
  }

  /**
   * Validates the client ID.
   *
   * @static
   * @async
   * @param {string} [clientId=''] - The client ID.
   * @returns {Promise<boolean>} - Validation result.
   */
  static async validateClientId(clientId: string = ''): Promise<boolean> {
    if (
      !MODE ||
      MODE === API_CRYPTO_MODES.MAP.DISABLED ||
      DEBUG.disableCrypto
    ) {
      return true
    }

    // Validate if client ids present in config provided
    if (CLIENT_IDS.includes(clientId)) {
      return true
    }

    // Call provided validate client functions
    const isCustomValid = await customValidateClient(clientId)
    return isCustomValid
  }
}
