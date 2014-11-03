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
var $__primitive__,
    $__simple__,
    $__promised__;
var primitiveChannel = ($__primitive__ = require("./primitive"), $__primitive__ && $__primitive__.__esModule && $__primitive__ || {default: $__primitive__}).primitiveChannel;
var $__1 = ($__simple__ = require("./simple"), $__simple__ && $__simple__.__esModule && $__simple__ || {default: $__simple__}),
    simpleReadStream = $__1.simpleReadStream,
    simpleWriteStream = $__1.simpleWriteStream,
    simpleChannel = $__1.simpleChannel;
var $__2 = ($__promised__ = require("./promised"), $__promised__ && $__promised__.__esModule && $__promised__ || {default: $__promised__}),
    promisedReadStream = $__2.promisedReadStream,
    promisedWriteStream = $__2.promisedWriteStream,
    promisedChannel = $__2.promisedChannel;
var createChannel = promisedChannel;
;
