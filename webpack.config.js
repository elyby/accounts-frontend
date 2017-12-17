/* eslint-env node */

const path = require('path');

const webpack = require('webpack');
const loaderUtils = require('loader-utils');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cssUrl = require('webpack-utils/cssUrl');
const cssImport = require('postcss-import');

const SUPPORTED_LANGUAGES = Object.keys(require('./src/i18n/index.json'));
const rootPath = path.resolve('./src');
const outputPath = path.join(__dirname, 'dist');

const packageJson = require('./package.json');

const localeToCountryCode = {
    en: 'gb',
    be: 'by',
    pt: 'br',
    uk: 'ua',
    vi: 'vn',
    sl: 'si',
};

const flagsList = SUPPORTED_LANGUAGES.map((locale) => localeToCountryCode[locale] || locale);

let config = {};
try {
    config = require('./config/env.js');
} catch (err) {
    console.error('\n\n===\nCan not find config/env.js. Running with defaults\n===\n\n', err);
}

/**
 * TODO: https://babeljs.io/docs/plugins/
 * TODO: отдельные конфиги для env (аля https://github.com/davezuko/react-redux-starter-kit)
 * TODO: dev tools https://github.com/freeqaz/redux-simple-router-example/blob/master/index.jsx
 * https://github.com/glenjamin/ultimate-hot-reloading-example ( обратить внимание на плагины babel )
 * https://github.com/gajus/react-css-modules ( + BrowserSync)
 * https://github.com/reactuate/reactuate
 * https://github.com/insin/nwb
 *
 * Inspiration projects:
 * https://github.com/davezuko/react-redux-starter-kit
 */

const isProduction = process.argv.some((arg) => arg === '-p');

const isTest = process.argv.some((arg) => arg.indexOf('karma') !== -1);

const isDockerized = !!process.env.DOCKERIZED;
const isCI = !!process.env.CI;
const isSilent = isCI || process.argv.some((arg) => /quiet/.test(arg));

process.env.NODE_ENV = isProduction ? 'production' : 'development';
if (isTest) {
    process.env.NODE_ENV = 'test';
}

const CSS_CLASS_TEMPLATE = isProduction ? '[hash:base64:5]' : '[path][name]-[local]';

const fileCache = {};

const cssLoaderQuery = {
    modules: true,
    importLoaders: 2,
    url: false,
    localIdentName: CSS_CLASS_TEMPLATE,

    /**
     * cssnano options
     */
    sourcemap: !isProduction,
    autoprefixer: {
        add: true,
        remove: true,
        browsers: ['last 2 versions']
    },
    safe: true,
    // отключаем минификацию цветов, что бы она не ломала такие выражения:
    // composes: black from './buttons.scss';
    colormin: false,
    discardComments: {
        removeAll: true
    }
};

const webpackConfig = {
    cache: true,

    entry: {
        app: path.join(__dirname, 'src')
    },

    output: {
        path: outputPath,
        publicPath: '/',
        filename: '[name].js?[hash]'
    },

    resolve: {
        root: rootPath,
        extensions: ['', '.js', '.jsx']
    },

    externals: isTest ? {
        sinon: 'sinon',
        // http://airbnb.io/enzyme/docs/guides/webpack.html
        cheerio: 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true,
        'react/addons': true
    } : {},

    devtool: 'cheap-module-eval-source-map',

    plugins: [
        new webpack.DefinePlugin({
            'window.SENTRY_CDN': config.sentryCdn ? JSON.stringify(config.sentryCdn) : undefined,
            'window.GA_ID': config.ga && config.ga.id ? JSON.stringify(config.ga.id) : undefined,
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                APP_ENV: JSON.stringify(config.environment || process.env.NODE_ENV),
                __VERSION__: JSON.stringify(packageJson.version),
                __DEV__: !isProduction,
                __TEST__: isTest,
                __PROD__: isProduction
            }
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            favicon: 'src/favicon.ico',
            scripts: isProduction ? [] : ['/dll/vendor.dll.js'],
            hash: false, // webpack does this for all our assets automagically
            filename: 'index.html',
            inject: false,
            minify: {
                collapseWhitespace: isProduction
            }
        }),
        new webpack.ProvidePlugin({
            React: 'react'
        }),
        // restrict webpack import context, to create chunks only for supported locales
        // @see services/i18n.js
        new webpack.ContextReplacementPlugin(
            /locale-data/, new RegExp(`/(${SUPPORTED_LANGUAGES.join('|')})\\.js`)
        ),
        // @see functions.js:requireLocaleFlag()
        new webpack.ContextReplacementPlugin(
            /flag-icon-css\/flags\/4x3/, new RegExp(`/(${flagsList.join('|')})\\.svg`)
        ),
    ],

    module: {
        loaders: [
            {
                test: /\.scss$/,
                extractInProduction: true,
                loader: 'style!css?' + JSON.stringify(cssLoaderQuery) + '!sass!postcss?syntax=postcss-scss'
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel?cacheDirectory=true'
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                loader: 'file',
                query: {
                    name: 'assets/[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(woff|woff2|ttf)$/,
                loader: 'file',
                query: {
                    name: 'assets/fonts/[name].[ext]?[hash]'
                }

            },
            {
                test: /\.json$/,
                exclude: /(intl|font)\.json/,
                loader: 'json'
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.intl\.json$/,
                loader: 'babel!intl'
            },
            {
                test: /\.font\.(js|json)$/,
                loader: 'raw!fontgen'
            }
        ]
    },

    resolveLoader: {
        alias: {
            intl: path.resolve('webpack-utils/intl-loader')
        }
    },

    postcss() {
        return [
            cssImport({
                path: rootPath,

                resolve: ((defaultResolve) =>
                    (url, basedir, importOptions) =>
                        defaultResolve(loaderUtils.urlToRequest(url), basedir, importOptions)
                )(require('postcss-import/lib/resolve-id')),

                load: ((defaultLoad) =>
                    (filename, importOptions) => {
                        if (/\.font.(js|json)$/.test(filename)) {
                            if (!fileCache[filename] || !isProduction) {
                                // do not execute loader on the same file twice
                                // this is an overcome for a bug with ExtractTextPlugin, for isProduction === true
                                // when @imported files may be processed mutiple times
                                fileCache[filename] = new Promise((resolve, reject) =>
                                    this.loadModule(filename, (err, source) =>
                                        err ? reject(err) : resolve(this.exec(source, rootPath))
                                    )
                                );
                            }

                            return fileCache[filename];
                        }

                        return defaultLoad(filename, importOptions);
                    }
                )(require('postcss-import/lib/load-content'))
            }),

            cssUrl(this)
        ];
    }
};

if (isProduction) {
    webpackConfig.module.loaders.forEach((loader) => {
        if (loader.extractInProduction) {
            // remove style-loader from chain and pass through ExtractTextPlugin
            const parts = loader.loader.split('!');

            loader.loader = ExtractTextPlugin.extract(
                parts[0], // style-loader
                parts.slice(1) // css-loader and rest
                    .join('!')
                    .replace(/[&?]sourcemap/, '')
            );
        }
    });

    webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js?[hash]'),
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin('styles.css?[hash]', {
            allChunks: true
        })
    );

    webpackConfig.devtool = false;

    const ignoredPlugins = [
        'flag-icon-css',
    ];

    webpackConfig.entry.vendor = Object.keys(packageJson.dependencies)
        .filter((module) => ignoredPlugins.indexOf(module) === -1);
} else {
    webpackConfig.plugins.push(
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./dll/vendor.json')
        })
    );
}

if (!isProduction && !isTest) {
    webpackConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    );

    if (config.apiHost) {
        webpackConfig.devServer = {
            host: 'localhost',
            port: 8080,
            proxy: {
                '/api': {
                    target: config.apiHost,
                    changeOrigin: true, // add host http-header, based on target
                    secure: false // allow self-signed certs
                }
            },
            hot: true,
            inline: true,
            historyApiFallback: true
        };
    }
}

if (isDockerized) {
    webpackConfig.watchOptions = {
        poll: 2000
    };
    webpackConfig.devServer.host = '0.0.0.0';
}

if (isSilent) {
    webpackConfig.stats = {
        hash: false,
        version: false,
        timings: true,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: false,
        publicPath: false
    };
}

module.exports = webpackConfig;
