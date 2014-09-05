"use strict";
var $__traceur_64_0_46_0_46_58__,
    $___46__46__47_lib_47_primitive_46_js__;
($__traceur_64_0_46_0_46_58__ = require("traceur"), $__traceur_64_0_46_0_46_58__ && $__traceur_64_0_46_0_46_58__.__esModule && $__traceur_64_0_46_0_46_58__ || {default: $__traceur_64_0_46_0_46_58__});
var primitiveChannel = ($___46__46__47_lib_47_primitive_46_js__ = require("../lib/primitive.js"), $___46__46__47_lib_47_primitive_46_js__ && $___46__46__47_lib_47_primitive_46_js__.__esModule && $___46__46__47_lib_47_primitive_46_js__ || {default: $___46__46__47_lib_47_primitive_46_js__}).primitiveChannel;
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
describe('different correct read write sequences', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__2 = primitiveChannel(),
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
  it('write read read write closeRead write', (function(callback) {
    var $__2 = primitiveChannel(),
        readStream = $__2.readStream,
        writeStream = $__2.writeStream;
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
    var readStream = primitiveChannel().readStream;
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
