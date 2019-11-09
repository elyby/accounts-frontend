/* eslint-env node */

require('@babel/register');

const path = require('path');
const webpack = require('webpack');
const chalk = require('chalk');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const CSPPlugin = require('csp-webpack-plugin');

const SUPPORTED_LANGUAGES = Object.keys(require('./src/i18n/index.json'));
const localeFlags = require('./src/components/i18n/localeFlags').default;
const rootPath = path.resolve('./src');
const outputPath = path.join(__dirname, 'dist');
const packageJson = require('./package.json');

let config = {};
try {
    config = require('./config/env.js');
} catch (err) {
    console.log(
        chalk.yellow('\nCan not find config/env.js. Running with defaults\n\n')
    );

    if (err.code !== 'MODULE_NOT_FOUND') {
        console.error(err);
    }
}

// TODO: add progress plugin
// TODO: configure bundle analyzer

/**
 * TODO: https://babeljs.io/docs/plugins/
 * TODO: отдельные конфиги для env (аля https://github.com/davezuko/react-redux-starter-kit)
 * TODO: dev tools https://github.com/freeqaz/redux-simple-router-example/blob/master/index.jsx
 * https://github.com/glenjamin/ultimate-hot-reloading-example ( обратить внимание на плагины babel )
 * https://github.com/gajus/react-css-modules ( + BrowserSync)
 * https://github.com/reactuate/reactuate
 * https://github.com/insin/nwb
 *
 * Inspiration projects:
 * https://github.com/davezuko/react-redux-starter-kit
 */

const isProduction = process.argv.some((arg) => arg === '-p');

const isTest = process.argv.some((arg) => arg.indexOf('karma') !== -1);

const isDockerized = !!process.env.DOCKERIZED;
const isCI = !!process.env.CI;
const isSilent = isCI || process.argv.some((arg) => /quiet/.test(arg));
const isCspEnabled = false;

process.env.NODE_ENV = isProduction ? 'production' : 'development';

if (isTest) {
    process.env.NODE_ENV = 'test';
}

const webpackConfig = {
    cache: true,

    entry: {
        app: path.join(__dirname, 'src')
    },

    output: {
        path: outputPath,
        publicPath: '/',
        filename: '[name].js?[hash]'
    },

    resolve: {
        modules: [rootPath, 'node_modules'],
        extensions: ['.js', '.jsx', '.json']
    },

    externals: isTest
        ? {
            sinon: 'sinon',
            // http://airbnb.io/enzyme/docs/guides/webpack.html
            cheerio: 'window',
            'react/lib/ExecutionEnvironment': true,
            'react/lib/ReactContext': true,
            'react/addons': true
        }
        : {},

    devtool: 'cheap-module-source-map',

    plugins: [
        new webpack.DefinePlugin({
            'window.SENTRY_CDN': config.sentryCdn
                ? JSON.stringify(config.sentryCdn)
                : undefined,
            'window.GA_ID':
                config.ga && config.ga.id
                    ? JSON.stringify(config.ga.id)
                    : undefined
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: process.env.NODE_ENV,
            APP_ENV: config.environment || process.env.NODE_ENV,
            __VERSION__: config.version || '',
            __DEV__: !isProduction,
            __TEST__: isTest,
            __PROD__: isProduction
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            favicon: 'src/favicon.ico',
            scripts: isProduction ? [] : ['/dll/vendor.dll.js'],
            hash: false, // webpack does this for all our assets automagically
            filename: 'index.html',
            inject: false,
            minify: {
                collapseWhitespace: isProduction
            },
            isCspEnabled
        }),
        new SitemapPlugin(
            'https://account.ely.by',
            [
                '/',
                '/register',
                '/resend-activation',
                '/activation',
                '/forgot-password',
                '/rules'
            ],
            {
                lastMod: true,
                changeFreq: 'weekly'
            }
        ),
        // restrict webpack import context, to create chunks only for supported locales
        // @see services/i18n.js
        new webpack.ContextReplacementPlugin(
            /locale-data/,
            new RegExp(`/(${SUPPORTED_LANGUAGES.join('|')})\\.js`)
        ),
        // @see components/i18n/localeFlags.js
        new webpack.ContextReplacementPlugin(
            /flag-icon-css\/flags\/4x3/,
            new RegExp(`/(${localeFlags.getCountryList().join('|')})\\.svg`)
        )
    ],

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: isProduction
                                    ? '[hash:base64:5]'
                                    : '[path][name]-[local]'
                            },
                            importLoaders: 2,
                            sourceMap: !isProduction
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !isProduction
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            sourceMap: !isProduction,
                            config: { path: __dirname }
                        }
                    }
                ]
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            envName: 'webpack',
                            cacheDirectory: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                loader: 'file-loader',
                query: {
                    name: 'assets/[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(woff|woff2|ttf)$/,
                loader: 'file-loader',
                query: {
                    name: 'assets/fonts/[name].[ext]?[hash]'
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.intl\.json$/,
                type: 'javascript/auto',
                use: ['babel-loader', 'intl-loader']
            },
            {
                // this is consumed by postcss-import
                // @see postcss.config.js
                test: /\.font\.(js|json)$/,
                type: 'javascript/auto',
                use: ['fontgen-loader']
            }
        ]
    },

    resolveLoader: {
        alias: {
            'intl-loader': path.resolve('./webpack-utils/intl-loader'),
            'fontgen-loader': path.resolve('./webpack-utils/fontgen-loader')
        }
    }
};

if (isProduction) {
    webpackConfig.module.rules.forEach((rule) => {
        if (rule.use && rule.use[0] === 'style-loader') {
            // replace `style-loader` with `MiniCssExtractPlugin`
            rule.use[0] = MiniCssExtractPlugin.loader;
        }
    });

    webpackConfig.plugins.push(
        // TODO: configure optimisations
        // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js?[hash]'),
        // new webpack.optimize.DedupePlugin(),
        // new webpack.optimize.UglifyJsPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css?[hash]',
            chunkFilename: '[id].css?[hash]',
        })
    );

    webpackConfig.devtool = 'hidden-source-map';

    // TODO: remove me after migration
    // With this code we have tried to configure which deps have go into the 'vendor.js' chunk
    // const ignoredPlugins = ['flag-icon-css'];

    // webpackConfig.entry.vendor = Object.keys(packageJson.dependencies).filter(
    //     (module) => !ignoredPlugins.includes(module)
    // );
} else {
    webpackConfig.plugins.push(
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./dll/vendor.json')
        })
    );
}

if (!isProduction && !isTest) {
    // TODO: review HMR integration
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    webpackConfig.devServer = {
        host: 'localhost',
        port: 8080,
        proxy: config.apiHost && {
            '/api': {
                target: config.apiHost,
                changeOrigin: true, // add host http-header, based on target
                secure: false // allow self-signed certs
            }
        },
        hot: true,
        inline: true,
        historyApiFallback: true
    };
}

if (isCspEnabled) {
    webpackConfig.plugins.push(
        new CSPPlugin({
            'default-src': '\'none\'',
            'style-src': ['\'self\'', '\'unsafe-inline\''],
            'script-src': [
                '\'self\'',
                '\'nonce-edge-must-die\'',
                '\'unsafe-inline\'',
                'https://www.google-analytics.com',
                'https://recaptcha.net/recaptcha/',
                'https://www.gstatic.com/recaptcha/',
                'https://www.gstatic.cn/recaptcha/'
            ],
            'img-src': ['\'self\'', 'data:', 'www.google-analytics.com'],
            'font-src': ['\'self\'', 'data:'],
            'connect-src': ['\'self\'', 'https://sentry.ely.by'].concat(
                isProduction ? [] : ['ws://localhost:8080']
            ),
            'frame-src': [
                'https://www.google.com/recaptcha/',
                'https://recaptcha.net/recaptcha/'
            ],
            'report-uri':
                'https://sentry.ely.by/api/2/csp-report/?sentry_key=088e7718236a4f91937a81fb319a93f6'
        })
    );
}

if (isDockerized) {
    webpackConfig.watchOptions = {
        poll: 2000
    };
    webpackConfig.devServer.host = '0.0.0.0';
}

if (isSilent) {
    webpackConfig.stats = {
        hash: false,
        version: false,
        timings: true,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: false,
        publicPath: false
    };
}

module.exports = webpackConfig;
