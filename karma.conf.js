/* eslint-env node */

// https://docs.gitlab.com/ce/ci/variables/README.html
// noinspection Eslint
const isCi = typeof process.env.CI !== 'undefined';

module.exports = function(config) {
    const params = {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon'],

        // list of files / patterns to load in the browser
        files: [
            'dll/vendor.dll.js',
            'tests/index.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'tests/index.js': ['webpack', 'sourcemap']
        },

        webpack: require('./webpack.config.js'),

        webpackServer: {
            noInfo: true // please don't spam the console when running in karma!
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['nyan'],

        nyanReporter: {
            // suppress the red background on errors in the error
            // report at the end of the test run
            suppressErrorHighlighting: true
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['jsdom'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    };

    if (isCi) {
        Object.assign(params, {
            reporters: ['dots'],
            autoWatch: false,
            singleRun: true,
            client: {
                captureConsole: false
            }
        });
    }

    config.set(params);
};
