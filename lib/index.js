const request = require('request');
const iconv = require('iconv-lite');
const fs = require('fs');
const gm = require('gm');
const config = require('./config');

class Memobird {
  constructor(config = {}) {
    this.ak = config.ak;
    this.memobirdID = config.memobirdID;
    this.useridentifying = config.useridentifying;
  }

  get timestamp() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const MM = date.getMonth() + 1;
    const dd = date.getDate();
    const hh = date.getHours();
    const mm = date.getMinutes();
    const ss = date.getSeconds();
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
  }

  init() {
    return new Promise((resolve, reject) => {
      request.post({
        url: config.url.bind,
        form: {
          ak: this.ak,
          timestamp: this.timestamp,
          memobirdID: this.memobirdID,
          useridentifying: this.useridentifying,
        },
      }, (error, response, body) => {
        const { statusCode } = response;
        const { showapi_res_code, showapi_res_error, showapi_userid } = JSON.parse(body);
        if (error || statusCode !== 200 || showapi_res_code === 0) {
          reject({error, statusCode, showapi_res_code, showapi_res_error});
        } else {
          this.userID = showapi_userid;
          resolve(showapi_userid);
        }
      });
    });
  }

  print(printcontent) {
    return new Promise((resolve, reject) => {
      request.post({
        url: config.url.print,
        form: {
          ak: this.ak,
          timestamp: this.timestamp,
          memobirdID: this.memobirdID,
          userID: this.userID,
          printcontent,
        },
      }, (error, response, body) => {
        const { statusCode } = response;
        const { showapi_res_code, showapi_res_error, result, smartGuid, printcontentid } = JSON.parse(body);
        if (error || statusCode !== 200 || showapi_res_code === 0) {
          reject(error, statusCode, showapi_res_code, showapi_res_error);
        } else {
          resolve(printcontentid);
        }
      });
    });
  }

  getPrintStatus(printcontentid) {
    return new Promise((resolve, reject) => {
      request.post({
        url: config.url.watch,
        form: {
          ak: this.ak,
          timestamp: this.timestamp,
          memobirdID: this.memobirdID,
          printcontentid,
        },
      }, (error, response, body) => {
        const { statusCode } = response;
        const { showapi_res_code, showapi_res_error, printflag, printcontentID } = JSON.parse(body);
        if (error || statusCode !== 200 || showapi_res_code === 0) {
          reject(error, statusCode, showapi_res_code, showapi_res_error);
        } else {
          resolve(printflag);
        }
      });
    });
  }

  glance(printcontentid, delay = 1000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.getPrintStatus(printcontentid)
          .then(printflag => resolve(printflag))
          .catch(error => reject(error));
      }, delay);
    });
  }

  watch(printcontentid, delay = 3000, maxDelay = 15000) {
    return new Promise((resolve, reject) => {
      let totalDelay = 0;
      const watcher = setInterval(() => {
        this.getPrintStatus(printcontentid)
          .then(printflag => {
            if (printflag === 1 || totalDelay >= maxDelay) {
              clearInterval(watcher);
              resolve(printflag);
            }
            totalDelay += delay;
          })
          .catch(error => reject(error));
      }, delay);
    });
  }

  encodeText(text) {
    return `T:${iconv.encode(`${text}\n`, 'gbk').toString('base64')}`;
  }

  encodeImage(imagePath) {
    return new Promise(function(resolve, reject) {
      if (imagePath.indexOf('http://') === -1 && imagePath.indexOf('https://') === -1) {
        try {
          fs.readFileSync(imagePath);
        } catch (error) {
          reject(error);
        }
        gm(imagePath).resize(384).flip().type('Grayscale').colors(2).toBuffer('bmp', (error, buffer) => {
          if (error) {
            reject(error);
          } else {
            resolve(`P:${buffer.toString('base64')}`);
          }
        });
      } else {
        request(imagePath, { encoding: null }, (error, response, bodyBuffer) => {
          if (error) {
            reject(error);
          } else {
            gm(bodyBuffer).resize(384).flip().type('Grayscale').colors(2).toBuffer('bmp', (error, buffer) => {
              if (error) {
                reject(error);
              } else {
                resolve(`P:${buffer.toString('base64')}`);
              }
            });
          }
        });
      }
    });
  }

  printText(text) {
    const content = this.encodeText(text);
    return this.print(content);
  }

  printImage(imagePath) {
    return this.encodeImage(imagePath).then((content) => this.print(content));
  }
}
