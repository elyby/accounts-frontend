/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const vendor = Object.keys(require('./packages/app/package.json').dependencies);
const baseConfig = require('./babel.config');

if (process.env.NODE_ENV === 'production') {
  throw new Error('Dll plugin should be used for dev mode only');
}

const outputPath = path.join(__dirname, 'dll');

const webpackConfig = {
  mode: 'development',

  entry: {
    vendor: vendor.filter(
      item =>
        // if we include rhl in dll. It won't work for some reason
        !item.includes('react-hot-loader'),
    ),
  },

  output: {
    filename: '[name].dll.js?[hash]',
    path: outputPath,
    library: '[name]',
    publicPath: '/',
  },

  // @ts-ignore
  resolve: baseConfig.resolve,

  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(outputPath, '[name].json'),
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
    }),
  ],
};

module.exports = webpackConfig;
