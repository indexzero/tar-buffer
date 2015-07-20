'use strict';

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),
    tar = require('tar'),
    TarBuffer = require('../tar-buffer');

var fixturesDir = path.join(__dirname, 'fixtures');

/*
 * Helper function for asserting files in our tar-buffer-0.0.0.tgz
 * test fixture.
 */
function assertTarBufferFiles(obj) {
  assert.deepEqual(Object.keys(obj).sort(), [
    'package/package.json',
    'package/.npmignore',
    'package/README.md',
    'package/LICENSE',
    'package/tar-buffer.js',
    'package/test/simple.test.js'
  ].sort());
}

describe('tar-buffer simple', function () {
  it('should untar and buffer a valid tar.Parse() stream', function (done) {
    var tarFile = path.join(fixturesDir, 'tar-buffer-0.0.0.tgz');
    var parser = tar.Parse();
    var buffer = new TarBuffer(parser);
    var errState;

    //
    // Handle errors correctly by storing
    // the error state in this scope
    //
    function onError(err) {
      errState = err;
    }

    buffer
      .on('error', onError)
      .on('end', function () {
        assert.ok(!errState);
        assertTarBufferFiles(buffer.files);
        done();
      });

    fs.createReadStream(tarFile)
      .pipe(zlib.Unzip())
      .on('error', onError)
      .pipe(parser);
  });

  it('should emit error on a bad tarball file', function (done) {
    var tarFile = path.join(fixturesDir, 'not-a-tarball.tgz');
    var parser = tar.Parse();
    var buffer = TarBuffer(parser);
    var ended;

    buffer
      .on('end', function () { ended = true; })
      .on('error', function (err) {
        assert.ok(!ended);
        assert.equal(err.message, 'invalid tar file');
        done();
      });

    fs.createReadStream(tarFile)
      .pipe(parser);
  });

  it('should allow for custom "entry" events', function (done) {
    var tarFile = path.join(fixturesDir, 'tar-buffer-0.0.0.tgz');
    var parser = tar.Parse();
    var buffer = new TarBuffer(parser);
    var props = {};
    var errState;

    //
    // Handle errors correctly by storing
    // the error state in this scope
    //
    function onError(err) {
      errState = err;
    }

    buffer
      .on('entry', function (e) {
        props[e.props.path] = e.props;
      })
      .on('error', onError)
      .on('end', function () {
        assert.ok(!errState);
        assertTarBufferFiles(props);
        Object.keys(props).forEach(function (e) {
          assert.ok(typeof e.path, 'string');
        });

        done();
      });

    fs.createReadStream(tarFile)
      .pipe(zlib.Unzip())
      .on('error', onError)
      .pipe(parser);
  });
});
