/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const vendor = Object.keys(require('./packages/app/package.json').dependencies);

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
    vendor,
  },

  output: {
    filename: '[name].dll.js?[hash]',
    path: outputPath,
    library: '[name]',
    publicPath: '/',
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['./packages/app/node_modules', './node_modules'],
  },

  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(outputPath, '[name].json'),
    }),
  ],
};

module.exports = webpackConfig;
