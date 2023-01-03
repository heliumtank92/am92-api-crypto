"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _moment = _interopRequireDefault(require("moment"));
var _redis = _interopRequireDefault(require("@am92/redis"));
var _CONFIG = _interopRequireDefault(require("../CONFIG.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var {
  MODE,
  REDIS_CONFIG,
  KEY_ROTATION_IN_DAYS,
  PLAINTETX_KEY_CACHE_IN_SECS
} = _CONFIG.default;
var redisSdk;
var Redis = {
  initialize,
  getPublicKey,
  setPublicKey,
  getPrivateKey,
  setPrivateKey,
  getEncryptedPrivateKey,
  setEncryptedPrivateKey
};
var _default = Redis;
exports.default = _default;
function initialize() {
  return _initialize.apply(this, arguments);
}
function _initialize() {
  _initialize = _asyncToGenerator(function* () {
    if (MODE === 'DYNAMIC') {
      redisSdk = new _redis.default(REDIS_CONFIG);
      yield redisSdk.initialize;
    }
  });
  return _initialize.apply(this, arguments);
}
function getPublicKey() {
  return _getPublicKey.apply(this, arguments);
}
function _getPublicKey() {
  _getPublicKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var redisKey = "AC_".concat(clientId, "_PUB");
    return redisSdk.get(redisKey);
  });
  return _getPublicKey.apply(this, arguments);
}
function setPublicKey() {
  return _setPublicKey.apply(this, arguments);
}
function _setPublicKey() {
  _setPublicKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var redisKey = "AC_".concat(clientId, "_PUB");
    var ttlInSecs = _getKeyRoationExpiry();
    return redisSdk.setAndExpire(redisKey, key, ttlInSecs);
  });
  return _setPublicKey.apply(this, arguments);
}
function getPrivateKey() {
  return _getPrivateKey.apply(this, arguments);
}
function _getPrivateKey() {
  _getPrivateKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var redisKey = "AC_".concat(clientId, "_PVT");
    return redisSdk.get(redisKey);
  });
  return _getPrivateKey.apply(this, arguments);
}
function setPrivateKey() {
  return _setPrivateKey.apply(this, arguments);
}
function _setPrivateKey() {
  _setPrivateKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var redisKey = "AC_".concat(clientId, "_PVT");
    var ttlInSecs = _getPlaintextKeyExpiry();
    return redisSdk.setAndExpire(redisKey, key, ttlInSecs);
  });
  return _setPrivateKey.apply(this, arguments);
}
function getEncryptedPrivateKey() {
  return _getEncryptedPrivateKey.apply(this, arguments);
}
function _getEncryptedPrivateKey() {
  _getEncryptedPrivateKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var redisKey = "AC_".concat(clientId, "_ENC_PVT");
    return redisSdk.get(redisKey);
  });
  return _getEncryptedPrivateKey.apply(this, arguments);
}
function setEncryptedPrivateKey() {
  return _setEncryptedPrivateKey.apply(this, arguments);
}
function _setEncryptedPrivateKey() {
  _setEncryptedPrivateKey = _asyncToGenerator(function* () {
    var clientId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var redisKey = "AC_".concat(clientId, "_ENC_PVT");
    var ttlInSecs = _getKeyRoationExpiry();
    return redisSdk.setAndExpire(redisKey, key, ttlInSecs);
  });
  return _setEncryptedPrivateKey.apply(this, arguments);
}
function _getKeyRoationExpiry() {
  var now = (0, _moment.default)();
  var ttlInSecs = (0, _moment.default)().add(KEY_ROTATION_IN_DAYS, 'days').endOf('day').diff(now, 'seconds');
  return ttlInSecs;
}
function _getPlaintextKeyExpiry() {
  var now = (0, _moment.default)();
  var diffInsec = (0, _moment.default)().endOf('day').diff(now, 'seconds');
  return Math.min(diffInsec, PLAINTETX_KEY_CACHE_IN_SECS);
}