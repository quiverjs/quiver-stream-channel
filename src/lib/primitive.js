const { nextTick } = process

export const primitiveChannel = () => {
  let readStream = { }
  let writeStream = { }

  let mStreamClosed = null

  let mReadCallback = null
  let mWriteCallback = null

  let mStreamInProgress = false

  const dispatchCallback = () => {
    mStreamInProgress = true
    let writerCalled = false

    const writer = (writeClosed, buffer) => {
      if(writerCalled) throw new Error('writer can only be called once')

      writerCalled = true

      if(!writeClosed && !buffer) throw new Error(
        'Must supply either writeClosed or buffer')

      if(writeClosed && buffer) throw new Error(
        'You may not supply a buffer while close the stream at the same time')

      if(writeClosed && !mStreamClosed) mStreamClosed = writeClosed

      nextTick(() => {
        mStreamInProgress = false
        const readCallback = mReadCallback
        mReadCallback = null

        readCallback(writeClosed, buffer)
      })
    }

    nextTick(() => {
      const writeCallback = mWriteCallback
      mWriteCallback = null

      writeCallback(null, writer)
    })
  }

  const dispatchIfReady = () => {
    if(mWriteCallback && mReadCallback && !mStreamInProgress)
      dispatchCallback()
  }

  const notifyStreamClosed = callback =>
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
      'cannot close read stream before read callback is compconsted')

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
      'cannot close write stream before write callback is compconsted')

    if(mStreamClosed) return
    mStreamClosed = { err: err }

    if(mReadCallback && !mStreamInProgress)
      notifyStreamClosed(mReadCallback)
  }

  const channel = {
    writeStream: writeStream,
    readStream: readStream
  }

  return channel
}
