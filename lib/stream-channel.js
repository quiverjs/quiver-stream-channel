
var primitive = require('quiver-primitive-stream')
var simple = require('./simple-stream')

var createStreamChannel = function() {
  var primitiveChannel = primitive.createPrimitiveStreamChannel()

  var writeStream = simple.createSimpleWriteStream(primitiveChannel.writeStream)
  var readStream = simple.createSimpleReadStream(primitiveChannel.readStream)

  var channel = {
    writeStream: writeStream,
    readStream: readStream
  }

  return channel
}