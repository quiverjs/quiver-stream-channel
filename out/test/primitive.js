"use strict";
var $__traceur_64_0_46_0_46_8__,
    $__chai__,
    $___46__46__47_lib_47_primitive__;
($__traceur_64_0_46_0_46_8__ = require("traceur"), $__traceur_64_0_46_0_46_8__ && $__traceur_64_0_46_0_46_8__.__esModule && $__traceur_64_0_46_0_46_8__ || {default: $__traceur_64_0_46_0_46_8__});
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var primitiveChannel = ($___46__46__47_lib_47_primitive__ = require("../lib/primitive"), $___46__46__47_lib_47_primitive__ && $___46__46__47_lib_47_primitive__.__esModule && $___46__46__47_lib_47_primitive__ || {default: $___46__46__47_lib_47_primitive__}).primitiveChannel;
let should = chai.should();
let guard = (function(callback) {
  let called = false;
  return (function() {
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    if (called)
      throw new Error('callback is called multiple times');
    callback.apply(null, $traceurRuntime.spread(args));
  });
});
describe('different correct read write sequences', (function() {
  it('read write write read read closeWrite', (function(callback) {
    let $__3 = primitiveChannel(),
        readStream = $__3.readStream,
        writeStream = $__3.writeStream;
    let firstData = 'foo';
    let secondData = 'bar';
    let closeErr = 'error';
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
    let $__3 = primitiveChannel(),
        readStream = $__3.readStream,
        writeStream = $__3.writeStream;
    let firstData = 'foo';
    let secondData = 'bar';
    let closeErr = 'error';
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
    let readStream = primitiveChannel().readStream;
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
