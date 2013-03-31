
var object = require('quiver-object')

var createEmptyReadStream = function(closeErr) {
  var readStream = object.createSingleOwnershipObject()
  var streamClosed = { err: closeErr }

  readStream.read = function(callback) {
    process.nextTick(function() {
      callback(streamClosed)
    })
  }

  readStream.closeRead = function(err) { }

  readStream.isClosed = function() {
    return streamClosed
  }

  return readStream
}

var createEmptyWriteStream = function(closeErr) {
  var writeStream = object.createSingleOwnershipObject()
  var streamClosed = { err: closeErr }

  writeStream.prepareWrite = function(callback) {
    process.nextTick(function() {
      callback(streamClosed)
    })
  }

  writeStream.write = function(data) { }

  writeStream.closeWrite = function(err) { }

  writeStream.isClosed = function() {
    return streamClosed
  }

  return writeStream
}

module.exports = {
  createEmptyReadStream: createEmptyReadStream,
  createEmptyWriteStream: createEmptyWriteStream
}
