"use strict";
Object.defineProperties(exports, {
  emptyReadStream: {get: function() {
      return emptyReadStream;
    }},
  emptyWriteStream: {get: function() {
      return emptyWriteStream;
    }},
  emptyStreamable: {get: function() {
      return emptyStreamable;
    }},
  __esModule: {value: true}
});
var resolve = $traceurRuntime.assertObject(require('quiver-promise')).resolve;
var emptyReadStream = (function(closeErr) {
  var streamClosed = {err: closeErr};
  return {
    read: (function(callback) {
      return process.nextTick((function() {
        return callback(streamClosed);
      }));
    }),
    closeRead: (function(err) {}),
    isClosed: (function() {
      return streamClosed;
    })
  };
});
var emptyWriteStream = (function(closeErr) {
  var streamClosed = {err: closeErr};
  return {
    prepareWrite: (function(callback) {
      return process.nextTick((function() {
        return callback(streamClosed);
      }));
    }),
    write: (function(data) {}),
    closeWrite: (function(err) {}),
    isClosed: (function() {
      return streamClosed;
    })
  };
});
var emptyStreamable = (function(closeErr) {
  return ({
    reusable: true,
    contentLength: 0,
    get stream() {
      return resolve(emptyReadStream(closeErr));
    }
  });
});
