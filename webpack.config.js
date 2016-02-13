/* eslint-env node */

var path = require('path');

var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var cssnano = require('cssnano');
var iconfontImporter = require('./webpack/node-sass-iconfont-importer');

/**
 * TODO: https://babeljs.io/docs/plugins/
 * TODO: отдельные конфиги для env (аля https://github.com/davezuko/react-redux-starter-kit)
 * TODO: dev tools https://github.com/freeqaz/redux-simple-router-example/blob/master/index.jsx
 * https://github.com/glenjamin/ultimate-hot-reloading-example ( обратить внимание на плагины babel )
 * https://github.com/gajus/react-css-modules ( + BrowserSync)
 * https://github.com/reactuate/reactuate
 *
 * Inspiration projects:
 * https://github.com/davezuko/react-redux-starter-kit
 */

var isProduction = process.argv.some(function(arg) {
    return arg === '-p';
});

var isTest = process.argv.some(function(arg) {
    return arg.indexOf('karma') !== -1;
});

process.env.NODE_ENV = isProduction ? 'production' : 'development';

const CSS_CLASS_TEMPLATE = isProduction ? '[hash:base64:5]' : '[path][name]-[local]';
var config;

try {
    config = require('./config/dev.json');
} catch (err) {
    console.error('\n\n===\nPlease create dev.json config under ./config based on template.dev.json\n===\n\n');
    throw err;
}

var webpackConfig = {
    entry: {
        app: path.join(__dirname, 'src'),
        vendor: [
            'babel-polyfill',
            'classnames',
            'history',
            'intl-format-cache',
            'intl-messageformat',
            'react',
            'react-dom',
            'react-height',
            'react-helmet',
            'react-intl',
            'react-motion',
            'react-redux',
            'react-router',
            'react-router-redux',
            'redux',
            'redux-thunk'
        ]
    },

    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js'
    },

    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js', '.jsx']
    },

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
            template: 'src/index.html',
            favicon: 'src/favicon.ico',
            hash: isProduction,
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: isProduction
            }
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
                loader: 'style!css?modules&importLoaders=2&localIdentName=' + CSS_CLASS_TEMPLATE + '!postcss!sass'
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    },

    sassLoader: {
        importer: iconfontImporter({
            test: /\.font.(js|json)$/,
            types: ['woff', 'eot', 'ttf']
        })
    },

    postcss: [
        cssnano({
            // sourcemap: !isProduction,
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
        })
    ]
};


if (isProduction) {
    webpackConfig.module.loaders.forEach((loader) => {
        if (loader.extractInProduction) {
            var parts = loader.loader.split('!');
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
