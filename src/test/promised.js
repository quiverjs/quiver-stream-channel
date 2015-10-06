import test from 'tape'
import { promisedChannel } from '../lib/promised'

test('promised channel test', assert => {
  assert.test('read write write read read closeWrite', assert => {
    const { readStream, writeStream } = promisedChannel()

    const firstData = 'foo'
    const secondData = 'bar'
    const closeErr = 'error'

    // 1
    readStream.read().then(({ closed, data }) => {
      assert.notOk(closed)
      assert.equal(data, firstData)

      // 3
      writeStream.prepareWrite()
      .then(({ closed }) => {
        assert.notOk(closed)
        writeStream.write(secondData)
      })

      // 4
      readStream.read().then(({ closed, data }) => {
        assert.notOk(closed)
        assert.equal(data, secondData)

        // 5
        const promised21 = readStream.read().then(({ closed, data }) => {
          assert.ok(closed)
          assert.notOk(data)

          assert.end()
        })

        // 6
        writeStream.closeWrite()
      })
    })
    .catch(assert.fail)

    // 2
    writeStream.prepareWrite()
    .then(({ closed }) => {
      assert.notOk(closed)

      writeStream.write(firstData)
    })
    .catch(assert.fail)
  })

  assert.test('should be able to write multiple times', assert => {
    const { readStream, writeStream } = promisedChannel()

    const firstData = 'foo'
    const secondData = 'bar'
    const thirdData = 'baz'
    const fourthData = 'blah'
    const closeErr = 'error'

    writeStream.write(firstData)
    writeStream.write(secondData)

    readStream.read().then(({ closed, data }) => {
      assert.notOk(closed)
      assert.equal(data, firstData)

      readStream.read().then(({ closed, data }) => {
        assert.notOk(closed)
        assert.equal(data, secondData)

        readStream.read().then(({ closed, data }) => {
          assert.notOk(closed)
          assert.equal(data, thirdData)

          readStream.closeRead(closeErr)

          readStream.read().catch(err => {
            assert.equal(err, closeErr)
            assert.end()
          })
        })

        writeStream.write(thirdData)
        writeStream.prepareWrite().catch(err => {
          assert.equal(err, closeErr)
        })
      })
    })
  })

  assert.test('close read while reading', assert => {
    const { readStream, writeStream } = promisedChannel()

    readStream.read().then(({closed, data}) => {
      console.log('read callback triggered')
      assert.fail(new Error('should not get callback'))
    })

    readStream.closeRead()

    writeStream.prepareWrite().then(({closed}) => {
      // assert.ok(closed)
      assert.end()
    })
    .catch(assert.fail)
  })
})
