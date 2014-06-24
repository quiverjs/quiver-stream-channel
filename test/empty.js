import 'traceur'
import { emptyReadStream, emptyWriteStream } from '../lib/empty.js'

var should = require('should')

describe('empty stream test', () => {
  it('test empty read stream', callback => {
    var readStream = emptyReadStream()
    
    readStream.read((streamClosed, data) => {
      should.exist(streamClosed)
      should.not.exist(data)

      callback(null)
    })

    should.exist(readStream.isClosed())
  })

  it('test empty write stream', callback => {
    var writeStream = emptyWriteStream()
    
    writeStream.write('ignored data')

    writeStream.prepareWrite((streamClosed, writer) => {
      should.exist(streamClosed)
      should.not.exist(writer)

      callback(null)
    })

    should.exist(writeStream.isClosed())
  })
})