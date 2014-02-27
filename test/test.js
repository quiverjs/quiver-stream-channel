
'use strict'

var should = require('should')
var streamChannel = require('../lib/stream-channel')
var createChannel = streamChannel.createStreamChannel

var guardCallback = function(callback) {
  var called = false
  return function() {
    if(called) throw new Error('callback is called multiple times')
    callback.apply(null, arguments)
  }
}

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
        writer.should.be.a.Function

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
      writer.should.be.a.Function

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

describe('close stream test', function() {
  it('read stream should close correctly', function(callback) {
    var channel = createChannel()
    var readStream = channel.readStream
    var writeStream = channel.writeStream

    readStream.isClosed().should.equal(false)
    writeStream.isClosed().should.equal(false)

    writeStream.prepareWrite(function(streamClosed) {
      should.exist(streamClosed)
      writeStream.isClosed().should.equal(true)
      callback()
    })
    
    readStream.closeRead()
    readStream.isClosed().should.equal(true)
  })

  it('write stream should close correctly', function(callback) {
    var channel = createChannel()
    var readStream = channel.readStream
    var writeStream = channel.writeStream

    readStream.isClosed().should.equal(false)
    writeStream.isClosed().should.equal(false)

    readStream.read(function(streamClosed) {
      should.exist(streamClosed)
      readStream.isClosed().should.equal(true)
      callback()
    })

    writeStream.closeWrite()
    writeStream.isClosed().should.equal(true)
  })
})

describe('empty stream test', function() {
  it('test empty read stream', function(callback) {
    var readStream = streamChannel.createEmptyReadStream()
    
    readStream.read(function(streamClosed, data) {
      should.exist(streamClosed)
      should.not.exist(data)

      callback(null)
    })

    should.exist(readStream.isClosed())
  })

  it('test empty write stream', function(callback) {
    var writeStream = streamChannel.createEmptyWriteStream()
    
    writeStream.write('ignored data')

    writeStream.prepareWrite(function(streamClosed, writer) {
      should.exist(streamClosed)
      should.not.exist(writer)

      callback(null)
    })

    should.exist(writeStream.isClosed())
  })
})

