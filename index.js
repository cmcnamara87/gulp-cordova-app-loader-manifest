'use strict';

var Stream = require('stream');
var gutil = require('gulp-util');
var _ = require('lodash');

var PLUGIN_NAME = 'gulp-cordova-app-loader-manifest';


var calManifest = function calManifest(options) {
    options = options || {};

    options.prefixSplit = options.prefixSplit || '/';

    if (!options.load) {
        options.load = ['**'];
    } else if (!(options.load instanceof Array)) {
        options.load = [options.load];
    }

    var manifest = {
        files: {},
        load: _.clone(options.load),
        root: options.root || './'
    };

    var stream = new Stream.Transform({objectMode: true});

    stream._transform = function (file, unused, done) {
        if (file.isNull() || !file.stat.isFile()) {
            return done();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return done();
        }

        var hasher = require('crypto').createHash('sha256');
        var filename = encodeURI(file.relative);
        var key = filename.replace(/\//g, '_');
        manifest.files[key] = {
            filename: filename,
            version: hasher.update(file.contents).digest('hex')
        };
        //var i, pattern;
        //for (i = 0; i < options.load.length; i++) {
        //    pattern = options.load[i];
        //    if (pattern.indexOf(filename) > -1) {
        //        manifest.load.push(pattern.split(options.prefixSplit).pop())
        //    }
        //}

        done();
    };

    stream._flush = function (done) {
        var file = new gutil.File({
            path: 'manifest.json',
            contents: new Buffer(JSON.stringify(manifest, null, 4))
        });
        stream.push(file);
        return done();
    };


    return stream;
};

module.exports = calManifest;
