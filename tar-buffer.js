'use strict';

var events = require('events'),
    util = require('util'),
    concat = require('concat-stream'),
    ignore = require('ignore-file');

/*
 * function TarBuffer (parser, opts)
 * Represents a buffer for holding all tar data that is
 * emitted from "entry" events on the tar `parser`.
 */
var TarBuffer = module.exports = function TarBuffer(parser, opts) {
  if (!(this instanceof TarBuffer)) { return new TarBuffer(parser, opts); }
  events.EventEmitter.call(this);

  opts = opts || {};
  this.log = opts.log || function () {};
  this.strip = +opts.strip || 0;
  this.maxSize = +opts.maxSize || null;

  //
  // If we have an ignore, then configure it
  //
  this.filter = opts.ignore && ignore.compile(opts.ignore);

  this.parser = parser;
  this._buffering = 0;
  setImmediate(this.buffer.bind(this));
};

util.inherits(TarBuffer, events.EventEmitter);

/*
 * function buffer ()
 * Begins buffering entries from the tar parse
 * stream associated with this instance.
 */
TarBuffer.prototype.buffer = function () {
  var self = this;

  //
  // Remark: what's the best data structure for nested files?
  //
  this.files = {};
  this.parser.on('entry', function (e) {
    if (self.filter && self.filter(e.path)) {
      return self.log('ignore', e.props);
    }
    else if (self.maxSize && e.props.size > self.maxSize) {
      return self.log('too big', e.props);
    }

    //
    // If there is a number of segments to strip
    // from the path, then strip them away.
    //
    if (self.strip) {
      e.path = e.props.path = e.path
        .split('/').slice(self.strip).join('/');

      if (e.linkpath) {
        e.linkpath = e.props.linkpath = e.linkpath
          .split('/').slice(self.strip).join('/');
      }
    }

    self.log('entry', e.props);
    if (!self.listeners('entry').length) {
      self.files[e.path] = e;
    }

    //
    // Increment our count of things we are buffering
    // so that we properly emit `end`
    //
    self._buffering++;

    //
    // Remark: will there be errors on the entry object?
    //
    e.pipe(concat({ encoding: 'string' }, function (content) {
      self._buffering--;

      //
      // Do not emit "entry" events if we have already
      // encountered an error.
      //
      if (!self.errState) {
        e.content = content;
        self.emit('entry', e);
      }
    }));
  })
  //
  // Remark: is this the correct way to handle tar errors?
  // Or should we also emit an error ourselves?
  //
  .on('end', this._end.bind(this))
  .on('error', this._error.bind(this));
  //
  // Remark: adapted from `node-tar` examples. Leaving this sample
  // code here until their role in the `tar` format is better
  // understood.
  //
  // .on('extendedHeader', function (e) {
  //   console.error('extended pax header', e.props)
  //   e.on('end', function () {
  //     console.error('extended pax fields:', e.fields)
  //   })
  // })
  // .on('ignoredEntry', function (e) {
  //   console.error('ignoredEntry?!?', e.props)
  // })
  // .on('longLinkpath', function (e) {
  //   console.error('longLinkpath entry', e.props)
  //   e.on('end', function () {
  //     console.error('value=%j', e.body.toString())
  //   })
  // })
  // .on('longPath', function (e) {
  //   console.error('longPath entry', e.props)
  //   e.on('end', function () {
  //     console.error('value=%j', e.body.toString())
  //   })
  // })
};

/*
 * @private function _end ()
 * Attempts to end if no buffers are currently in-flight.
 */
TarBuffer.prototype._end = function () {
  if (this._buffering !== 0) { return; }
  this.emit('end');
};

/*
 * @private function _error ()
 * Stores the errState on this instance and emits the error event
 */
TarBuffer.prototype._error = function (err) {
  this.errState = err;
  this.emit('error', err);
};
