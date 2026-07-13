/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const fileCache = {};
const isProduction = process.env.NODE_ENV === 'production';

module.exports = (ctx) => {
    // postcss-loader v5+ uses ctx.webpack, v4 used ctx.webpackLoaderContext
    const loader = ctx.webpack || ctx.webpackLoaderContext;

    return {
        syntax: 'postcss-scss',
        plugins: [
            require('postcss-import')({
                addModulesDirectories: ['./src'],

                resolve: (
                    (defaultResolve) => (url, basedir, importOptions) =>
                        defaultResolve(
                            // mainly to remove '~' from request
                            url.replace(/^~/, ''),
                            basedir,
                            importOptions,
                        )
                )(require('postcss-import/lib/resolve-id')),

                load: ((defaultLoad) => (filename, importOptions) => {
                    if (/\.font.(js|json)$/.test(filename)) {
                        // separately process calls to font loader
                        // e.g. `@import '~app/icons.font.json';`
                        if (!fileCache[filename] || !isProduction) {
                            fileCache[filename] = new Promise((resolve, reject) =>
                                loader.loadModule(filename, (err, source) => {
                                    if (err) {
                                        reject(err);

                                        return;
                                    }

                                    // loader.exec() was removed in webpack 5; evaluate the CommonJS module manually
                                    const mod = { exports: {} };

                                    // eslint-disable-next-line no-new-func
                                    new Function('module', 'exports', 'require', source)(mod, mod.exports, require);
                                    resolve(mod.exports);
                                }),
                            );
                        }

                        return fileCache[filename];
                    }

                    return defaultLoad(filename, importOptions);
                })(require('postcss-import/lib/load-content')),
            }),
            require('postcss-logical-properties-polyfill').default(),
        ],
    };
};
