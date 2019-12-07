/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const supportedLocales = require('app/i18n');
const vendor = Object.keys(require('./package.json').dependencies);

const isProduction = process.argv.some(arg => arg === '-p');
const isTest = process.argv.some(arg => arg.indexOf('karma') !== -1);

process.env.NODE_ENV = 'development';

if (isTest) {
  process.env.NODE_ENV = 'test';
}

if (isProduction) {
  throw new Error('Dll plugin should be used for dev mode only');
}

const outputPath = path.join(__dirname, 'dll');

const webpackConfig = {
  mode: 'development',

  entry: {
    vendor: vendor
      .concat([
        'core-js/library',
        'redux-devtools',
        'redux-devtools-dock-monitor',
        'redux-devtools-log-monitor',
        'react-transform-hmr',
        'react-transform-catch-errors',
      ])
      .concat(
        Object.keys(supportedLocales).map(
          locale => `react-intl/locale-data/${locale}.js`,
        ),
      ),
  },

  output: {
    filename: '[name].dll.js?[hash]',
    path: outputPath,
    library: '[name]',
    publicPath: '/',
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      __DEV__: true,
      __TEST__: isTest,
      __PROD__: false,
    }),
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(outputPath, '[name].json'),
    }),
  ],
};

module.exports = webpackConfig;
