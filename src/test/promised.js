import chai from 'chai'
import { promisedChannel } from '../lib/promised'

const should = chai.should()

describe('promised channel test', () => {
  it('read write write read read closeWrite', (callback) => {
    const { readStream, writeStream } = promisedChannel()

    const firstData = 'foo'
    const secondData = 'bar'
    const closeErr = 'error'

    // 1
    readStream.read().then(({ closed, data }) => {
      should.not.exist(closed)
      data.should.equal(firstData)

      // 3
      writeStream.prepareWrite()
      .then(({ closed }) => {
        should.not.exist(closed)
        writeStream.write(secondData)
      })

      // 4
      readStream.read().then(({ closed, data }) => {
        should.not.exist(closed)
        data.should.equal(secondData)

        // 5
        const promised21 = readStream.read().then(({ closed, data }) => {
          should.exist(closed)
          should.not.exist(data)

          callback()
        })

        // 6
        writeStream.closeWrite()
      })
    })
    .catch(callback)

    // 2
    writeStream.prepareWrite()
    .then(({ closed }) => {
      should.not.exist(closed)

      writeStream.write(firstData)
    })
    .catch(callback)
  })

  it('should be able to write multiple times', callback => {
    const { readStream, writeStream } = promisedChannel()

    const firstData = 'foo'
    const secondData = 'bar'
    const thirdData = 'baz'
    const fourthData = 'blah'
    const closeErr = 'error'

    writeStream.write(firstData)
    writeStream.write(secondData)

    readStream.read().then(({ closed, data }) => {
      should.not.exist(closed)
      data.should.equal(firstData)

      readStream.read().then(({ closed, data }) => {
        should.not.exist(closed)
        data.should.equal(secondData)

        readStream.read().then(({ closed, data }) => {
          should.not.exist(closed)
          data.should.equal(thirdData)

          readStream.closeRead(closeErr)

          readStream.read().catch(err => {
            err.should.equal(closeErr)
            callback()
          })
        })

        writeStream.write(thirdData)
        writeStream.prepareWrite().catch(err => {
          err.should.equal(closeErr)
        })
      })
    })
  })

  it('close read while reading', callback => {
    const { readStream, writeStream } = promisedChannel()

    readStream.read().then(({closed, data}) => {
      console.log('read callback triggered')
      callback(new Error('should not get callback'))
    })

    readStream.closeRead()

    writeStream.prepareWrite().then(({closed}) => {
      //should.exist(closed)
      callback()
    })
    .catch(callback)
  })
})
