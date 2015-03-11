import { createPromise } from 'quiver-promise'
import { simpleChannel } from './simple'

export const promisedReadStream = (simpleReadStream) => ({
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

export const promisedWriteStream = (simpleWriteStream) => ({
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

export const promisedChannel = () => {
  const { 
    readStream: simpleRead,
    writeStream: simpleWrite
  } = simpleChannel()

  const readStream = promisedReadStream(simpleRead)
  const writeStream = promisedWriteStream(simpleWrite)

  return { readStream, writeStream }
}