"use strict";
Object.defineProperties(exports, {
  promisedReadStream: {get: function() {
      return promisedReadStream;
    }},
  promisedWriteStream: {get: function() {
      return promisedWriteStream;
    }},
  promisedChannel: {get: function() {
      return promisedChannel;
    }},
  __esModule: {value: true}
});
var $__quiver_45_promise__,
    $__simple__;
var createPromise = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).createPromise;
var simpleChannel = ($__simple__ = require("./simple"), $__simple__ && $__simple__.__esModule && $__simple__ || {default: $__simple__}).simpleChannel;
var promisedReadStream = (function(simpleReadStream) {
  return ({
    read: (function() {
      return createPromise((function(resolve, reject) {
        return simpleReadStream.read((function(readClosed, data) {
          if (!readClosed) {
            resolve({data: data});
          } else if (!readClosed.err) {
            resolve({closed: true});
          } else {
            reject(readClosed.err);
          }
        }));
      }));
    }),
    closeRead: simpleReadStream.closeRead,
    isClosed: simpleReadStream.isClosed
  });
});
var promisedWriteStream = (function(simpleWriteStream) {
  return ({
    prepareWrite: (function() {
      return createPromise((function(resolve, reject) {
        return simpleWriteStream.prepareWrite((function(writeClosed) {
          if (!writeClosed) {
            resolve({});
          } else if (!writeClosed.err) {
            resolve({closed: true});
          } else {
            reject(writeClosed.err);
          }
        }));
      }));
    }),
    write: simpleWriteStream.write,
    closeWrite: simpleWriteStream.closeWrite,
    isClosed: simpleWriteStream.isClosed
  });
});
var promisedChannel = (function() {
  var $__2 = simpleChannel(),
      simpleRead = $__2.readStream,
      simpleWrite = $__2.writeStream;
  var readStream = promisedReadStream(simpleRead);
  var writeStream = promisedWriteStream(simpleWrite);
  return {
    readStream: readStream,
    writeStream: writeStream
  };
});
