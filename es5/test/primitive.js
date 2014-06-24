"use strict";
require('traceur');
var primitiveChannel = $traceurRuntime.assertObject(require('../lib/primitive.js')).primitiveChannel;
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
describe('different correct read write sequences', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__1 = $traceurRuntime.assertObject(primitiveChannel()),
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
  it('write read read write closeRead write', (function(callback) {
    var $__1 = $traceurRuntime.assertObject(primitiveChannel()),
        readStream = $__1.readStream,
        writeStream = $__1.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var closeErr = 'error';
    writeStream.prepareWrite(guard((function(streamClosed, writer) {
      should.not.exist(streamClosed);
      writer.should.be.a.Function;
      writer(null, firstData);
    })));
    readStream.read(guard((function(streamClosed, data) {
      should.not.exist(streamClosed);
      data.should.equal(firstData);
      readStream.read(guard((function(streamClosed, data) {
        should.not.exist(streamClosed);
        data.should.equal(secondData);
        readStream.closeRead(closeErr);
        writeStream.prepareWrite(guard((function(streamClosed, writer) {
          should.exist(streamClosed);
          streamClosed.err.should.equal(closeErr);
          should.not.exist(writer);
          callback(null);
        })));
      })));
      writeStream.prepareWrite(guard((function(streamClosed, writer) {
        should.not.exist(streamClosed);
        writer.should.be.a.Function;
        writer(null, secondData);
      })));
    })));
  }));
}));
describe('inconsistent states', (function() {
  it('when read is called twice', (function() {
    var readStream = $traceurRuntime.assertObject(primitiveChannel()).readStream;
    ;
    ((function() {
      readStream.read(function(streamClosed, buffer) {
        should.fail();
      });
    })).should.not.throw();
    ;
    ((function() {
      readStream.read(function(streamClosed, buffer) {
        should.fail();
      });
    })).should.throw();
  }));
}));
