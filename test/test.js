
var vows = require('vows')
var assert = require('assert')
var createChannel = require('../lib/stream-channel').createStreamChannel

var guardCallback = function(callback) {
  var called = false
  return function() {
    if(called) throw new Error('callback is called multiple times')
    callback.apply(null, arguments)
  }
}

vows.describe('compatibility test with primitive stream')
.addBatch({
  'read write write read read closeWrite': {
    topic: function() {
      var callback = this.callback

      var channel = createChannel()
      var readStream = channel.readStream
      var writeStream = channel.writeStream

      var firstData = 'foo'
      var secondData = 'bar'
      var closeErr = 'error'

      // 1
      readStream.read(guardCallback(function(streamClosed, data) {
        assert.isNull(streamClosed)
        assert.equal(data, firstData)

        // 3
        writeStream.prepareWrite(guardCallback(function(streamClosed, writer) {
          assert.isNull(streamClosed)
          assert.isFunction(writer)

          writer(null, secondData)
        }))

        // 4
        readStream.read(guardCallback(function(streamClosed, data) {
          assert.isNull(streamClosed)
          assert.equal(data, secondData)

          // 5
          readStream.read(guardCallback(function(streamClosed, data) {
            assert.isObject(streamClosed)
            assert.equal(streamClosed.err, closeErr)
            assert.isUndefined(data)

            callback(null)
          }))

          // 6
          writeStream.closeWrite(closeErr)
        }))
      }))

      // 2
      writeStream.prepareWrite(guardCallback(function(streamClosed, writer) {
        assert.isNull(streamClosed)
        assert.isFunction(writer)

        writer(null, firstData)
      }))
    },
    'should success': function() { }
  }
}).export(module)

vows.describe('simple stream extension test')
.addBatch({
  'should be able to write multiple times': {
    topic: function() {
      var callback = this.callback

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
        assert.isNull(streamClosed)
        assert.equal(data, firstData)

        readStream.read(guardCallback(function(streamClosed, data) {
          assert.isNull(streamClosed)
          assert.equal(data, secondData)
        }))

        readStream.read(guardCallback(function(streamClosed, data) {
          assert.isNull(streamClosed)
          assert.equal(data, thirdData)

          readStream.closeRead(closeErr)

          readStream.read(guardCallback(function(streamClosed, data) {
            assert.equal(streamClosed.err, closeErr)
            assert.isUndefined(data)
          }))
        }))

        writeStream.write(thirdData)
        writeStream.prepareWrite(function(streamClosed, writer) {
          assert.equal(streamClosed.err, closeErr)
          assert.isUndefined(writer)
        })
      }))
    },
    'should success': function() { }
  }
}).export(module)

