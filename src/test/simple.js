import test from 'tape'
import { simpleChannel } from '../lib/simple'

const guard = callback => {
  const called = false
  return (...args) => {
    if(called) throw new Error('callback is called multiple times')
    callback(...args)
  }
}

test('compatibility test with primitive stream', assert => {
  assert.test('read write write read read closeWrite', assert => {
    const { readStream, writeStream } = simpleChannel()

    const firstData = 'foo'
    const secondData = 'bar'
    const closeErr = 'error'

    // 1
    readStream.read(guard((streamClosed, data) => {
      assert.notOk(streamClosed)
      assert.equal(data, firstData)

      // 3
      writeStream.prepareWrite(guard((streamClosed, writer) => {

        assert.notOk(streamClosed)
        assert.equal(typeof(writer), 'function')

        writer(null, secondData)
      }))

      // 4
      readStream.read(guard((streamClosed, data) => {
        assert.notOk(streamClosed)
        assert.equal(data, secondData)

        // 5
        readStream.read(guard((streamClosed, data) => {
          assert.ok(streamClosed)
          assert.equal(streamClosed.err, closeErr)
          assert.notOk(data)

          assert.end()
        }))

        // 6
        writeStream.closeWrite(closeErr)
      }))
    }))

    // 2
    writeStream.prepareWrite(guard((streamClosed, writer) => {
      assert.notOk(streamClosed)
      assert.equal(typeof(writer), 'function')

      writer(null, firstData)
    }))
  })
})

test('simple stream extension test', assert => {
  assert.test('should be able to write multiple times', assert => {
    const { readStream, writeStream } = simpleChannel()

    const firstData = 'foo'
    const secondData = 'bar'
    const thirdData = 'baz'
    const fourthData = 'blah'
    const closeErr = 'error'

    writeStream.write(firstData)
    writeStream.write(secondData)

    readStream.read(guard((streamClosed, data) => {
      assert.notOk(streamClosed)
      assert.equal(data, firstData)

      readStream.read(guard((streamClosed, data) => {
        assert.notOk(streamClosed)
        assert.equal(data, secondData)

        readStream.read(guard((streamClosed, data) => {
          assert.notOk(streamClosed)
          assert.equal(data, thirdData)

          readStream.closeRead(closeErr)

          assert.end()
          readStream.read(guard((streamClosed, data) => {
            assert.equal(streamClosed.err, closeErr)
            assert.notOk(data)
          }))
        }))

        writeStream.write(thirdData)
        writeStream.prepareWrite((streamClosed, writer) => {
          assert.equal(streamClosed.err, closeErr)
          assert.notOk(writer)
        })
      }))
    }))
  })
})

test('close stream test', assert => {
  assert.test('read stream should close correctly', assert => {
    const channel = simpleChannel()
    const readStream = channel.readStream
    const writeStream = channel.writeStream

    assert.equal(readStream.isClosed(), false)
    assert.equal(writeStream.isClosed(), false)

    writeStream.prepareWrite(streamClosed => {
      assert.ok(streamClosed)
      assert.equal(writeStream.isClosed(), true)
      assert.end()
    })

    readStream.closeRead()
    assert.equal(readStream.isClosed(), true)
  })

  assert.test('write stream should close correctly', assert => {
    const channel = simpleChannel()
    const readStream = channel.readStream
    const writeStream = channel.writeStream

    assert.equal(readStream.isClosed(), false)
    assert.equal(writeStream.isClosed(), false)

    readStream.read(streamClosed => {
      assert.ok(streamClosed)
      assert.equal(readStream.isClosed(), true)
      assert.end()
    })

    writeStream.closeWrite()
    assert.equal(writeStream.isClosed(), true)
  })
})
