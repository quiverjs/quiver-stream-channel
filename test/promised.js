import 'traceur'
import chai from 'chai'
import { promisedChannel } from '../lib/promised'

var should = chai.should()

describe('promised channel test', () => {
  it('read write write read read closeWrite', (callback) => {
    var { readStream, writeStream } = promisedChannel()

    var firstData = 'foo'
    var secondData = 'bar'
    var closeErr = 'error'

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
        var promised21 = readStream.read().then(({ closed, data }) => {
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
    var { readStream, writeStream } = promisedChannel()

    var firstData = 'foo'
    var secondData = 'bar'
    var thirdData = 'baz'
    var fourthData = 'blah'
    var closeErr = 'error'

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
    var { readStream, writeStream } = promisedChannel()

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
