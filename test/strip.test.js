'use strict';

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),
    helpers = require('./helpers');

var fixturesDir = path.join(__dirname, 'fixtures');

describe('tar-buffer ignore', function () {
  it('should properly strip preceding paths', function (done) {
    var tarFile = path.join(fixturesDir, 'tar-buffer-0.0.0.tgz');
    var context = helpers.createValidTarBuffer({
      strip: 1,
      end: function onEnd(buffer) {
        assert.deepEqual(Object.keys(buffer.files), [
          'package.json',
          '.npmignore',
          'README.md',
          'LICENSE',
          'tar-buffer.js',
          'test/simple.test.js'
        ]);
        done();
      }
    });

    fs.createReadStream(tarFile)
      .pipe(zlib.Unzip())
      .on('error', context.onError)
      .pipe(context.parser);
  });
});
