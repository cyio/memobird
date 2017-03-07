'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var iconv = require('iconv-lite');
var fs = require('fs');
var gm = require('gm');
var config = require('./config');

var Memobird = function () {
  function Memobird() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Memobird);

    this.ak = config.ak;
    this.memobirdID = config.memobirdID;
    this.useridentifying = config.useridentifying;
  }

  _createClass(Memobird, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        request.post({
          url: config.api.bind,
          form: {
            ak: _this.ak,
            timestamp: _this.timestamp,
            memobirdID: _this.memobirdID,
            useridentifying: _this.useridentifying
          }
        }, function (error, response, body) {
          var statusCode = response.statusCode;

          var _JSON$parse = JSON.parse(body),
              showapi_res_code = _JSON$parse.showapi_res_code,
              showapi_res_error = _JSON$parse.showapi_res_error,
              showapi_userid = _JSON$parse.showapi_userid;

          if (error || statusCode !== 200 || showapi_res_code === 0) {
            reject({ error: error, statusCode: statusCode, showapi_res_code: showapi_res_code, showapi_res_error: showapi_res_error });
          } else {
            _this.userID = showapi_userid;
            resolve(showapi_userid);
          }
        });
      });
    }
  }, {
    key: 'print',
    value: function print(printcontent) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        request.post({
          url: config.api.print,
          form: {
            ak: _this2.ak,
            timestamp: _this2.timestamp,
            memobirdID: _this2.memobirdID,
            userID: _this2.userID,
            printcontent: printcontent
          }
        }, function (error, response, body) {
          var statusCode = response.statusCode;

          var _JSON$parse2 = JSON.parse(body),
              showapi_res_code = _JSON$parse2.showapi_res_code,
              showapi_res_error = _JSON$parse2.showapi_res_error,
              result = _JSON$parse2.result,
              smartGuid = _JSON$parse2.smartGuid,
              printcontentid = _JSON$parse2.printcontentid;

          if (error || statusCode !== 200 || showapi_res_code === 0) {
            reject(error, statusCode, showapi_res_code, showapi_res_error);
          } else {
            resolve(printcontentid);
          }
        });
      });
    }
  }, {
    key: 'getPrintStatus',
    value: function getPrintStatus(printcontentid) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        request.post({
          url: config.api.watch,
          form: {
            ak: _this3.ak,
            timestamp: _this3.timestamp,
            memobirdID: _this3.memobirdID,
            printcontentid: printcontentid
          }
        }, function (error, response, body) {
          var statusCode = response.statusCode;

          var _JSON$parse3 = JSON.parse(body),
              showapi_res_code = _JSON$parse3.showapi_res_code,
              showapi_res_error = _JSON$parse3.showapi_res_error,
              printflag = _JSON$parse3.printflag,
              printcontentID = _JSON$parse3.printcontentID;

          if (error || statusCode !== 200 || showapi_res_code === 0) {
            reject(error, statusCode, showapi_res_code, showapi_res_error);
          } else {
            resolve(printflag);
          }
        });
      });
    }
  }, {
    key: 'glance',
    value: function glance(printcontentid) {
      var _this4 = this;

      var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;

      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          _this4.getPrintStatus(printcontentid).then(function (printflag) {
            return resolve(printflag);
          }).catch(function (error) {
            return reject(error);
          });
        }, delay);
      });
    }
  }, {
    key: 'watch',
    value: function watch(printcontentid) {
      var _this5 = this;

      var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;
      var maxDelay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 15000;

      return new Promise(function (resolve, reject) {
        var totalDelay = 0;
        var watcher = setInterval(function () {
          _this5.getPrintStatus(printcontentid).then(function (printflag) {
            if (printflag === 1 || totalDelay >= maxDelay) {
              clearInterval(watcher);
              resolve(printflag);
            }
            totalDelay += delay;
          }).catch(function (error) {
            clearInterval(watcher);
            reject(error);
          });
        }, delay);
      });
    }
  }, {
    key: 'encodeText',
    value: function encodeText(text) {
      return 'T:' + iconv.encode(text + '\n', 'gbk').toString('base64');
    }
  }, {
    key: 'encodeImage',
    value: function encodeImage(imagePath) {
      return new Promise(function (resolve, reject) {
        if (imagePath.indexOf('http://') === -1 && imagePath.indexOf('https://') === -1) {
          try {
            fs.readFileSync(imagePath);
          } catch (error) {
            reject(error);
          }
          gm(imagePath).resize(384).flip().type('Grayscale').colors(2).toBuffer('bmp', function (error, buffer) {
            if (error) {
              reject(error);
            } else {
              resolve('P:' + buffer.toString('base64'));
            }
          });
        } else {
          request(imagePath, { encoding: null }, function (error, response, bodyBuffer) {
            if (error) {
              reject(error);
            } else {
              gm(bodyBuffer).resize(384).flip().type('Grayscale').colors(2).toBuffer('bmp', function (error, buffer) {
                if (error) {
                  reject(error);
                } else {
                  resolve('P:' + buffer.toString('base64'));
                }
              });
            }
          });
        }
      });
    }
  }, {
    key: 'printText',
    value: function printText(text) {
      var content = this.encodeText(text);
      return this.print(content);
    }
  }, {
    key: 'printImage',
    value: function printImage(imagePath) {
      var _this6 = this;

      return this.encodeImage(imagePath).then(function (content) {
        return _this6.print(content);
      });
    }
  }, {
    key: 'timestamp',
    get: function get() {
      var date = new Date();
      var yyyy = date.getFullYear();
      var MM = date.getMonth() + 1;
      var dd = date.getDate();
      var hh = date.getHours();
      var mm = date.getMinutes();
      var ss = date.getSeconds();
      return yyyy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss;
    }
  }]);

  return Memobird;
}();

module.exports = Memobird;