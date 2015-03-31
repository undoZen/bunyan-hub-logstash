var util = require('util');
var bunyan = require('bunyan');
var dgram = require('dgram');
var Writable = require('stream').Writable;

function clone(obj) {
    // we only need to clone refrence types (Object)
    if (!(obj instanceof Object)) {
        return obj;
    } else if (obj instanceof Date) {
        return obj;
    }

    var copy = {};
    for (var i in obj) {
        if (Array.isArray(obj[i])) {
            copy[i] = obj[i].slice(0);
        } else if (obj[i] instanceof Buffer) {
            copy[i] = obj[i].slice(0);
        } else if (typeof obj[i] != 'function') {
            copy[i] = obj[i] instanceof Object ? clone(obj[i]) : obj[i];
        } else if (typeof obj[i] === 'function') {
            copy[i] = obj[i];
        }
    }

    return copy;
}

function LogstashStream(options) {
    Writable.call(this, {
        objectMode: true
    });
    options = options || {};

    this.name = 'bunyan';
    this.level = options.level || 'info';
    this.host = options.host || '127.0.0.1';
    this.port = options.port || 9999;
    this.tags = options.tags || ["bunyan"];
    this.type = options.type;

    this.client = null;
}

var levels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
};

function createLogstashStream(options) {
    return new LogstashStream(options);
};

util.inherits(LogstashStream, Writable);

LogstashStream.prototype._write = function logstashWrite(entry, enc, cb) {
    var level, rec, msg;

    if (typeof (entry) === 'string') {
        entry = JSON.parse(entry);
    }

    rec = clone(entry);

    level = rec.level;

    if (levels.hasOwnProperty(level)) {
        level = levels[level];
    }

    msg = {
        '@timestamp': rec.time.toISOString(),
        '@message': rec.msg,
        '@tags': this.tags,
        '@source': rec.hostname + "/" + rec.app,
        '@level': level
    };

    if (typeof (this.type) === 'string') {
        msg['@type'] = this.type;
    }

    delete rec.time;
    delete rec.msg;

    // Remove internal bunyan fields that won't mean anything outside of
    // a bunyan context.
    delete rec.v;

    rec.bunyanLevel = rec.level;
    rec.source = rec.hostname + '/' + rec.app;
    rec.level = level;

    msg['@fields'] = rec;

    this.send(JSON.stringify(msg, bunyan.safeCycles()));
    cb();
};

LogstashStream.prototype.send = function logstashSend(message) {
    var self = this;
    var buf = new Buffer(message);

    if (!self.client) {
        self.client = dgram.createSocket('udp4');
    }

    self.client.send(buf, 0, buf.length, self.port, self.host);
};


module.exports = {
    createStream: createLogstashStream,
    LogstashStream: LogstashStream
};
