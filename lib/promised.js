import { createPromise } from 'quiver-promise'
import { simpleChannel } from './simple.js'

export var promisedReadStream = (simpleReadStream) => ({
  read: () =>
    createPromise((resolve, reject) =>
      simpleReadStream.read((readClosed, data) => {
        if(!readClosed) {
          resolve({data})
        } else if(!readClosed.err) {
          resolve({closed: true})
        } else {
          reject(readClosed.err)
        }
      })),

  closeRead: simpleReadStream.closeRead,
  isClosed: simpleReadStream.isClosed
})

export var promisedWriteStream = (simpleWriteStream) => ({
  prepareWrite: () =>
    createPromise((resolve, reject) =>
      simpleWriteStream.prepareWrite(writeClosed => {
        if(!writeClosed) {
          resolve({})
        } else if(!writeClosed.err) {
          resolve({ closed: true })
        } else {
          reject(writeClosed.err)
        }
      })),

  write: simpleWriteStream.write,
  closeWrite: simpleWriteStream.closeWrite,
  isClosed: simpleWriteStream.isClosed
})

export var promisedChannel = () => {
  var { 
    readStream: simpleRead,
    writeStream: simpleWrite
  } = primitiveChannel()

  var readStream = promisedReadStream(simpleRead)
  var writeStream = promisedWriteStream(simpleWrite)

  return { readStream, writeStream }
}