import 'traceur'
import chai from 'chai'
import { simpleChannel } from '../lib/simple'

let should = chai.should()

let guard = callback => {
  let called = false
  return (...args) => {
    if(called) throw new Error('callback is called multiple times')
    callback(...args)
  }
}

describe('compatibility test with primitive stream', () => {
  it('read write write read read closeWrite', callback => {
    let { readStream, writeStream } = simpleChannel()

    let firstData = 'foo'
    let secondData = 'bar'
    let closeErr = 'error'

    // 1
    readStream.read(guard((streamClosed, data) => {
      should.not.exist(streamClosed)
      data.should.equal(firstData)
      
      // 3
      writeStream.prepareWrite(guard((streamClosed, writer) => {

        should.not.exist(streamClosed)
        writer.should.be.a.Function

        writer(null, secondData)
      }))

      // 4
      readStream.read(guard((streamClosed, data) => {
        should.not.exist(streamClosed)
        data.should.equal(secondData)

        // 5
        readStream.read(guard((streamClosed, data) => {
          should.exist(streamClosed)
          streamClosed.err.should.equal(closeErr)
          should.not.exist(data)

          callback(null)
        }))

        // 6
        writeStream.closeWrite(closeErr)
      }))
    }))

    // 2
    writeStream.prepareWrite(guard((streamClosed, writer) => {
      should.not.exist(streamClosed)
      writer.should.be.a.Function

      writer(null, firstData)
    }))
  })
})

describe('simple stream extension test', () => {
  it('should be able to write multiple times', callback => {
    let { readStream, writeStream } = simpleChannel()

    let firstData = 'foo'
    let secondData = 'bar'
    let thirdData = 'baz'
    let fourthData = 'blah'
    let closeErr = 'error'

    writeStream.write(firstData)
    writeStream.write(secondData)

    readStream.read(guard((streamClosed, data) => {
      should.not.exist(streamClosed)
      data.should.equal(firstData)

      readStream.read(guard((streamClosed, data) => {
        should.not.exist(streamClosed)
        data.should.equal(secondData)

        readStream.read(guard((streamClosed, data) => {
          should.not.exist(streamClosed)
          data.should.equal(thirdData)

          readStream.closeRead(closeErr)

          callback(null)
          readStream.read(guard((streamClosed, data) => {
            streamClosed.err.should.equal(closeErr)
            should.not.exist(data)
          }))
        }))

        writeStream.write(thirdData)
        writeStream.prepareWrite((streamClosed, writer) => {
          streamClosed.err.should.equal(closeErr)
          should.not.exist(writer)
        })
      }))
    }))
  })
})

describe('close stream test', () => {
  it('read stream should close correctly', callback => {
    let channel = simpleChannel()
    let readStream = channel.readStream
    let writeStream = channel.writeStream

    readStream.isClosed().should.equal(false)
    writeStream.isClosed().should.equal(false)

    writeStream.prepareWrite(streamClosed => {
      should.exist(streamClosed)
      writeStream.isClosed().should.equal(true)
      callback()
    })
    
    readStream.closeRead()
    readStream.isClosed().should.equal(true)
  })

  it('write stream should close correctly', callback => {
    let channel = simpleChannel()
    let readStream = channel.readStream
    let writeStream = channel.writeStream

    readStream.isClosed().should.equal(false)
    writeStream.isClosed().should.equal(false)

    readStream.read(streamClosed => {
      should.exist(streamClosed)
      readStream.isClosed().should.equal(true)
      callback()
    })

    writeStream.closeWrite()
    writeStream.isClosed().should.equal(true)
  })
})