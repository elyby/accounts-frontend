/* eslint-env node */

var path = require('path');

var webpack = require('webpack');
var loaderUtils = require('loader-utils');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var cssUrl = require('./webpack/cssUrl');
var cssImport = require('postcss-import');
var iconfontImporter = require('./webpack/node-sass-iconfont-importer');

var vendor = Object.keys(require('./package.json').dependencies);

const rootPath = path.resolve('./src');

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

process.env.NODE_ENV = isProduction ? 'production' : 'development';
if (isTest) {
    process.env.NODE_ENV = 'test';
}

const CSS_CLASS_TEMPLATE = isProduction ? '[hash:base64:5]' : '[path][name]-[local]';

var config;
try {
    config = require('./config/dev.json');
} catch (err) {
    console.error('\n\n===\nPlease create dev.json config under ./config based on template.dev.json\n===\n\n');
    throw err;
}

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

var webpackConfig = {
    entry: {
        app: path.join(__dirname, 'src'),
        vendor: vendor
    },

    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js'
    },

    resolve: {
        root: rootPath,
        extensions: ['', '.js', '.jsx']
    },

    externals: isTest ? {
        // http://airbnb.io/enzyme/docs/guides/webpack.html
        cheerio: 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true,
        'react/addons': true
    } : {},

    devServer: {
        host: 'localhost',
        port: 8080,
        proxy: {
            '/api*': {
                headers: {
                    host: config.apiHost.replace(/https?:|\//g, '')
                },
                target: config.apiHost
            }
        },
        hot: true,
        inline: true,
        historyApiFallback: true
    },

    devtool: isTest ? 'inline-source-map' : 'eval',

    plugins: [
        new iconfontImporter.Plugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            },
            __DEV__: !isProduction,
            __TEST__: isTest,
            __PROD__: isProduction
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            favicon: 'src/favicon.ico',
            hash: isProduction,
            filename: 'index.html',
            inject: false,
            minify: {
                collapseWhitespace: isProduction
            }
        }),
        new webpack.ProvidePlugin({
            // window.fetch polyfill
            fetch: 'imports?this=>self!exports?self.fetch!whatwg-fetch'
        })
    ].concat(isTest ? [] : [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
    ]).concat(isProduction ? [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ] : []),

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
                loader: 'babel'
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                loader: 'url',
                query: {
                    limit: 1000,
                    name: 'assets/[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf)$/, // NOTE: svg is loaded by another loader for now
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
                loader: 'babel!intl!json'
            },
            {
                test: /\.font\.(js|json)$/,
                loader: 'raw!fontgen'
            }
        ]
    },

    resolveLoader: {
        alias: {
            intl: path.resolve('./webpack/intl-loader')
        }
    },

    sassLoader: {
        importer: iconfontImporter({
            test: /\.font.(js|json)$/
        })
    },

    postcss() {
        // TODO: иконочные шрифты эмитятся > 1 раза
        return [
            cssImport({
                path: rootPath,
                addDependencyTo: webpack,

                resolve: ((defaultResolve) =>
                    (url, basedir, importOptions) =>
                        defaultResolve(loaderUtils.urlToRequest(url), basedir, importOptions)
                )(require('postcss-import/lib/resolve-id')),

                load: ((defaultLoad) =>
                    (filename, importOptions) => {
                        if (/\.font.(js|json)$/.test(filename)) {
                            return new Promise((resolve, reject) =>
                                this.loadModule(filename, (err, source) =>
                                    err ? reject(err) : resolve(this.exec(source))
                                )
                            );
                        }

                        return defaultLoad(filename, importOptions);
                    }
                )(require('postcss-import/lib/load-content'))
            }),

            cssUrl(this)
        ];
    }
};

if (isDockerized) {
    webpackConfig.watchOptions = {
        poll: 2000
    };
    webpackConfig.devServer.host = '0.0.0.0';
}

if (isProduction) {
    webpackConfig.module.loaders.forEach((loader) => {
        if (loader.extractInProduction) {
            const parts = loader.loader.split('!');
            loader.loader = ExtractTextPlugin.extract(
                parts[0],
                parts.slice(1)
                    .join('!')
                    .replace(/[&?]sourcemap/, '')
            );
        }
    });

    webpackConfig.plugins.push(new ExtractTextPlugin('styles.css', {
        allChunks: true
    }));

    webpackConfig.devtool = false;
}

if (!isProduction && !isTest) {
    webpackConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    );
}

module.exports = webpackConfig;
