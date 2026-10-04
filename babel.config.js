/* eslint-env node */
// @ts-nocheck
module.exports = function (api) {
    const env = api.env();
    const isProduction = api.env((envName) => envName.includes('production'));
    const { version: corejsVersion } = require('core-js/package.json');

    api.cache.using(() => env);

    const browserEnv = {
        plugins: ['react-hot-loader/babel'],
        presets: [
            [
                '@babel/preset-env',
                {
                    shippedProposals: true,
                    ignoreBrowserslistConfig: false,
                    modules: false,
                    useBuiltIns: 'usage', // or "entry"
                    corejs: corejsVersion,
                    include: ['proposal-class-properties'],
                },
            ],
        ],
    };

    return {
        presets: [
            '@babel/preset-react',
            [
                '@babel/preset-env',
                {
                    ignoreBrowserslistConfig: true,
                    targets: {
                        node: true,
                    },
                    modules: 'commonjs',
                },
            ],
            [
                // NOTE: preset-typescript must go before proposal-class-properties
                // in order to use allowDeclareFields option
                // proposal-class-properties is enabled by preset-env for browser env
                // preset-env for nodejs does not need it, because recent node versions support class fields
                //
                // but, due to some bugs (?), we must place preset-typescript here so that it loads as
                // last default preset, before loading browser presets.
                // Only this combination is working without errors
                '@babel/preset-typescript',
                {
                    allowDeclareFields: true,
                },
            ],
        ],
        plugins: [
            '@babel/plugin-transform-runtime',
            [
                'react-intl-auto',
                {
                    removePrefix: 'packages.app',
                    messagesDir: './build/messages/',
                    useKey: true,
                    removeDefaultMessage: isProduction,
                },
            ],
        ],
        env: {
            browser: browserEnv,
            'browser-development': browserEnv,
            'browser-production': {
                ...browserEnv,
                // Adds data-sentry-component/data-sentry-element attributes, so Sentry's ui.click breadcrumbs
                // contain React component names instead of hashed CSS classes.
                // Don't use the reactComponentAnnotation option of @sentry/webpack-plugin instead: it runs its own
                // Babel transform that picks up this config without the browser env, so preset-env converts
                // modules into commonjs, which breaks code splitting and tree shaking
                plugins: [...browserEnv.plugins, '@sentry/bundler-plugins/babel-plugin'],
            },
        },
    };
};
