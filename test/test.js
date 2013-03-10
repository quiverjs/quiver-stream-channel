
var should = require('should')
var createChannel = require('../lib/stream-channel').createStreamChannel

var guardCallback = function(callback) {
  var called = false
  return function() {
    if(called) throw new Error('callback is called multiple times')
    callback.apply(null, arguments)
  }
}

describe('simple stream', function() {
  describe('compatibility test with primitive stream', function() {

    it('read write write read read closeWrite', function(callback) {
      var channel = createChannel()
      var readStream = channel.readStream
      var writeStream = channel.writeStream

      var firstData = 'foo'
      var secondData = 'bar'
      var closeErr = 'error'

      // 1
      readStream.read(guardCallback(function(streamClosed, data) {
        should.not.exist(streamClosed)
        data.should.equal(firstData)
        
        // 3
        writeStream.prepareWrite(guardCallback(function(streamClosed, writer) {

          should.not.exist(streamClosed)
          writer.should.be.a('function')

          writer(null, secondData)
        }))

        // 4
        readStream.read(guardCallback(function(streamClosed, data) {
          should.not.exist(streamClosed)
          data.should.equal(secondData)

          // 5
          readStream.read(guardCallback(function(streamClosed, data) {
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
      writeStream.prepareWrite(guardCallback(function(streamClosed, writer) {
        should.not.exist(streamClosed)
        writer.should.be.a('function')

        writer(null, firstData)
      }))
    })
  })

  describe('simple stream extension test', function() {
    it('should be able to write multiple times', function(callback) {
      var channel = createChannel()
      var readStream = channel.readStream
      var writeStream = channel.writeStream

      var firstData = 'foo'
      var secondData = 'bar'
      var thirdData = 'baz'
      var fourthData = 'blah'
      var closeErr = 'error'

      writeStream.write(firstData)
      writeStream.write(secondData)

      readStream.read(guardCallback(function(streamClosed, data) {
        should.not.exist(streamClosed)
        data.should.equal(firstData)

        readStream.read(guardCallback(function(streamClosed, data) {
          should.not.exist(streamClosed)
          data.should.equal(secondData)

          readStream.read(guardCallback(function(streamClosed, data) {
            should.not.exist(streamClosed)
            data.should.equal(thirdData)

            readStream.closeRead(closeErr)

            callback(null)
            readStream.read(guardCallback(function(streamClosed, data) {
              streamClosed.err.should.equal(closeErr)
              should.not.exist(data)
            }))
          }))

          writeStream.write(thirdData)
          writeStream.prepareWrite(function(streamClosed, writer) {
            streamClosed.err.should.equal(closeErr)
            should.not.exist(writer)
          })
        }))
      }))
    })
  })
})
