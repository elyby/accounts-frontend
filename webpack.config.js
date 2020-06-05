/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

require('@babel/register')({
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
});

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const CSPPlugin = require('csp-webpack-plugin');
const WebpackBar = require('webpackbar');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const EagerImportsPlugin = require('eager-imports-webpack-plugin').default;
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const config = require('./config');
const SUPPORTED_LANGUAGES = Object.keys(require('app/i18n').default);
const localeFlags = require('app/components/i18n/localeFlags').default;
const rootPath = path.resolve('./packages');
const outputPath = path.join(__dirname, 'build');

const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = process.argv.some((arg) => arg === '--analyze');

const isDockerized = !!process.env.DOCKERIZED;
const isStorybook = process.env.APP_ENV === 'storybook';
const isCI = !!process.env.CI;
const isSilent = isCI || process.argv.some((arg) => /quiet/.test(arg));
const isCspEnabled = false;
const enableDll = !isProduction && !isStorybook;

process.env.NODE_ENV = isProduction ? 'production' : 'development';

const smp = new SpeedMeasurePlugin();

const webpackConfig = {
    mode: isProduction ? 'production' : 'development',

    cache: true,

    entry: {
        app: path.join(__dirname, 'packages/app'),
    },

    output: {
        path: outputPath,
        publicPath: '/',
        filename: '[name].js?[hash]',
    },

    resolve: {
        modules: [rootPath, 'node_modules'],
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        alias: {
            'react-dom': isProduction ? 'react-dom' : '@hot-loader/react-dom',
        },
    },

    devtool: 'cheap-module-source-map',

    stats: {
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
        publicPath: false,
    },

    plugins: [
        new WebpackBar(),
        new webpack.DefinePlugin({
            'window.SENTRY_DSN': config.sentryDSN ? JSON.stringify(config.sentryDSN) : undefined,
            'window.GA_ID': config.ga && config.ga.id ? JSON.stringify(config.ga.id) : undefined,
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: process.env.NODE_ENV,
            __VERSION__: config.version || '',
        }),
        new HtmlWebpackPlugin({
            template: 'packages/app/index.ejs',
            favicon: 'packages/app/favicon.ico',
            scripts: enableDll ? ['/dll/vendor.dll.js'] : [],
            hash: false, // webpack does this for all our assets automagically
            filename: 'index.html',
            inject: false,
            minify: {
                collapseWhitespace: isProduction,
            },
            isCspEnabled,
        }),
        new SitemapPlugin(
            'https://account.ely.by',
            ['/', '/register', '/resend-activation', '/activation', '/forgot-password', '/rules'],
            {
                lastMod: true,
                changeFreq: 'weekly',
            },
        ),
        // restrict webpack import context, to create chunks only for supported locales
        // @see services/i18n/intlPolyfill.js
        new webpack.ContextReplacementPlugin(/locale-data/, new RegExp(`/(${SUPPORTED_LANGUAGES.join('|')})\\.js$`)),
        // @see components/i18n/localeFlags.js
        new webpack.ContextReplacementPlugin(
            /flag-icon-css\/flags\/4x3/,
            new RegExp(`/(${localeFlags.getCountryList().join('|')})\\.svg`),
        ),
    ],

    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            // style-loader@1.1.2 is still buggy. It breaks our icon styles
                            // (vertical align is broken and styles applied multiple times)
                            // so we can not use it and it's new `esModule` options
                            // esModule: true,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: isProduction ? '[hash:base64:5]' : '[path][name]-[local]',
                            },
                            esModule: true,
                            importLoaders: 2,
                            sourceMap: !isProduction,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !isProduction,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            sourceMap: !isProduction,
                            config: { path: __dirname },
                        },
                    },
                ],
            },
            {
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            envName: 'webpack',
                            cacheDirectory: true,
                        },
                    },
                ],
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                loader: 'file-loader',
                query: {
                    name: 'assets/[name].[ext]?[hash]',
                },
            },
            {
                test: /\.(woff|woff2|ttf)$/,
                loader: 'file-loader',
                query: {
                    name: 'assets/fonts/[name].[ext]?[hash]',
                },
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                // this is consumed by postcss-import
                // @see postcss.config.js
                test: /\.font\.(js|json)$/,
                type: 'javascript/auto',
                use: ['fontgen-loader'],
            },
        ],
    },

    resolveLoader: {
        alias: {
            'fontgen-loader': path.resolve('./packages/webpack-utils/fontgen-loader'),
        },
    },
};

if (isAnalyze) {
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

if (isProduction) {
    if (!isStorybook) {
        let cssExtractApplied = false;

        webpackConfig.module.rules.forEach((rule) => {
            if (rule.use && (rule.use[0] === 'style-loader' || rule.use[0].loader === 'style-loader')) {
                // replace `style-loader` with `MiniCssExtractPlugin`
                rule.use[0] = MiniCssExtractPlugin.loader;
                cssExtractApplied = true;
            }
        });

        if (!cssExtractApplied) {
            throw new Error('Can not locate style-loader to replace it with mini-css-extract-plugin loader');
        }

        webpackConfig.plugins.push(
            new MiniCssExtractPlugin({
                filename: '[name].css?[hash]',
                chunkFilename: '[id].css?[hash]',
            }),
        );
    }

    webpackConfig.devtool = 'hidden-source-map';

    webpackConfig.optimization = {
        moduleIds: 'hashed',
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: (m) =>
                        String(m.context).includes('node_modules') &&
                        // icons and intl with relateed polyfills are allowed
                        // to be splitted to other chunks
                        !/\/(flag-icon-css|intl|@formatjs)\//.test(String(m.context)),
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    };
} else {
    webpackConfig.plugins.push(
        // force webpack to use mode: eager chunk imports in dev mode
        // this will improve build performance
        // this mode will be default for dev builds in webpack 5
        new EagerImportsPlugin(),
    );

    if (enableDll) {
        webpackConfig.plugins.push(
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./dll/vendor.json'),
            }),
        );
    }

    webpackConfig.devServer = {
        host: 'localhost',
        port: 8080,
        proxy: config.apiHost && {
            '/api': {
                target: config.apiHost,
                changeOrigin: true, // add host http-header, based on target
                secure: false, // allow self-signed certs
            },
        },
        hot: true,
        inline: true,
        historyApiFallback: true,
    };
}

if (isCspEnabled) {
    webpackConfig.plugins.push(
        new CSPPlugin({
            'default-src': "'none'",
            'style-src': ["'self'", "'unsafe-inline'"],
            'script-src': [
                "'self'",
                "'nonce-edge-must-die'",
                "'unsafe-inline'",
                'https://www.google-analytics.com',
                'https://recaptcha.net/recaptcha/',
                'https://www.gstatic.com/recaptcha/',
                'https://www.gstatic.cn/recaptcha/',
            ],
            'img-src': ["'self'", 'data:', 'www.google-analytics.com'],
            'font-src': ["'self'", 'data:'],
            'connect-src': ["'self'", 'https://sentry.ely.by'].concat(isProduction ? [] : ['ws://localhost:8080']),
            'frame-src': ['https://www.google.com/recaptcha/', 'https://recaptcha.net/recaptcha/'],
            'report-uri': 'https://sentry.ely.by/api/2/csp-report/?sentry_key=088e7718236a4f91937a81fb319a93f6',
        }),
    );
}

if (isDockerized) {
    webpackConfig.watchOptions = {
        poll: 2000,
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
        publicPath: false,
    };
}

module.exports = smp.wrap(webpackConfig);
