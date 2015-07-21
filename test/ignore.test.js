'use strict';

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),
    helpers = require('./helpers');

var fixturesDir = path.join(__dirname, 'fixtures');

describe('tar-buffer ignore', function () {
  it('should properly ignore explicit files', function (done) {
    var tarFile = path.join(fixturesDir, 'tar-buffer-0.0.0.tgz');
    var context = helpers.createValidTarBuffer({
      ignore: ['LICENSE', 'test'],
      end: function onEnd(buffer) {
        assert.deepEqual(Object.keys(buffer.files), [
          'package/package.json',
          'package/.npmignore',
          'package/README.md',
          'package/tar-buffer.js'
        ]);
        done();
      }
    });

    fs.createReadStream(tarFile)
      .pipe(zlib.Unzip())
      .on('error', context.onError)
      .pipe(context.parser);
  });

  it('should properly ignore all file types', function (done) {
    var tarFile = path.join(fixturesDir, 'tar-buffer-0.0.0.tgz');
    var context = helpers.createValidTarBuffer({
      ignore: ['*.js'],
      end: function onEnd(buffer) {
        assert.deepEqual(Object.keys(buffer.files), [
          'package/package.json',
          'package/.npmignore',
          'package/README.md',
          'package/LICENSE'
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
