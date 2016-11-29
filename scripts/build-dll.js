/* eslint-env node */
/* eslint-disable no-console */

const webpack = require('webpack');
const chalk = require('chalk');

const webpackConfig = require('../webpack.dll.config.js');

const compiler = webpack(webpackConfig);

compiler.run(function(err, stats) {
    if (err) {
        console.error(chalk.red(err));
        process.exit(1);
    }

    console.error(
        chalk.green('Dll was successfully build in %s ms'),
        stats.endTime - stats.startTime
    );
});
