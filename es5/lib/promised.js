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
var createPromise = $traceurRuntime.assertObject(require('quiver-promise')).createPromise;
var simpleChannel = $traceurRuntime.assertObject(require('./simple.js')).simpleChannel;
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
  var $__0 = $traceurRuntime.assertObject(primitiveChannel()),
      simpleRead = $__0.readStream,
      simpleWrite = $__0.writeStream;
  var readStream = promisedReadStream(simpleRead);
  var writeStream = promisedWriteStream(simpleWrite);
  return {
    readStream: readStream,
    writeStream: writeStream
  };
});
