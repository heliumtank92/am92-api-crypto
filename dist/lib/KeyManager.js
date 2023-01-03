"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _kms = _interopRequireDefault(require("@am92/kms"));
var _Redis = _interopRequireDefault(require("./Redis.js"));
var _CONFIG = _interopRequireDefault(require("../CONFIG.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var {
  MODE,
  STATIC_PUBLIC_KEY,
  STATIC_PRIVATE_KEY,
  KMS_CONFIG
} = _CONFIG.default;
var kms = new _kms.default(KMS_CONFIG);
var KeyManager = {
  getPublicKey,
  getPrivateKey
};
var _default = KeyManager;
exports.default = _default;
function getPublicKey() {
  return _getPublicKey.apply(this, arguments);
}
function _getPublicKey() {
  _getPublicKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    if (MODE === 'STATIC') {
      return {
        publicKey: STATIC_PUBLIC_KEY
      };
    }
    var publicKey = yield _Redis.default.getPublicKey(clientId);
    if (publicKey) {
      return {
        publicKey
      };
    }
    var keyPair = yield _generateKeyPairAndCache();
    return keyPair;
  });
  return _getPublicKey.apply(this, arguments);
}
function getPrivateKey() {
  return _getPrivateKey.apply(this, arguments);
}
function _getPrivateKey() {
  _getPrivateKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    if (MODE === 'STATIC') {
      return {
        privateKey: STATIC_PRIVATE_KEY
      };
    }
    var privateKey = yield _Redis.default.getPrivateKey(clientId);
    if (privateKey) {
      return {
        privateKey
      };
    }
    var encryptedPrivateKey = yield _Redis.default.getEncryptedPrivateKey(clientId);
    if (encryptedPrivateKey) {
      var _privateKey = yield kms.decrypt(encryptedPrivateKey);
      yield _Redis.default.setPrivateKey(clientId, _privateKey);
      return {
        privateKey: _privateKey
      };
    }
    var keyPair = yield _generateKeyPairAndCache();
    return keyPair;
  });
  return _getPrivateKey.apply(this, arguments);
}
function _generateKeyPairAndCache() {
  return _generateKeyPairAndCache2.apply(this, arguments);
}
function _generateKeyPairAndCache2() {
  _generateKeyPairAndCache2 = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var {
      publicKey,
      privateKey,
      encryptedPrivateKey
    } = yield kms.generateKeyPair();
    yield Promise.allSettled([_Redis.default.setPublicKey(clientId, publicKey), _Redis.default.setPrivateKey(clientId, privateKey), _Redis.default.setEncryptedPrivateKey(clientId, encryptedPrivateKey)]);
    return {
      publicKey,
      privateKey,
      encryptedPrivateKey,
      newKey: true
    };
  });
  return _generateKeyPairAndCache2.apply(this, arguments);
}