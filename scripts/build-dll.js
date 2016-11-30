/* eslint-env node */
/* eslint-disable no-console */

const fs = require('fs');

const webpack = require('webpack');
const chalk = require('chalk');

const webpackConfig = require('../webpack.dll.config.js');

const compiler = webpack(webpackConfig);

Promise.all([
    stat(__dirname + '/../npm-shrinkwrap.json'),
    stat(__dirname + '/../dll/vendor.json')
])
.then(function(stats) {
    const shrinkwrap = new Date(stats[0].mtime);
    const dll = new Date(stats[1].mtime);

    if (dll < shrinkwrap) {
        return Promise.reject({
            code: 'OUTDATED'
        });
    }

    logResult(chalk.green('Current dlls are up to date!'));
})
.catch(function(err) {
    if (err.code !== 'ENOENT' && err.code !== 'OUTDATED') {
        return Promise.reject(err);
    }

    console.log('Rebuilding dlls...');

    return new Promise(function(resolve, reject) {
        compiler.run(function(err, stats) {
            if (err) {
                return reject(err);
            }

            logResult(
                chalk.green('Dll was successfully build in %s ms'),
                stats.endTime - stats.startTime
            );

            resolve();
        });
    });
})
.catch(function(err) {
    logResult(chalk.red('Unexpected error checking dll state'), err);
    process.exit(1);
});

function logResult() {
    console.log('\n');
    console.log.apply(console, arguments);
    console.log('\n');
}

function stat(path) {
    return new Promise(function(resolve, reject) {
        fs.stat(path, function(err, stats) {
            err ? reject(err) : resolve(stats);
        });
    });
}
