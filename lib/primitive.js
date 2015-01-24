let { nextTick } = process

export let primitiveChannel = () => {
  let readStream = { }
  let writeStream = { }

  let mStreamClosed = null

  let mReadCallback = null
  let mWriteCallback = null

  let mStreamInProgress = false

  let dispatchCallback = () => {
    mStreamInProgress = true
    let writerCalled = false

    let writer = (writeClosed, buffer) => {
      if(writerCalled) throw new Error('writer can only be called once')

      writerCalled = true

      if(!writeClosed && !buffer) throw new Error(
        'Must supply either writeClosed or buffer')

      if(writeClosed && buffer) throw new Error(
        'You may not supply a buffer while close the stream at the same time')

      if(writeClosed && !mStreamClosed) mStreamClosed = writeClosed

      nextTick(() => {
        mStreamInProgress = false
        let readCallback = mReadCallback
        mReadCallback = null

        readCallback(writeClosed, buffer)
      })
    }

    nextTick(() => {
      let writeCallback = mWriteCallback
      mWriteCallback = null

      writeCallback(null, writer)
    })
  }

  let dispatchIfReady = () => {
    if(mWriteCallback && mReadCallback && !mStreamInProgress)
      dispatchCallback()
  }

  let notifyStreamClosed = callback =>
    nextTick(() => {
      mStreamInProgress = false
      mReadCallback = null
      mWriteCallback = null

      callback(mStreamClosed)
    })

  readStream.read = callback => {
    if(mReadCallback || mStreamInProgress)
      throw new Error('read called multiple times without waiting for callback')

    mReadCallback = callback
    if(mStreamClosed) {
      notifyStreamClosed(callback)
    } else {
      dispatchIfReady()
    }
  }

  readStream.closeRead = err => {
    if(mReadCallback) throw new Error(
      'cannot close read stream before read callback is completed')

    if(mStreamClosed) return
    mStreamClosed = { err: err }

    if(mWriteCallback && !mStreamInProgress) {
      notifyStreamClosed(mWriteCallback)
    }
  }

  writeStream.prepareWrite = callback => {
    if(mWriteCallback) throw new Error(
      'prepareWrite called multiple times without waiting for callback')

    mWriteCallback = callback
    if(mStreamClosed) {
      notifyStreamClosed(callback)
    } else {
      dispatchIfReady()
    }
  }

  writeStream.closeWrite = err => {
    if(mWriteCallback) throw new Error(
      'cannot close write stream before write callback is completed')

    if(mStreamClosed) return
    mStreamClosed = { err: err }

    if(mReadCallback && !mStreamInProgress)
      notifyStreamClosed(mReadCallback)
  }

  let channel = {
    writeStream: writeStream,
    readStream: readStream
  }

  return channel
}
