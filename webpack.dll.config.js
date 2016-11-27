/* eslint-env node */

const path = require('path');

const webpack = require('webpack');

const vendor = Object.keys(require('./package.json').dependencies);

const isProduction = process.argv.some((arg) => arg === '-p');

const isTest = process.argv.some((arg) => arg.indexOf('karma') !== -1);

process.env.NODE_ENV = 'development';
if (isTest) {
    process.env.NODE_ENV = 'test';
}

const outputPath = path.join(__dirname, 'dll');

const webpackConfig = {
    entry: {
        vendor: vendor.concat([
            'core-js/library',
            'react-addons-perf',
            'redux-devtools',
            'redux-devtools-dock-monitor',
            'redux-devtools-log-monitor',
            'react-transform-hmr',
            'react-transform-catch-errors',
            'redbox-react',
            'react-intl/locale-data/en.js',
            'react-intl/locale-data/ru.js',
            'react-intl/locale-data/be.js',
            'react-intl/locale-data/uk.js'
        ])
    },

    output: {
        filename: '[name].dll.js?[hash]',
        path: outputPath,
        library: '[name]',
        publicPath: '/'
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            },
            __DEV__: true,
            __TEST__: isTest,
            __PROD__: false
        }),
        new webpack.DllPlugin({
            name: '[name]',
            path: path.join(outputPath, '[name].json')
        })
    ].concat(isProduction ? [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.UglifyJsPlugin()
    ] : [])
};

module.exports = webpackConfig;
