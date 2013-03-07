
var object = require('quiver-object')

var createSimpleReadStream = function(primitiveReadStream) {
  var readStream = object.createSingleOwnershipObject()
  
  var readClosed = null
  var reading = false

  readStream.read = function(callback) {
    if(readClosed) {
      process.nextTick(function() {
        callback(readClosed)
      })
    }

    reading = true

    primitiveReadStream.read(function(streamClosed, buffer) {
      if(readClosed && !streamClosed) primitiveReadStream.closeRead(readClosed.err)
      if(streamClosed && readClosed) readClosed = streamClosed

      reading = false
      callback(streamClosed, buffer)
    })
  }

  readStream.closeRead = function(err) {
    if(readClosed) return

    readClosed = { err: err }
    if(!reading) primitiveReadStream.closeRead(err)
  }

  return readStream
}

var createSimpleWriteStream = function(primitiveWriteStream) {
  var writeStream = object.createSingleOwnershipObject()

  var primitiveWriter = null
  var writeClosed = null

  var flushingWrite = false

  var writeQueue = []
  var writeCallback = null

  var flushNextWrite = function() {
    if(writeQueue.length == 0) {
      if(writeClosed) {
        primitiveWriteStream.prepareWrite(function(writer) {
          writer(writeClosed)
        })
      }

      flushingWrite = false
    } else {
      var buffer = writeQueue.shift()
      primitiveWriteStream.prepareWrite(function(writer) {
        writer(null, buffer)
        flushNextWrite()
      })
    }
  }

  var flushWrite = function() {
    if(!flushingWrite) flushNextWrite()
  }

  var writer = function(streamClosed, buffer) {
    if(!buffer && !streamClosed) throw new Error(
      'must supply either a buffer or close stream to writer')

    if(buffer) writeStream.write(buffer)
    if(streamClosed) writeStream.closeWrite(streamClosed)
  }

  writeStream.prepareWrite = function(callback) {
    if(writeCallback) throw new Error(
      'previous prepareWrite has not been completed')

    writeCallback = callback
    if(flushingWrite) return

    primitiveWriteStream.prepareWrite(function(_primitiveWriter) {
      if(writeClosed) {
        writeCallback = null
        _primitiveWriter(writeClosed)
        return
      }

      primitiveWriter = _primitiveWriter
      var _writeCallback = writeCallback
      writeCallback = null
      _writeCallback(writer)
    })
  }

  writeStream.write = function(buffer) {
    if(writeCallback) throw new Error(
      'Cannot write and prepare write at the same time')

    if(primitiveWriter) {
      primitiveWriter(null, buffer)
      primitiveWriter = null
      return
    }

    writeQueue.push(buffer)
    flushWrite()
  }

  writeStream.closeWrite = function(streamClosed) {
    if(writeClosed) return

    writeClosed = streamClosed

    if(primitiveWriter) {
      primitiveWriter(streamClosed)
      primitiveWriter = null
      return
    }

    flushWrite()
  }

  return writeStream
}