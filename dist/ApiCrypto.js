"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _joseCrypto = _interopRequireDefault(require("@am92/jose-crypto"));
var _KeyManager = _interopRequireDefault(require("./lib/KeyManager.js"));
var _Redis = _interopRequireDefault(require("./lib/Redis.js"));
var _CONFIG = _interopRequireDefault(require("./CONFIG.js"));
var _ApiCryptoError = _interopRequireDefault(require("./ApiCryptoError.js"));
var _ERRORS = require("./ERRORS.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var {
  MODE,
  CLIENT_IDS
} = _CONFIG.default;
var ApiCrypto = {
  initialize,
  getPublicKey,
  decryptKey,
  encryptData,
  decryptData
};
var _default = ApiCrypto;
exports.default = _default;
var customValidateClient = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (clientIds) {
    return false;
  });
  return function customValidateClient(_x) {
    return _ref.apply(this, arguments);
  };
}();
function initialize() {
  return _initialize.apply(this, arguments);
}
function _initialize() {
  _initialize = _asyncToGenerator(function* () {
    var validateClient = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : customValidateClient;
    if (!MODE) {
      return '';
    }
    customValidateClient = validateClient;
    if (MODE === 'DYNAMIC') {
      yield _Redis.default.initialize();
    }
  });
  return _initialize.apply(this, arguments);
}
function getPublicKey(_x2) {
  return _getPublicKey.apply(this, arguments);
}
function _getPublicKey() {
  _getPublicKey = _asyncToGenerator(function* (clientId) {
    if (!MODE) {
      return '';
    }
    var isValidClient = yield _validateClientId(clientId);
    if (!isValidClient) {
      throw new _ApiCryptoError.default({
        clientId
      }, _ERRORS.INVALID_CLIENT_ID_ERROR);
    }
    var {
      publicKey
    } = yield _KeyManager.default.getPublicKey(clientId);
    return publicKey;
  });
  return _getPublicKey.apply(this, arguments);
}
function decryptKey() {
  return _decryptKey.apply(this, arguments);
}
function _decryptKey() {
  _decryptKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var ciphertextKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    if (!MODE) {
      return '';
    }

    // Validate Clinet ID
    var isValid = yield _validateClientId(clientId);
    if (!isValid) {
      throw new _ApiCryptoError.default({
        clientId
      }, _ERRORS.INVALID_CLIENT_ID_ERROR);
    }
    var {
      privateKey,
      publicKey,
      newKey
    } = yield _KeyManager.default.getPrivateKey(clientId);
    if (newKey) {
      throw new _ApiCryptoError.default({
        publicKey
      }, _ERRORS.PRIVATE_KEY_NOT_FOUND_ERROR);
    }

    // Decrypt Key
    var plaintextKey = yield _joseCrypto.default.decryptKey(ciphertextKey, privateKey);
    return plaintextKey;
  });
  return _decryptKey.apply(this, arguments);
}
function encryptData(data, key) {
  if (!MODE) {
    return '';
  }
  return _joseCrypto.default.encryptData(data, key);
}
function decryptData(payload, key) {
  if (!MODE) {
    return '';
  }
  return _joseCrypto.default.decryptData(payload, key);
}
function _validateClientId(_x3) {
  return _validateClientId2.apply(this, arguments);
}
function _validateClientId2() {
  _validateClientId2 = _asyncToGenerator(function* (clientId) {
    if (!clientId) {
      return false;
    }

    // Validate if client ids present in config provided
    if (CLIENT_IDS.includes(clientId)) {
      return true;
    }

    // Call provided validate client functions
    return customValidateClient(clientId);
  });
  return _validateClientId2.apply(this, arguments);
}