"use strict";
var $__traceur_64_0_46_0_46_58__,
    $___46__46__47_lib_47_promised_46_js__,
    $__quiver_45_promise__;
($__traceur_64_0_46_0_46_58__ = require("traceur"), $__traceur_64_0_46_0_46_58__ && $__traceur_64_0_46_0_46_58__.__esModule && $__traceur_64_0_46_0_46_58__ || {default: $__traceur_64_0_46_0_46_58__});
var promisedChannel = ($___46__46__47_lib_47_promised_46_js__ = require("../lib/promised.js"), $___46__46__47_lib_47_promised_46_js__ && $___46__46__47_lib_47_promised_46_js__.__esModule && $___46__46__47_lib_47_promised_46_js__ || {default: $___46__46__47_lib_47_promised_46_js__}).promisedChannel;
var enableDebug = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).enableDebug;
var should = require('should');
enableDebug();
describe('promised channel test', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__2 = promisedChannel(),
        readStream = $__2.readStream,
        writeStream = $__2.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var closeErr = 'error';
    var promise1 = readStream.read().then((function($__2) {
      var $__3 = $__2,
          closed = $__3.closed,
          data = $__3.data;
      should.not.exists(closed);
      data.should.equal(firstData);
      var promise1 = writeStream.prepareWrite().then((function($__3) {
        var closed = $__3.closed;
        should.not.exists(closed);
        writeStream.write(secondData);
      }));
      var promise2 = readStream.read().then((function($__3) {
        var $__4 = $__3,
            closed = $__4.closed,
            data = $__4.data;
        should.not.exist(closed);
        data.should.equal(secondData);
        var promised21 = readStream.read().then((function($__4) {
          var $__5 = $__4,
              closed = $__5.closed,
              data = $__5.data;
          should.exists(closed);
          should.not.exists(data);
          callback();
        }));
        writeStream.closeWrite();
      }));
    }));
    var promise2 = writeStream.prepareWrite().then((function($__2) {
      var closed = $__2.closed;
      should.not.exists(closed);
      writeStream.write(firstData);
    }));
  }));
  it('should be able to write multiple times', (function(callback) {
    var $__2 = promisedChannel(),
        readStream = $__2.readStream,
        writeStream = $__2.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var thirdData = 'baz';
    var fourthData = 'blah';
    var closeErr = 'error';
    writeStream.write(firstData);
    writeStream.write(secondData);
    readStream.read().then((function($__2) {
      var $__3 = $__2,
          closed = $__3.closed,
          data = $__3.data;
      should.not.exist(closed);
      data.should.equal(firstData);
      readStream.read().then((function($__3) {
        var $__4 = $__3,
            closed = $__4.closed,
            data = $__4.data;
        should.not.exist(closed);
        data.should.equal(secondData);
        readStream.read().then((function($__4) {
          var $__5 = $__4,
              closed = $__5.closed,
              data = $__5.data;
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
