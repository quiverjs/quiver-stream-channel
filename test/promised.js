import 'traceur'
import { promisedChannel } from '../lib/promised.js'
import { enableDebug } from 'quiver-promise'

var should = require('should')

enableDebug()

describe('promised channel test', () => {
  it('read write write read read closeWrite', (callback) => {
    var { readStream, writeStream } = promisedChannel()

    var firstData = 'foo'
    var secondData = 'bar'
    var closeErr = 'error'

    // 1
    var promise1 = readStream.read().then(({ closed, data }) => {
      should.not.exists(closed)
      data.should.equal(firstData)

      // 3
      var promise1 = writeStream.prepareWrite()
      .then(({ closed }) => {
        should.not.exists(closed)
        writeStream.write(secondData)
      })

      // 4
      var promise2 = readStream.read().then(({ closed, data }) => {
        should.not.exist(closed)
        data.should.equal(secondData)

        // 5
        var promised21 = readStream.read().then(({ closed, data }) => {
          should.exists(closed)
          should.not.exists(data)

          callback()
        })

        // 6
        writeStream.closeWrite()
      })
    })

    // 2
    var promise2 = writeStream.prepareWrite()
    .then(({ closed }) => {
      should.not.exists(closed)

      writeStream.write(firstData)
    })
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
})
