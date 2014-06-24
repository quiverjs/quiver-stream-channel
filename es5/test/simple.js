"use strict";
require('traceur');
var simpleChannel = $traceurRuntime.assertObject(require('../lib/simple.js')).simpleChannel;
var should = require('should');
var guard = (function(callback) {
  var called = false;
  return (function() {
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    if (called)
      throw new Error('callback is called multiple times');
    callback.apply(null, $traceurRuntime.toObject(args));
  });
});
describe('compatibility test with primitive stream', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__1 = $traceurRuntime.assertObject(simpleChannel()),
        readStream = $__1.readStream,
        writeStream = $__1.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var closeErr = 'error';
    readStream.read(guard((function(streamClosed, data) {
      should.not.exist(streamClosed);
      data.should.equal(firstData);
      writeStream.prepareWrite(guard((function(streamClosed, writer) {
        should.not.exist(streamClosed);
        writer.should.be.a.Function;
        writer(null, secondData);
      })));
      readStream.read(guard((function(streamClosed, data) {
        should.not.exist(streamClosed);
        data.should.equal(secondData);
        readStream.read(guard((function(streamClosed, data) {
          should.exist(streamClosed);
          streamClosed.err.should.equal(closeErr);
          should.not.exist(data);
          callback(null);
        })));
        writeStream.closeWrite(closeErr);
      })));
    })));
    writeStream.prepareWrite(guard((function(streamClosed, writer) {
      should.not.exist(streamClosed);
      writer.should.be.a.Function;
      writer(null, firstData);
    })));
  }));
}));
describe('simple stream extension test', (function() {
  it('should be able to write multiple times', (function(callback) {
    var $__1 = $traceurRuntime.assertObject(simpleChannel()),
        readStream = $__1.readStream,
        writeStream = $__1.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var thirdData = 'baz';
    var fourthData = 'blah';
    var closeErr = 'error';
    writeStream.write(firstData);
    writeStream.write(secondData);
    readStream.read(guard((function(streamClosed, data) {
      should.not.exist(streamClosed);
      data.should.equal(firstData);
      readStream.read(guard((function(streamClosed, data) {
        should.not.exist(streamClosed);
        data.should.equal(secondData);
        readStream.read(guard((function(streamClosed, data) {
          should.not.exist(streamClosed);
          data.should.equal(thirdData);
          readStream.closeRead(closeErr);
          callback(null);
          readStream.read(guard((function(streamClosed, data) {
            streamClosed.err.should.equal(closeErr);
            should.not.exist(data);
          })));
        })));
        writeStream.write(thirdData);
        writeStream.prepareWrite((function(streamClosed, writer) {
          streamClosed.err.should.equal(closeErr);
          should.not.exist(writer);
        }));
      })));
    })));
  }));
}));
describe('close stream test', (function() {
  it('read stream should close correctly', (function(callback) {
    var channel = simpleChannel();
    var readStream = channel.readStream;
    var writeStream = channel.writeStream;
    readStream.isClosed().should.equal(false);
    writeStream.isClosed().should.equal(false);
    writeStream.prepareWrite((function(streamClosed) {
      should.exist(streamClosed);
      writeStream.isClosed().should.equal(true);
      callback();
    }));
    readStream.closeRead();
    readStream.isClosed().should.equal(true);
  }));
  it('write stream should close correctly', (function(callback) {
    var channel = simpleChannel();
    var readStream = channel.readStream;
    var writeStream = channel.writeStream;
    readStream.isClosed().should.equal(false);
    writeStream.isClosed().should.equal(false);
    readStream.read((function(streamClosed) {
      should.exist(streamClosed);
      readStream.isClosed().should.equal(true);
      callback();
    }));
    writeStream.closeWrite();
    writeStream.isClosed().should.equal(true);
  }));
}));
