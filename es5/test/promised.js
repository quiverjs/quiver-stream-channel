"use strict";
var $__traceur_64_0_46_0_46_7__,
    $__chai__,
    $___46__46__47_lib_47_promised__;
($__traceur_64_0_46_0_46_7__ = require("traceur"), $__traceur_64_0_46_0_46_7__ && $__traceur_64_0_46_0_46_7__.__esModule && $__traceur_64_0_46_0_46_7__ || {default: $__traceur_64_0_46_0_46_7__});
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var promisedChannel = ($___46__46__47_lib_47_promised__ = require("../lib/promised"), $___46__46__47_lib_47_promised__ && $___46__46__47_lib_47_promised__.__esModule && $___46__46__47_lib_47_promised__ || {default: $___46__46__47_lib_47_promised__}).promisedChannel;
var should = chai.should();
describe('promised channel test', (function() {
  it('read write write read read closeWrite', (function(callback) {
    var $__2 = promisedChannel(),
        readStream = $__2.readStream,
        writeStream = $__2.writeStream;
    var firstData = 'foo';
    var secondData = 'bar';
    var closeErr = 'error';
    readStream.read().then((function($__3) {
      var $__4 = $__3,
          closed = $__4.closed,
          data = $__4.data;
      should.not.exist(closed);
      data.should.equal(firstData);
      writeStream.prepareWrite().then((function($__5) {
        var closed = $__5.closed;
        should.not.exist(closed);
        writeStream.write(secondData);
      }));
      readStream.read().then((function($__5) {
        var $__6 = $__5,
            closed = $__6.closed,
            data = $__6.data;
        should.not.exist(closed);
        data.should.equal(secondData);
        var promised21 = readStream.read().then((function($__7) {
          var $__8 = $__7,
              closed = $__8.closed,
              data = $__8.data;
          should.exist(closed);
          should.not.exist(data);
          callback();
        }));
        writeStream.closeWrite();
      }));
    })).catch(callback);
    writeStream.prepareWrite().then((function($__3) {
      var closed = $__3.closed;
      should.not.exist(closed);
      writeStream.write(firstData);
    })).catch(callback);
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
    readStream.read().then((function($__3) {
      var $__4 = $__3,
          closed = $__4.closed,
          data = $__4.data;
      should.not.exist(closed);
      data.should.equal(firstData);
      readStream.read().then((function($__5) {
        var $__6 = $__5,
            closed = $__6.closed,
            data = $__6.data;
        should.not.exist(closed);
        data.should.equal(secondData);
        readStream.read().then((function($__7) {
          var $__8 = $__7,
              closed = $__8.closed,
              data = $__8.data;
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
  it('close read while reading', (function(callback) {
    var $__2 = promisedChannel(),
        readStream = $__2.readStream,
        writeStream = $__2.writeStream;
    readStream.read().then((function($__3) {
      var $__4 = $__3,
          closed = $__4.closed,
          data = $__4.data;
      console.log('read callback triggered');
      callback(new Error('should not get callback'));
    }));
    readStream.closeRead();
    writeStream.prepareWrite().then((function($__3) {
      var closed = $__3.closed;
      callback();
    })).catch(callback);
  }));
}));
