// при использовании sass-loader теряется контекст в импортированных модулях
// из-за чего css-loader не может правильно обработать относительные url
//
// препроцессим урлы перед тем, как пропускать их через sass-loader
// урлы, начинающиеся с / будут оставлены как есть

const cssUrl = require('postcss-url');
const loaderUtils = require('loader-utils');

// /#.+$/ - strip #hash part of svg font url
const urlToRequest = (url) => loaderUtils.urlToRequest(url.replace(/\??#.+$/, ''), true);
const urlPostfix = (url) => {
    var idx = url.indexOf('?#');

    if (idx < 0) {
        idx = url.indexOf('#');
    }

    return idx >= 0 ? url.slice(idx) : '';
};

module.exports = function(loader) {
    return cssUrl({
        url: (url, decl, from, dirname, to, options, result) =>
            new Promise((resolve, reject) =>
                loaderUtils.isUrlRequest(url) ? loader.loadModule(urlToRequest(url), (err, source) =>
                    err ? reject(err) : resolve(
                        loader.exec(`
                            var __webpack_public_path__ = '${loader.options.output.publicPath}';
                            ${source}
                        `) + urlPostfix(url)
                    )
                ) : resolve(url)
            )
    });
};
