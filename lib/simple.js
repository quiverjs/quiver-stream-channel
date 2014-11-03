import { primitiveChannel } from './primitive'

var throwInconsistentStateError = () => {
  throw new Error('critical bug: inconsistent write stream state')
}

export var simpleReadStream = primitiveReadStream => {
  var readStream = { }

  var mStreamClosed = null
  var mReading = false

  readStream.read = callback => {
    if(mStreamClosed) {
      process.nextTick(() => callback(mStreamClosed))
      return
    }

    mReading = true

    primitiveReadStream.read((readClosed, data) => {
      if(mStreamClosed && !readClosed)
        primitiveReadStream.closeRead(mStreamClosed.err)

      if(!mStreamClosed && readClosed)
        mStreamClosed = readClosed

      mReading = false
      callback(readClosed, data)
    })
  }

  readStream.closeRead = err => {
    if(mStreamClosed) return

    mStreamClosed = { err: err }
    if(!mReading) primitiveReadStream.closeRead(err)
  }

  readStream.isClosed = () =>
    mStreamClosed != null

  return readStream
}

export var simpleWriteStream = primitiveWriteStream => {
  var writeStream = { }

  var mPrimitiveWriter = null
  var mStreamClosed = null

  var mIsClosing = false
  var mIsClosed = false

  var mFlushingWrite = false

  var mWriteQueue = []
  var mWriteCallback = null

  var mWriter = (streamClosed, data) => {
    if(!streamClosed && !data) throw new Error(
      'must supply either a data or close stream to writer')

    if(data) writeStream.write(data)
    if(streamClosed) writeStream.closeWrite(streamClosed.err)
  }

  var callWriteCallback = (streamClosed, writer) => {
    var writeCallback = mWriteCallback
    mWriteCallback = null
    writeCallback(streamClosed, writer)
  }

  var doPrimitiveWrite = (writeClosed, data) => {
    mPrimitiveWriter(writeClosed, data)
    mPrimitiveWriter = null
  }

  // If in the middle of writing the read stream is closed,
  // We want to discard all pending data
  var handleReadClosed = (readClosed) => {
    mWriteQueue = []
    mIsClosed = true

    if(!mStreamClosed) mStreamClosed = readClosed

    if(mWriteCallback) {
      callWriteCallback(readClosed)
    }
  }

  var flushNextWrite = () => {
    if(mWriteQueue.length > 0) {
      primitiveWriteStream.prepareWrite((readClosed, writer) => {
        if(readClosed) return handleReadClosed(readClosed)

        var data = mWriteQueue.shift()
        writer(null, data)
        flushNextWrite()
      })
    } else if(mIsClosing && !mIsClosed) {
      primitiveWriteStream.prepareWrite((readClosed, writer) => {
        mIsClosed = true

        if(readClosed) return

        writer(mStreamClosed)

        mFlushingWrite = false
      })
    } else if(mWriteCallback) {
      primitiveWriteStream.prepareWrite((readClosed, writer) => {
        mFlushingWrite = false

        if(readClosed) return handleReadClosed(readClosed)

        mPrimitiveWriter = writer
        callWriteCallback(readClosed, mWriter)
      })
    } else {
      mFlushingWrite = false
    }
  }

  var flushWrite = () => {
    if(!mFlushingWrite) {
      mFlushingWrite = true
      flushNextWrite()
    }
  }

  writeStream.prepareWrite = callback => {
    if(mWriteCallback) throw new Error(
      'previous prepareWrite has not been completed')

    if(mIsClosing || mIsClosed) {
      process.nextTick(() => {
        callback(mStreamClosed)
      })
      return
    }

    mWriteCallback = callback

    // User can't call write() after prepareWrite() until
    // the write callback is called.
    // However calls to previous write() could still be
    // flushing and so we should only call primitive
    // prepareWrite when all data queues is flushed.
    if(mFlushingWrite) return

    primitiveWriteStream.prepareWrite((readClosed, primitiveWriter) => {
      if(readClosed) return handleReadClosed(readClosed)

      // It is impossible to have any data in the write queue
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

  writeStream.write = data => {
    // User can't call write() after prepareWrite() until
    // the write callback is called.
    if(mWriteCallback) throw new Error(
      'Cannot write and prepare write at the same time')

    // We ignore writes to stream that is already closed
    // Notice that the primitive stream might not yet been
    // closed after simple stream is closed, as there
    // might be write data still queuing to be flushed.
    if(mIsClosing || mIsClosed) return

    // If there is a primitve writer, then the write is
    // called right after the write callback is invoked
    if(mPrimitiveWriter) {
      doPrimitiveWrite(null, data)
      return
    }

    // Otherwise we put the data into the write queue
    mWriteQueue.push(data)
    flushWrite()
  }

  writeStream.closeWrite = err => {
    if(mIsClosed || mIsClosing) return

    mIsClosing = true

    if(mStreamClosed) throwInconsistentStateError()

    var writeClosed = { err: err }
    mStreamClosed = writeClosed

    // cancel write callback
    if(mWriteCallback) {
      mWriteCallback = null

      if(!mPrimitiveWriter) {
        mIsClosed = true
        return
      }
    }

    if(mPrimitiveWriter) {
      doPrimitiveWrite(mStreamClosed)
      mIsClosed = true
    } else if(!mFlushingWrite) {
      primitiveWriteStream.prepareWrite((readClosed, writer) => {
        if(readClosed) return
        writer(mStreamClosed)
      })
    }

  }

  writeStream.isClosed = () =>
    mStreamClosed != null

  return writeStream
}

export var simpleChannel = () => {
  var { 
    readStream: primitiveRead,
    writeStream: primitiveWrite
  } = primitiveChannel()

  var readStream = simpleReadStream(primitiveRead)
  var writeStream = simpleWriteStream(primitiveWrite)

  return { readStream, writeStream }
}