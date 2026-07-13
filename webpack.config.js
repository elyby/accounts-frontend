/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

require('@babel/register')({
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
});

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SUPPORTED_LANGUAGES = Object.keys(require('app/i18n').default);
const { getCountriesList } = require('app/components/i18n/localeFlags');
const rootPath = path.resolve('./packages');
const outputPath = path.join(__dirname, 'build');

const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = process.argv.some((arg) => arg === '--analyze');

const isDockerized = !!process.env.DOCKERIZED;
const isStorybook = process.env.APP_ENV === 'storybook';
const isCI = !!process.env.CI;
const isSilent = isCI || process.argv.some((arg) => /quiet/.test(arg));
const webpackEnv = isProduction ? 'production' : 'development';

process.env.NODE_ENV = webpackEnv;

// Collect our custom language flags in order to exclude them from packaged
const customFlags = fs
    .readdirSync(path.resolve(rootPath, 'app/components/i18n/flags'))
    .filter((file) => file.endsWith('.svg'))
    .map((file) => path.basename(file, '.svg'));
const flagIconCountries = getCountriesList().filter((country) => !customFlags.includes(country));

const webpackConfig = {
    mode: webpackEnv,

    entry: {
        app: path.join(__dirname, 'packages/app'),
    },

    output: {
        path: outputPath,
        publicPath: '/',
        filename: `[name].js?[${isProduction ? 'contenthash' : 'fullhash'}]`,
        clean: true,
    },

    // intl-messageformat@8.4.1 incorrectly declares ^5 parser dependency but uses ^6 exports.
    // These functions are never called since the app doesn't use skeleton date/number patterns.
    // Will be resolve when we will migrate to the newer intl version
    ignoreWarnings: [
        /export 'parseDateTimeSkeleton'.*was not found in 'intl-messageformat-parser'/,
        /export 'convertNumberSkeletonToNumberFormatOptions'.*was not found in 'intl-messageformat-parser'/,
    ],

    resolve: {
        modules: [rootPath, 'node_modules'],
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        alias: {
            'react-dom': isProduction ? 'react-dom' : '@hot-loader/react-dom',
        },
    },

    devtool: isProduction ? 'hidden-source-map' : 'eval-source-map',

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
        new webpack.DefinePlugin({
            'window.SENTRY_DSN': process.env.SENTRY_DSN ? JSON.stringify(process.env.SENTRY_DSN) : undefined,
            'window.GA_ID': process.env.GA_ID ? JSON.stringify(process.env.GA_ID) : undefined,
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: process.env.NODE_ENV,
            __VERSION__: process.env.VERSION || process.env.NODE_ENV,
        }),
        new HtmlWebpackPlugin({
            template: 'packages/app/index.ejs',
            favicon: 'packages/app/favicon.ico',
            hash: false, // webpack does this for all our assets automagically
            filename: 'index.html',
            inject: false,
            minify: {
                collapseWhitespace: isProduction,
            },
        }),
        // restrict webpack import context, to create chunks only for supported locales
        // @see services/i18n/intlPolyfill.js
        new webpack.ContextReplacementPlugin(/locale-data/, new RegExp(`/(${SUPPORTED_LANGUAGES.join('|')})\\.js$`)),
        // @see components/i18n/localeFlags.js
        new webpack.ContextReplacementPlugin(
            /flag-icons\/flags\/4x3/,
            new RegExp(`/(${flagIconCountries.join('|')})\\.svg`),
        ),
        // @see components/i18n/localeFlags.js
        new webpack.ContextReplacementPlugin(
            /app\/components\/i18n\/flags/,
            new RegExp(`/(${SUPPORTED_LANGUAGES.join('|')})\\.svg`),
        ),
    ],

    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: isProduction ? '[hash:base64:5]' : '[path][name]-[local]',
                                // css-loader v7 changed the default to 'camel-case-only', which broke
                                // composes: some-dashed-class from '...', restore the v3 behaviour
                                exportLocalsConvention: 'as-is',
                            },
                            esModule: false,
                            importLoaders: 2,
                            sourceMap: !isProduction,
                            // Skip resolving absolute URLs (e.g. /assets/fonts/... from fontgen-loader)
                            url: {
                                filter: (url) => !url.startsWith('/'),
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            api: 'modern',
                            sourceMap: !isProduction,
                            sassOptions: {
                                sourceMapIncludeSources: !isProduction,
                                // icons.scss uses @import for fontgen-loader integration via postcss-import
                                silenceDeprecations: ['import'],
                            },
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: !isProduction,
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
                            envName: `browser-${webpackEnv}`,
                            cacheDirectory: true,
                        },
                    },
                ],
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]?[contenthash]',
                },
            },
            {
                test: /\.(woff|woff2|ttf)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext]?[contenthash]',
                },
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    // first-render.js uses require('...html') in a template literal — needs a plain string
                    esModule: false,
                },
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
                filename: '[name].css?[contenthash]',
            }),
        );

        webpackConfig.plugins.push(
            new SitemapPlugin({
                base: 'https://account.ely.by',
                paths: [
                    '/',
                    '/register',
                    '/resend-activation',
                    '/activation',
                    '/forgot-password',
                    '/rules',
                    '/dev/applications',
                ],
                options: {
                    lastmod: true,
                    changefreq: 'weekly',
                },
            }),
        );
    }

    webpackConfig.optimization = {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: 'vendors',
                    priority: 0,
                    test: /node_modules/,
                    chunks: 'all',
                },
                polyfills: {
                    name: 'intl-polyfills',
                    priority: 1,
                    chunks: ({ name }) => ['intl', 'intl-pluralrules', 'intl-relativetimeformat'].includes(name),
                    enforce: true,
                },
                ...SUPPORTED_LANGUAGES.reduce((acc, locale) => {
                    acc[locale] = {
                        name: `locale-${locale}`,
                        priority: 1,
                        chunks: ({ name }) => name === `locale-${locale}-json`,
                        enforce: true,
                    };
                    acc[`${locale}Polyfill`] = {
                        name: `locale-${locale}-polyfill`,
                        priority: 2,
                        // Matches the upstream locale-data chunks (intl-<locale>-js,
                        // intl-pluralrules-<locale>-js, intl-relativetimeformat-<locale>-js)
                        // as well as our ./overrides chunks. The latter live under a
                        // resolve.modules root, so their [request] chunk name expands to the
                        // full module path — but it still starts with `intl` and ends with
                        // `-<locale>-js`, so a prefix/suffix match folds every variant in here
                        // (and keeps that long, structure-leaking name out of the emitted files).
                        chunks: ({ name }) =>
                            typeof name === 'string' && name.startsWith('intl') && name.endsWith(`-${locale}-js`),
                        enforce: true,
                    };

                    return acc;
                }, {}),
            },
        },
    };
} else {
    webpackConfig.devServer = {
        host: 'localhost',
        port: 8080,
        proxy: [
            {
                context: ['/api'],
                target: process.env.API_HOST || 'https://account.dev.ely.by',
                changeOrigin: true,
                secure: false,
            },
        ],
        hot: true,
        historyApiFallback: true,
    };
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

module.exports = webpackConfig;
