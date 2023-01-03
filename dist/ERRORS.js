"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PRIVATE_KEY_NOT_FOUND_ERROR = exports.INVALID_CLIENT_ID_ERROR = void 0;
var INVALID_CLIENT_ID_ERROR = {
  message: 'Invalid Client Id Error',
  statusCode: 400,
  errorCode: 'ApiCrypto::INVALID_CLIENT_ID'
};
exports.INVALID_CLIENT_ID_ERROR = INVALID_CLIENT_ID_ERROR;
var PRIVATE_KEY_NOT_FOUND_ERROR = {
  message: 'Private Key Not Found Error',
  statusCode: 400,
  errorCode: 'ApiCrypto::PRIVATE_KEY_NOT_FOUND'
};
exports.PRIVATE_KEY_NOT_FOUND_ERROR = PRIVATE_KEY_NOT_FOUND_ERROR;