/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// export default (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
// };
const wp = require('@cypress/webpack-preprocessor');

// for some reason loader can not locate babel.config. So we load it manually
const config = require('../../../babel.config');

module.exports = (on) => {
    const options = {
        webpackOptions: {
            mode: 'development',
            // webpack will transpile TS and JS files
            resolve: {
                extensions: ['.ts', '.js', '.json'],
            },
            module: {
                rules: [
                    {
                        test: /\.[tj]s$/,
                        exclude: [/node_modules/],
                        use: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    envName: 'webpack',
                                    cacheDirectory: true,
                                    // We don't have the webpack's API object, so just provide necessary methods
                                    ...config({
                                        env() {
                                            return 'development';
                                        },
                                        cache() {},
                                    }),
                                },
                            },
                        ],
                    },
                ],
            },
        },
    };

    on('file:preprocessor', wp(options));
};
