/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const loaderUtils = require('loader-utils');
const fileCache = {};
const isProduction = process.argv.some((arg) => arg === '-p');
const rootPath = path.resolve('./src');

module.exports = ({ webpack: loader }) => ({
    syntax: 'postcss-scss',
    plugins: {
        'postcss-import': {
            addModulesDirectories: ['./src'],

            resolve: ((defaultResolve) => (url, basedir, importOptions) =>
                defaultResolve(
                    // mainly to remove '~' from request
                    loaderUtils.urlToRequest(url),
                    basedir,
                    importOptions,
                ))(require('postcss-import/lib/resolve-id')),

            load: ((defaultLoad) => (filename, importOptions) => {
                if (/\.font.(js|json)$/.test(filename)) {
                    // separately process calls to font loader
                    // e.g. `@import '~app/icons.font.json';`
                    if (!fileCache[filename] || !isProduction) {
                        // do not execute loader on the same file twice
                        // this is an overcome for a bug with ExtractTextPlugin, for isProduction === true
                        // when @imported files may be processed multiple times
                        fileCache[filename] = new Promise((resolve, reject) =>
                            loader.loadModule(filename, (err, source) => {
                                if (err) {
                                    reject(err);

                                    return;
                                }

                                resolve(loader.exec(source, rootPath));
                            }),
                        );
                    }

                    return fileCache[filename];
                }

                return defaultLoad(filename, importOptions);
            })(require('postcss-import/lib/load-content')),
        },
        'postcss-bidirection': {},
        // TODO: for some reason cssnano strips out @mixin declarations
        // cssnano: {
        //     /**
        //      * TODO: cssnano options
        //      */
        //     // autoprefixer: {
        //     //     add: true,
        //     //     remove: true,
        //     //     browsers: ['last 2 versions']
        //     // },
        //     // safe: true,
        //     // // отключаем минификацию цветов, что бы она не ломала такие выражения:
        //     // // composes: black from '~./buttons.scss';
        //     // colormin: false,
        //     // discardComments: {
        //     //     removeAll: true
        //     // }
        //     preset: 'default'
        // }
    },
});
