var loaderUtils = require("loader-utils");

module.exports = function createImporter(options) {
    return function(url, fileContext, done) {
        if (options.test.test(url)) {
            var request = loaderUtils.urlToRequest(url);

            loaderContext.loadModule(request, function(err, source) {
                if (err) return done(new Error(err));

                done({
                    contents: loaderContext.exec(source)
                });
            });
        } else {
            done(false);
        }
    };
};


var loaderContext;
var Plugin = module.exports.Plugin = function() {};

Plugin.prototype.apply = function(compiler) {
    compiler.plugin('compilation', function(compilation) {
        compilation.plugin('normal-module-loader', setLoaderContext);
    });
};

function setLoaderContext(instance) {
    // inject loaderContext instance for importer function
    loaderContext = instance;
}
