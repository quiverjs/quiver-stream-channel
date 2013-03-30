
var object = require('quiver-object')

var createSimpleReadStream = function(primitiveReadStream) {
  var readStream = object.createSingleOwnershipObject()
  
  var mStreamClosed = null
  var mReading = false

  readStream.read = function(callback) {
    if(mStreamClosed) {
      process.nextTick(function() {
        callback(mStreamClosed)
      })
      return
    }

    mReading = true

    primitiveReadStream.read(function(readClosed, buffer) {
      if(mStreamClosed && !readClosed) primitiveReadStream.closeRead(mStreamClosed.err)
      if(!mStreamClosed && readClosed) mStreamClosed = readClosed

      mReading = false
      callback(readClosed, buffer)
    })
  }

  readStream.closeRead = function(err) {
    if(mStreamClosed) return

    mStreamClosed = { err: err }
    if(!mReading) primitiveReadStream.closeRead(err)
  }

  readStream.isClosed = function() {
    return mStreamClosed
  }

  return readStream
}

var throwInconsistentStateError = function() {
  throw new Error('critical bug: inconsistent write stream state')
}

var createSimpleWriteStream = function(primitiveWriteStream) {
  var writeStream = object.createSingleOwnershipObject()
  primitiveWriteStream.acquireOwnership(writeStream)

  var mPrimitiveWriter = null
  var mStreamClosed = null

  var mIsClosing = false
  var mIsClosed = false

  var mFlushingWrite = false

  var mWriteQueue = []
  var mWriteCallback = null

  var mWriter = function(streamClosed, buffer) {
    if(!streamClosed && !buffer) throw new Error(
      'must supply either a buffer or close stream to writer')

    if(buffer) writeStream.write(buffer)
    if(streamClosed) writeStream.closeWrite(streamClosed)
  }

  var callWriteCallback = function(streamClosed, writer) {
    var writeCallback = mWriteCallback
    mWriteCallback = null
    writeCallback(streamClosed, writer)
  }

  var doPrimitiveWrite = function(writeClosed, data) {
    mPrimitiveWriter(writeClosed, data)
    mPrimitiveWriter = null
  }

  // If in the middle of writing the read stream is closed,
  // We want to discard all pending buffers
  var handleReadClosed = function(readClosed) {
    mWriteQueue = []
    mIsClosed = true

    if(!mStreamClosed) mStreamClosed = readClosed
    
    if(mWriteCallback) {
      callWriteCallback(readClosed)
    }
  }

  var flushNextWrite = function() {
    if(mWriteQueue.length > 0) {
      primitiveWriteStream.prepareWrite(function(readClosed, writer) {
        if(readClosed) return handleReadClosed(readClosed)

        var buffer = mWriteQueue.shift()
        writer(null, buffer)
        flushNextWrite()
      })
    } else if(mIsClosing && !mIsClosed) {
      primitiveWriteStream.prepareWrite(function(readClosed, writer) {
        mIsClosed = true

        if(readClosed) return

        writer(mWriteClosed)

        mFlushingWrite = false
      })
    } else if(mWriteCallback) {
      primitiveWriteStream.prepareWrite(function(readClosed, writer) {
        mFlushingWrite = false
        
        if(readClosed) return handleReadClosed(readClosed)

        mPrimitiveWriter = writer
        callWriteCallback(readClosed, mWriter)
      })
    } else {
      mFlushingWrite = false
    } 
  }

  var flushWrite = function() {
    if(!mFlushingWrite) {
      mFlushingWrite = true
      flushNextWrite()
    }
  }

  writeStream.prepareWrite = function(callback) {
    if(mWriteCallback) throw new Error(
      'previous prepareWrite has not been completed')

    if(mIsClosing || mIsClosed) {
      process.nextTick(function() {
        callback(mStreamClosed)
      })
      return
    }

    mWriteCallback = callback

    // User can't call write() after prepareWrite() until
    // the write callback is called.
    // However calls to previous write() could still be 
    // flushing and so we should only call primitive
    // prepareWrite when all buffer queues is flushed.
    if(mFlushingWrite) return

    primitiveWriteStream.prepareWrite(function(readClosed, primitiveWriter) {
      if(readClosed) return handleReadClosed(readClosed)

      // It is impossible to have any buffer in the write queue
      // as primitive prepare write is only called after the flushing
      // is completed and it is not allowed to write anything meanwhile.
      if(mFlushingWrite) throwInconsistentStateError()

      // The caller may close the stream while waiting for prepareWrite,
      // thereby cancelling the callback
      if(mIsClosed) return primitiveWriter(mStreamClosed)

      mPrimitiveWriter = primitiveWriter
      
      callWriteCallback(null, mWriter)
    })
  }

  writeStream.write = function(buffer) {
    // User can't call write() after prepareWrite() until
    // the write callback is called.
    if(mWriteCallback) throw new Error(
      'Cannot write and prepare write at the same time')

    // We ignore writes to stream that is already closed
    // Notice that the primitive stream might not yet been
    // closed after simple stream is closed, as there 
    // might be write buffers still queuing to be flushed.
    if(mIsClosing || mIsClosed) return

    // If there is a primitve writer, then the write is 
    // called right after the write callback is invoked
    if(mPrimitiveWriter) {
      doPrimitiveWrite(null, buffer)
      return
    }

    // Otherwise we put the buffer into the write queue
    mWriteQueue.push(buffer)
    flushWrite()
  }

  writeStream.closeWrite = function(err) {
    if(mIsClosed || mIsClosing) return

    mIsClosing = true

    if(mStreamClosed) throwInconsistentStateError()

    var writeClosed = { err: err }
    mStreamClosed = writeClosed

    // cancel write callback
    if(mWriteCallback) {
      mWriteCallback = null
    }

    if(mPrimitiveWriter) {
      doPrimitiveWrite(mStreamClosed)
      mIsClosed = true
    } else if(!mFlushingWrite) {
      primitiveWriteStream.prepareWrite(function(readClosed, writer) {
        if(readClosed) return
        writer(mStreamClosed)
      })
    }

  }

  writeStream.isClosed = function() {
    return mWriteClosed
  }

  return writeStream
}

exports.createSimpleReadStream = createSimpleReadStream
exports.createSimpleWriteStream = createSimpleWriteStream