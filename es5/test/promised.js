"use strict";
require('traceur');
var promisedChannel = $traceurRuntime.assertObject(require('../lib/promised.js')).promisedChannel;
var enableDebug = $traceurRuntime.assertObject(require('quiver-promise')).enableDebug;
var should = require('should');
enableDebug();
describe('promised channel test', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__0 = $traceurRuntime.assertObject(promisedChannel()),
        readStream = $__0.readStream,
        writeStream = $__0.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var closeErr = 'error';
    var promise1 = readStream.read().then((function($__0) {
      var closed = $__0.closed,
          data = $__0.data;
      should.not.exists(closed);
      data.should.equal(firstData);
      var promise1 = writeStream.prepareWrite().then((function($__1) {
        var closed = $__1.closed;
        should.not.exists(closed);
        writeStream.write(secondData);
      }));
      var promise2 = readStream.read().then((function($__2) {
        var closed = $__2.closed,
            data = $__2.data;
        should.not.exist(closed);
        data.should.equal(secondData);
        var promised21 = readStream.read().then((function($__3) {
          var closed = $__3.closed,
              data = $__3.data;
          should.exists(closed);
          should.not.exists(data);
          callback();
        }));
        writeStream.closeWrite();
      }));
    }));
    var promise2 = writeStream.prepareWrite().then((function($__1) {
      var closed = $__1.closed;
      should.not.exists(closed);
      writeStream.write(firstData);
    }));
  }));
  it('should be able to write multiple times', (function(callback) {
    var $__0 = $traceurRuntime.assertObject(promisedChannel()),
        readStream = $__0.readStream,
        writeStream = $__0.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var thirdData = 'baz';
    var fourthData = 'blah';
    var closeErr = 'error';
    writeStream.write(firstData);
    writeStream.write(secondData);
    readStream.read().then((function($__0) {
      var closed = $__0.closed,
          data = $__0.data;
      should.not.exist(closed);
      data.should.equal(firstData);
      readStream.read().then((function($__1) {
        var closed = $__1.closed,
            data = $__1.data;
        should.not.exist(closed);
        data.should.equal(secondData);
        readStream.read().then((function($__2) {
          var closed = $__2.closed,
              data = $__2.data;
          should.not.exist(closed);
          data.should.equal(thirdData);
          readStream.closeRead(closeErr);
          readStream.read().catch((function(err) {
            err.should.equal(closeErr);
            callback();
          }));
        }));
        writeStream.write(thirdData);
        writeStream.prepareWrite().catch((function(err) {
          err.should.equal(closeErr);
        }));
      }));
    }));
  }));
}));
