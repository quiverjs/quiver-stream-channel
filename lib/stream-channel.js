
'use strict'

var object = require('quiver-object')
var primitive = require('quiver-primitive-stream')
var simpleStream = require('./simple-stream')
var emptyStream = require('./empty-stream')

var createStreamChannel = function() {
  var primitiveChannel = primitive.createPrimitiveStreamChannel()

  var writeStream = simpleStream.createSimpleWriteStream(primitiveChannel.writeStream)
  var readStream = simpleStream.createSimpleReadStream(primitiveChannel.readStream)

  var channel = {
    writeStream: writeStream,
    readStream: readStream
  }

  return channel
}

module.exports = {
  createStreamChannel: createStreamChannel,
  createEmptyReadStream: emptyStream.createEmptyReadStream,
  createEmptyWriteStream: emptyStream.createEmptyWriteStream,
  createEmptyStreamable: emptyStream.createEmptyStreamable
}