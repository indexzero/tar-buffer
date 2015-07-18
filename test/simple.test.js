'use strict';

var path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),
    tar = require('tar'),
    TarBuffer = require('../tar-buffer');

var fixturesDir = path.join(__dirname, 'fixtures');

describe('tar-buffer simple', function () {
  it('should untar and buffer a valid tar.Parse() stream', function (done) {
    var tarFile = path.join(fixturesDir, 'tar-buffer-0.0.0.tgz');
    var parser = tar.Parse();
    var buffer = new TarBuffer(parser);


    fs.createReadStream(tarFile)
      .pipe(zlib.Unzip())
      .pipe(parser)
      .on('end', function () {
        console.dir(buffer.files);
        done();
      });
  });
});
