// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */

const { join } = require('path');

module.exports = (root) => [
    [
        /@formatjs\/intl-relativetimeformat\/dist\/locale-data\/eo\.js/,
        join(root, 'node_modules/@kotwys/formatjs-esperanto/dist/relativetimeformat.js'),
    ],
];
