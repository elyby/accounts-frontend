/* eslint-env node */
// @ts-nocheck
module.exports = function (api) {
    const env = api.env();
    api.cache(true);

    return {
        presets: [
            [
                '@babel/preset-typescript',
                {
                    allowDeclareFields: true,
                },
            ],
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
        ],
        plugins: [
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-proposal-function-bind',
            '@babel/plugin-proposal-class-properties',
            [
                '@babel/plugin-transform-runtime',
                {
                    corejs: 3,
                },
            ],
            [
                'react-intl-auto',
                {
                    removePrefix: 'packages.app',
                    messagesDir: './build/messages/',
                    useKey: true,
                    removeDefaultMessage: env === 'production',
                },
            ],
        ],
        env: {
            webpack: {
                plugins: ['react-hot-loader/babel'],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            ignoreBrowserslistConfig: false,
                            modules: false,
                            useBuiltIns: 'usage', // or "entry"
                            corejs: 3,
                        },
                    ],
                ],
            },
        },
    };
};
