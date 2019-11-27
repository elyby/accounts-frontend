/* eslint-env node */
/* eslint-disable no-console */

const fs = require('fs');

const webpack = require('webpack');
const chalk = require('chalk');

const webpackConfig = require('../webpack.dll.config.js');

const compiler = webpack(webpackConfig);

Promise.all([
  stat(`${__dirname}/../yarn.lock`),
  stat(`${__dirname}/../dll/vendor.json`),
])
  .then(stats => {
    const lockFile = new Date(stats[0].mtime);
    const dll = new Date(stats[1].mtime);

    if (dll < lockFile) {
      return Promise.reject({
        code: 'OUTDATED',
      });
    }

    logResult(chalk.green('Current dlls are up to date!'));
  })
  .catch(err => {
    if (err.code !== 'ENOENT' && err.code !== 'OUTDATED') {
      return Promise.reject(err);
    }

    console.log('Rebuilding dlls...');

    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }

        logResult(
          chalk.green('Dll was successfully build in %s ms'),
          stats.endTime - stats.startTime,
        );

        resolve();
      });
    });
  })
  .catch(err => {
    logResult(chalk.red('Unexpected error checking dll state'), err);
    process.exit(1);
  });

function logResult(...args) {
  console.log('\n');
  console.log(...args);
  console.log('\n');
}

function stat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      err ? reject(err) : resolve(stats);
    });
  });
}
