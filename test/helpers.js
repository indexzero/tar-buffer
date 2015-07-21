'use strict';

var assert = require('assert'),
    tar = require('tar'),
    TarBuffer = require('../tar-buffer');

exports.createValidTarBuffer = function (opts) {
  var context = {
    parser: tar.Parse(),
    errState: false
  };

  //
  // Handle errors correctly by storing
  // the error state in this scope
  //
  context.buffer = new TarBuffer(context.parser, opts);
  context.onError = function onError(err) {
    context.errState = err;
  };

  context.buffer
    .on('error', context.onError)
    .on('end', function () {
      assert.ok(!context.errState);
      opts.end(context.buffer);
    });

  return context;
};
