import { createPromise } from 'quiver-promise'
import { simpleChannel } from './simple'

export let promisedReadStream = (simpleReadStream) => ({
  read: () =>
    createPromise((resolve, reject) =>
      simpleReadStream.read((readClosed, data) => {
        if(!readClosed) {
          resolve({data})
        } else if(!readClosed.err) {
          resolve({ closed: true })
        } else {
          reject(readClosed.err)
        }
      })),

  closeRead: simpleReadStream.closeRead,
  isClosed: simpleReadStream.isClosed
})

export let promisedWriteStream = (simpleWriteStream) => ({
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

export let promisedChannel = () => {
  let { 
    readStream: simpleRead,
    writeStream: simpleWrite
  } = simpleChannel()

  let readStream = promisedReadStream(simpleRead)
  let writeStream = promisedWriteStream(simpleWrite)

  return { readStream, writeStream }
}