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
    console.dir(buffer.files);
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
- `ignore`: (optional) Array (or `/\r?\n/` delimted string) of ignorefile lines.
- `strip`: (optional) Number of preceding segments of an entry path to strip.
- `maxSize`: (optional) Maximum number of bytes in a single file to buffer.

#### Events
- `entry`: similar the `entry` events emitted by the `tar.Parse()` stream except that these entries have been fully read into memory. The contents are located on `e.content`:
``` js
var buffer = new TarBuffer(parser)
  .on('entry', function (e) {
    console.log(e.content); // Log all file contents
  });
```

#### Why isn't this a proper stream?

Underneath the covers, `tar` emits several events, not just `data` events which have to be handled seprately from a traditional stream.

##### Author: [Charlie Robbins](https://github.com/indexzero)
##### LICENSE: MIT
