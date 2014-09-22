"use strict";
var $__traceur_64_0_46_0_46_6__,
    $___46__46__47_lib_47_simple_46_js__;
($__traceur_64_0_46_0_46_6__ = require("traceur"), $__traceur_64_0_46_0_46_6__ && $__traceur_64_0_46_0_46_6__.__esModule && $__traceur_64_0_46_0_46_6__ || {default: $__traceur_64_0_46_0_46_6__});
var simpleChannel = ($___46__46__47_lib_47_simple_46_js__ = require("../lib/simple.js"), $___46__46__47_lib_47_simple_46_js__ && $___46__46__47_lib_47_simple_46_js__.__esModule && $___46__46__47_lib_47_simple_46_js__ || {default: $___46__46__47_lib_47_simple_46_js__}).simpleChannel;
var should = require('should');
var guard = (function(callback) {
  var called = false;
  return (function() {
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$__1] = arguments[$__1];
    if (called)
      throw new Error('callback is called multiple times');
    callback.apply(null, $traceurRuntime.spread(args));
  });
});
describe('compatibility test with primitive stream', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__2 = simpleChannel(),
        readStream = $__2.readStream,
        writeStream = $__2.writeStream;
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
    var $__2 = simpleChannel(),
        readStream = $__2.readStream,
        writeStream = $__2.writeStream;
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
