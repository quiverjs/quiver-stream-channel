import test from 'tape'
import { primitiveChannel } from '../lib/primitive'

const guard = callback => {
  const called = false
  return (...args) => {
    if(called) throw new Error('callback is called multiple times')
    callback(...args)
  }
}

test('different correct read write sequences', assert => {
  assert.test('read write write read read closeWrite', assert => {
    const { readStream, writeStream } = primitiveChannel()

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

  assert.test('write read read write closeRead write', assert => {
    const { readStream, writeStream } = primitiveChannel()

    const firstData = 'foo'
    const secondData = 'bar'
    const closeErr = 'error'

    // 1
    writeStream.prepareWrite(guard((streamClosed, writer) => {
      assert.notOk(streamClosed)
      assert.equal(typeof(writer), 'function')

      writer(null, firstData)
    }))

    // 2
    readStream.read(guard((streamClosed, data) => {
      assert.notOk(streamClosed)
      assert.equal(data, firstData)

      // 3
      readStream.read(guard((streamClosed, data) => {
        assert.notOk(streamClosed)
        assert.equal(data, secondData)

        // 5
        readStream.closeRead(closeErr)

        // 6
        writeStream.prepareWrite(guard((streamClosed, writer) => {
          assert.ok(streamClosed)
          assert.equal(streamClosed.err, closeErr)
          assert.notOk(writer)

          assert.end()
        }))
      }))

      // 4
      writeStream.prepareWrite(guard((streamClosed, writer) => {
        assert.notOk(streamClosed)
        assert.equal(typeof(writer), 'function')

        writer(null, secondData)
      }))
    }))
  })
})

test('inconsistent states', assert => {
  assert.test('when read is called twice', assert => {
    const { readStream } = primitiveChannel()

    readStream.read(function(streamClosed, buffer) {
      assert.fail()
    })

    assert.throws(() => {
      readStream.read(function(streamClosed, buffer) {
        assert.fail()
      })
    })

    assert.end()
  })
})
