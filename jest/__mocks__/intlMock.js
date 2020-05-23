/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const { transform } = require('webpack-utils/intl-loader');

module.exports = {
    /**
     * @param {string} src - transformed module source code
     * @param {string} filename - transformed module file path
     * @param {{[key: string]: any}} config - jest config
     * @param {{instrument: boolean}} options - additional options
     *
     * @returns {string}
     */
    process(src, filename, config, options) {
        return transform(src, filename, path.resolve(`${__dirname}/../../..`));
    },
};
