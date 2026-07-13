import type { StorybookConfig } from '@storybook/react-webpack5';
import { ContextReplacementPlugin } from 'webpack';

import rootConfig from '../webpack.config';

const config: StorybookConfig = {
    stories: ['../packages/app/**/*.story.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-actions',
        '@storybook/addon-links',
        '@storybook/addon-toolbars',
        '@storybook/addon-viewport',
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    webpackFinal: (config) => ({
        ...config,
        resolve: {
            ...config.resolve,
            ...rootConfig.resolve,
            alias: {
                // Storybook's own presets contribute aliases we must keep — e.g. @storybook/react-dom-shim's
                // preset aliases itself to the React 16/17-compatible shim when it detects React < 18
                // (see @storybook/react-dom-shim/dist/preset.js). Overwriting the whole `resolve` (and thus
                // dropping this alias) makes webpack fall back to the React 18 shim, which imports the
                // nonexistent (in React 17) `react-dom/client` module.
                ...config.resolve?.alias,
                ...rootConfig.resolve.alias,
            },
        },
        module: {
            ...config.module,
            rules: [
                ...rootConfig.module.rules,
                // Our webpack config's rules above fully replace Storybook's own module.rules, which drops
                // the fix Storybook normally applies for strict ESM resolution of .mjs files (see
                // @storybook/preset-react-webpack's framework-preset-cra.js). Without it, webpack requires
                // an explicit extension for every bare import inside real ESM files such as
                // @storybook/react/dist/entry-preview.mjs, and fails to resolve its `react-dom/test-utils`
                // import (react-dom doesn't declare an "exports" map to compensate). Restore it explicitly.
                { test: /\.m?js$/, resolve: { fullySpecified: false } },
            ],
        },
        resolveLoader: rootConfig.resolveLoader,
        plugins: [
            ...(config.plugins || []),
            ...rootConfig.plugins.filter((plugin) => plugin instanceof ContextReplacementPlugin),
        ],
    }),
};

export default config;
