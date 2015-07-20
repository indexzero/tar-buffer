# tar-buffer

Buffers entries from a tar.Parse() stream into memory.

## Usage

``` js
var fs = require('fs');
var zlib = require('zlib');
var tar = require('tar');
var TarBuffer = require('tar-buffer');

var parser = tar.Parse();
var buffer = new TarBuffer(parser)
  .on('error', function (err) { console.log ('tar error: %s', err); })
  .on('end', function () {
    //
    // Log all our files in memory
    //
    console.dir(parser.files);
  });

//
// Read our tarball and pipe it to the tar parser.
//
fs.createReadStream('any-tarball.tgz')
  .pipe(zlib.Unzip())
  .on('error', function (err) { console.log('zlib error: %s', err); })
  .pipe(parser);
```

### API

#### Options

- `log`: (optional) Log function to use. Expects `console.log` API.

#### Why isn't this a proper stream?

Underneath the covers, `tar` emits several events, not just `data` events which have to be handled seprately from a traditional stream.

##### Author: [Charlie Robbins](https://github.com/indexzero)
##### LICENSE: MIT
