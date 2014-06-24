"use strict";
require('traceur');
var $__0 = $traceurRuntime.assertObject(require('../lib/empty.js')),
    emptyReadStream = $__0.emptyReadStream,
    emptyWriteStream = $__0.emptyWriteStream;
var should = require('should');
describe('empty stream test', (function() {
  it('test empty read stream', (function(callback) {
    var readStream = emptyReadStream();
    readStream.read((function(streamClosed, data) {
      should.exist(streamClosed);
      should.not.exist(data);
      callback(null);
    }));
    should.exist(readStream.isClosed());
  }));
  it('test empty write stream', (function(callback) {
    var writeStream = emptyWriteStream();
    writeStream.write('ignored data');
    writeStream.prepareWrite((function(streamClosed, writer) {
      should.exist(streamClosed);
      should.not.exist(writer);
      callback(null);
    }));
    should.exist(writeStream.isClosed());
  }));
}));
