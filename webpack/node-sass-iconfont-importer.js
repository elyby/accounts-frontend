var path = require("path");

var glob = require('glob');
var loaderUtils = require("loader-utils");
var fontgen = require("webfonts-generator");

module.exports = function createImporter(options) {
    return function(url, fileContext, done) {
        if (options.test.test(url)) {
            var context = this.options.includePaths;
            var request = loaderUtils.urlToRequest(url);

            compiler.resolvers.normal.resolve(context, request, function(err, resourcePath) {
                if (err) return done(new Error(err));

                var context = path.dirname(resourcePath);
                var config = require(resourcePath);

                generate(
                    config,
                    options,
                    resourcePath,
                    context,
                    function(err, content) {
                        if (err) return done(new Error(err));

                        done({
                            contents: content
                        });
                    }
                );
            });
        } else {
            done(false);
        }
    };
}


var Plugin = module.exports.Plugin = function() {};

Plugin.prototype.apply = function(compiler) {
    setCompiler(compiler); // inject compiler to use in importer

    compiler.plugin("emit", function(compilation, callback) {
        Object.keys(emitQueue).forEach(function(url) {
            compilation.assets[url] = emitQueue[url];
        });

        callback();
    });
};

var compiler;

function setCompiler(instance) {
    // inject compiler instance for importer function
    compiler = instance;
}

var emitQueue = {};
var RawSource = require('webpack-sources').RawSource;
function emitFile(url, content) {
    // TODO: support multiple plugin instances?
    emitQueue[url] = new RawSource(content);
}

/**
 * Partially modified code of fontgen goes next
 */
var mimeTypes = {
    'eot': 'application/vnd.ms-fontobject',
    'svg': 'image/svg+xml',
    'ttf': 'application/x-font-ttf',
    'woff': 'application/font-woff'
};

function absolute(from, to) {
    if (arguments.length < 2) {
        return function (to) {
            return path.resolve(from, to);
        };
    }
    return path.resolve(from, to);
}

function getFilesAndDeps(patterns, context) {
    var files = [];
    var filesDeps = [];
    var directoryDeps = [];


    function addFile(file) {
        filesDeps.push(file);
        files.push(absolute(context, file));
    }

    function addByGlob(globExp) {
        var globOptions = {cwd: context};

        var foundFiles = glob.sync(globExp, globOptions);
        files = files.concat(foundFiles.map(absolute(context)));

        var globDirs = glob.sync(path.dirname(globExp) + '/', globOptions);
        directoryDeps = directoryDeps.concat(globDirs.map(absolute(context)));


    }

    // Re-work the files array.
    patterns.forEach(function (pattern) {
        if (glob.hasMagic(pattern)) {
            addByGlob(pattern);
        }
        else {
            addFile(pattern);
        }
    });

    return {
        files: files,
        dependencies: {
            directories: directoryDeps,
            files: filesDeps
        }
    };

}

function generate(config, params, resourcePath, context, cb) {
    config.__dirname = path.dirname(resourcePath);

    var filesAndDeps = getFilesAndDeps(config.files, context);
    config.files = filesAndDeps.files;

    // With everything set up, let's make an ACTUAL config.
    var formats = params.types || ['eot', 'woff', 'ttf', 'svg'];
    if (formats.constructor !== Array) {
        formats = [formats];
    }

    var fontconf = {
        files: config.files,
        fontName: config.fontName,
        types: formats,
        order: formats,
        fontHeight: config.fontHeight || 1000, // Fixes conversion issues with small svgs
        templateOptions: {
            baseClass: config.baseClass || "icon",
            classPrefix: 'classPrefix' in config ? config.classPrefix : "icon-"
        },
        rename: (typeof config.rename == "function" ? config.rename : function (f) {
            return path.basename(f, ".svg");
        }),
        dest: "",
        writeFiles: false
    };

    if (config.cssTemplate) {
        fontconf.cssTemplate = absolute(context, config.cssTemplate);
    }

    for (var option in config.templateOptions) {
        if (config.templateOptions.hasOwnProperty(option)) {
            fontconf.templateOptions[option] = config.templateOptions[option];
        }
    }

    // svgicons2svgfont stuff
    var keys = [
        "fixedWidth",
        "centerHorizontally",
        "normalize",
        "fontHeight",
        "round",
        "descent"
    ];
    for (var x in keys) {
        if (typeof config[keys[x]] != "undefined") {
            fontconf[keys[x]] = config[keys[x]];
        }
    }

    var pub = compiler.options.output.publicPath || '/';
    var embed = !!params.embed;

    fontgen(fontconf, function (err, res) {
        if (err) {
            return cb(err);
        }
        var urls = {};
        for (var i in formats) {
            var format = formats[i];
            if (!embed) {
                var filename = config.fileName || params.fileName || "[hash]-[fontname][ext]";
                filename = filename
                  .replace("[fontname]", fontconf.fontName)
                  .replace("[ext]", "." + format);
                var url = loaderUtils.interpolateName(this,
                  filename,
                  {
                      context: params.context || this.context,
                      content: res[format]
                  }
                );
                urls[format] = path.join(pub, url).replace(/\\/g, '/');
                emitFile(url, res[format]);
            } else {
                urls[format] = 'data:'
                  + mimeTypes[format]
                  + ';charset=utf-8;base64,'
                  + (new Buffer(res[format]).toString('base64'));
            }
        }
        cb(null, res.generateCss(urls));
    });
};
