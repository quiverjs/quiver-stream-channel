import { resolve } from 'quiver-promise'

export var emptyReadStream = closeErr => {
  var streamClosed = { err: closeErr }

  return {
    read: callback =>
      process.nextTick(() => callback(streamClosed)),

    closeRead: err => { },

    isClosed: () => streamClosed
  }
}

export var emptyWriteStream = closeErr => {
  var streamClosed = { err: closeErr }
  
  return {
    prepareWrite: callback =>
      process.nextTick(() => callback(streamClosed)),

    write: data => { },
    closeWrite: err => { },
    isClosed: () => streamClosed
  }
}

export var emptyStreamable = closeErr => ({
  reusable: true,
  contentLength: 0,
  get stream() {
    return resolve(emptyReadStream(closeErr))
  }
})
