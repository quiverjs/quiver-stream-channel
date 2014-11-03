"use strict";
Object.defineProperties(exports, {
  simpleReadStream: {get: function() {
      return simpleReadStream;
    }},
  simpleWriteStream: {get: function() {
      return simpleWriteStream;
    }},
  simpleChannel: {get: function() {
      return simpleChannel;
    }},
  __esModule: {value: true}
});
var $__primitive__;
var primitiveChannel = ($__primitive__ = require("./primitive"), $__primitive__ && $__primitive__.__esModule && $__primitive__ || {default: $__primitive__}).primitiveChannel;
var throwInconsistentStateError = (function() {
  throw new Error('critical bug: inconsistent write stream state');
});
var simpleReadStream = (function(primitiveReadStream) {
  var readStream = {};
  var mStreamClosed = null;
  var mReading = false;
  readStream.read = (function(callback) {
    if (mStreamClosed) {
      process.nextTick((function() {
        return callback(mStreamClosed);
      }));
      return;
    }
    mReading = true;
    primitiveReadStream.read((function(readClosed, data) {
      if (mStreamClosed && !readClosed)
        primitiveReadStream.closeRead(mStreamClosed.err);
      if (!mStreamClosed && readClosed)
        mStreamClosed = readClosed;
      mReading = false;
      callback(readClosed, data);
    }));
  });
  readStream.closeRead = (function(err) {
    if (mStreamClosed)
      return;
    mStreamClosed = {err: err};
    if (!mReading)
      primitiveReadStream.closeRead(err);
  });
  readStream.isClosed = (function() {
    return mStreamClosed != null;
  });
  return readStream;
});
var simpleWriteStream = (function(primitiveWriteStream) {
  var writeStream = {};
  var mPrimitiveWriter = null;
  var mStreamClosed = null;
  var mIsClosing = false;
  var mIsClosed = false;
  var mFlushingWrite = false;
  var mWriteQueue = [];
  var mWriteCallback = null;
  var mWriter = (function(streamClosed, data) {
    if (!streamClosed && !data)
      throw new Error('must supply either a data or close stream to writer');
    if (data)
      writeStream.write(data);
    if (streamClosed)
      writeStream.closeWrite(streamClosed.err);
  });
  var callWriteCallback = (function(streamClosed, writer) {
    var writeCallback = mWriteCallback;
    mWriteCallback = null;
    writeCallback(streamClosed, writer);
  });
  var doPrimitiveWrite = (function(writeClosed, data) {
    mPrimitiveWriter(writeClosed, data);
    mPrimitiveWriter = null;
  });
  var handleReadClosed = (function(readClosed) {
    mWriteQueue = [];
    mIsClosed = true;
    if (!mStreamClosed)
      mStreamClosed = readClosed;
    if (mWriteCallback) {
      callWriteCallback(readClosed);
    }
  });
  var flushNextWrite = (function() {
    if (mWriteQueue.length > 0) {
      primitiveWriteStream.prepareWrite((function(readClosed, writer) {
        if (readClosed)
          return handleReadClosed(readClosed);
        var data = mWriteQueue.shift();
        writer(null, data);
        flushNextWrite();
      }));
    } else if (mIsClosing && !mIsClosed) {
      primitiveWriteStream.prepareWrite((function(readClosed, writer) {
        mIsClosed = true;
        if (readClosed)
          return;
        writer(mStreamClosed);
        mFlushingWrite = false;
      }));
    } else if (mWriteCallback) {
      primitiveWriteStream.prepareWrite((function(readClosed, writer) {
        mFlushingWrite = false;
        if (readClosed)
          return handleReadClosed(readClosed);
        mPrimitiveWriter = writer;
        callWriteCallback(readClosed, mWriter);
      }));
    } else {
      mFlushingWrite = false;
    }
  });
  var flushWrite = (function() {
    if (!mFlushingWrite) {
      mFlushingWrite = true;
      flushNextWrite();
    }
  });
  writeStream.prepareWrite = (function(callback) {
    if (mWriteCallback)
      throw new Error('previous prepareWrite has not been completed');
    if (mIsClosing || mIsClosed) {
      process.nextTick((function() {
        callback(mStreamClosed);
      }));
      return;
    }
    mWriteCallback = callback;
    if (mFlushingWrite)
      return;
    primitiveWriteStream.prepareWrite((function(readClosed, primitiveWriter) {
      if (readClosed)
        return handleReadClosed(readClosed);
      if (mFlushingWrite)
        throwInconsistentStateError();
      if (mIsClosed)
        return primitiveWriter(mStreamClosed);
      mPrimitiveWriter = primitiveWriter;
      callWriteCallback(null, mWriter);
    }));
  });
  writeStream.write = (function(data) {
    if (mWriteCallback)
      throw new Error('Cannot write and prepare write at the same time');
    if (mIsClosing || mIsClosed)
      return;
    if (mPrimitiveWriter) {
      doPrimitiveWrite(null, data);
      return;
    }
    mWriteQueue.push(data);
    flushWrite();
  });
  writeStream.closeWrite = (function(err) {
    if (mIsClosed || mIsClosing)
      return;
    mIsClosing = true;
    if (mStreamClosed)
      throwInconsistentStateError();
    var writeClosed = {err: err};
    mStreamClosed = writeClosed;
    if (mWriteCallback) {
      mWriteCallback = null;
      if (!mPrimitiveWriter) {
        mIsClosed = true;
        return;
      }
    }
    if (mPrimitiveWriter) {
      doPrimitiveWrite(mStreamClosed);
      mIsClosed = true;
    } else if (!mFlushingWrite) {
      primitiveWriteStream.prepareWrite((function(readClosed, writer) {
        if (readClosed)
          return;
        writer(mStreamClosed);
      }));
    }
  });
  writeStream.isClosed = (function() {
    return mStreamClosed != null;
  });
  return writeStream;
});
var simpleChannel = (function() {
  var $__1 = primitiveChannel(),
      primitiveRead = $__1.readStream,
      primitiveWrite = $__1.writeStream;
  var readStream = simpleReadStream(primitiveRead);
  var writeStream = simpleWriteStream(primitiveWrite);
  return {
    readStream: readStream,
    writeStream: writeStream
  };
});
