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
var $__primitive_46_js__,
    $__simple_46_js__,
    $__promised_46_js__;
var primitiveChannel = ($__primitive_46_js__ = require("./primitive.js"), $__primitive_46_js__ && $__primitive_46_js__.__esModule && $__primitive_46_js__ || {default: $__primitive_46_js__}).primitiveChannel;
var $__1 = ($__simple_46_js__ = require("./simple.js"), $__simple_46_js__ && $__simple_46_js__.__esModule && $__simple_46_js__ || {default: $__simple_46_js__}),
    simpleReadStream = $__1.simpleReadStream,
    simpleWriteStream = $__1.simpleWriteStream,
    simpleChannel = $__1.simpleChannel;
var $__2 = ($__promised_46_js__ = require("./promised.js"), $__promised_46_js__ && $__promised_46_js__.__esModule && $__promised_46_js__ || {default: $__promised_46_js__}),
    promisedReadStream = $__2.promisedReadStream,
    promisedWriteStream = $__2.promisedWriteStream,
    promisedChannel = $__2.promisedChannel;
var createChannel = promisedChannel;
;
