"use strict";
Object.defineProperties(exports, {
  createChannel: {get: function() {
      return createChannel;
    }},
  primitiveChannel: {get: function() {
      return primitiveChannel;
    }},
  simpleReadStream: {get: function() {
      return simpleReadStream;
    }},
  simpleWriteStream: {get: function() {
      return simpleWriteStream;
    }},
  simpleChannel: {get: function() {
      return simpleChannel;
    }},
  promisedReadStream: {get: function() {
      return promisedReadStream;
    }},
  promisedWriteStream: {get: function() {
      return promisedWriteStream;
    }},
  promisedChannel: {get: function() {
      return promisedChannel;
    }},
  __esModule: {value: true}
});
var primitiveChannel = $traceurRuntime.assertObject(require('./primitive.js')).primitiveChannel;
var $__0 = $traceurRuntime.assertObject(require('./simple.js')),
    simpleReadStream = $__0.simpleReadStream,
    simpleWriteStream = $__0.simpleWriteStream,
    simpleChannel = $__0.simpleChannel;
var $__0 = $traceurRuntime.assertObject(require('./promised.js')),
    promisedReadStream = $__0.promisedReadStream,
    promisedWriteStream = $__0.promisedWriteStream,
    promisedChannel = $__0.promisedChannel;
var createChannel = promisedChannel;
;
