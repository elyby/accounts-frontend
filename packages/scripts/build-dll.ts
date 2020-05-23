/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
/* eslint-disable no-console */

import fs, { Stats } from 'fs';
import webpack, { MultiCompiler } from 'webpack';
import chalk from 'chalk';

import webpackConfig from './../../webpack.dll.config';

// @ts-ignore
const compiler: MultiCompiler = webpack(webpackConfig);

Promise.all([stat(`${__dirname}/../../yarn.lock`), stat(`${__dirname}/../../dll/vendor.json`)])
    .then(([lockFileStats, dllFileStats]) => {
        const lockFile = new Date(lockFileStats.mtime);
        const dll = new Date(dllFileStats.mtime);

        if (dll < lockFile) {
            return Promise.reject({
                code: 'OUTDATED',
            });
        }

        logResult(chalk.green('Current dlls are up to date!'));
    })
    .catch((err) => {
        if (err.code !== 'ENOENT' && err.code !== 'OUTDATED') {
            return Promise.reject(err);
        }

        console.log('Rebuilding dlls...');

        return new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                if (err) {
                    return reject(err);
                }

                logResult(chalk.green('Dll was successfully build in %s ms'), stats.endTime! - stats.startTime!);

                resolve();
            });
        });
    })
    .catch((err) => {
        logResult(chalk.red('Unexpected error checking dll state'), err);
        process.exit(1);
    });

function logResult(...args: any[]): void {
    console.log('\n');
    console.log(...args);
    console.log('\n');
}

function stat(path: string): Promise<Stats> {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            err ? reject(err) : resolve(stats);
        });
    });
}
