"use strict";
var $__traceur_64_0_46_0_46_7__,
    $__chai__,
    $___46__46__47_lib_47_simple__;
($__traceur_64_0_46_0_46_7__ = require("traceur"), $__traceur_64_0_46_0_46_7__ && $__traceur_64_0_46_0_46_7__.__esModule && $__traceur_64_0_46_0_46_7__ || {default: $__traceur_64_0_46_0_46_7__});
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var simpleChannel = ($___46__46__47_lib_47_simple__ = require("../lib/simple"), $___46__46__47_lib_47_simple__ && $___46__46__47_lib_47_simple__.__esModule && $___46__46__47_lib_47_simple__ || {default: $___46__46__47_lib_47_simple__}).simpleChannel;
var should = chai.should();
var guard = (function(callback) {
  var called = false;
  return (function() {
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    if (called)
      throw new Error('callback is called multiple times');
    callback.apply(null, $traceurRuntime.spread(args));
  });
});
describe('compatibility test with primitive stream', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__3 = simpleChannel(),
        readStream = $__3.readStream,
        writeStream = $__3.writeStream;
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
    var $__3 = simpleChannel(),
        readStream = $__3.readStream,
        writeStream = $__3.writeStream;
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
