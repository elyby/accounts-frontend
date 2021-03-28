#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const localeOverrides = {
    'packages/app/services/i18n/overrides/intl': 'node_modules/intl/locale-data/jsonp',
    'packages/app/services/i18n/overrides/pluralrules': 'node_modules/@formatjs/intl-pluralrules/dist/locale-data',
    // eslint-disable-next-line prettier/prettier
    'packages/app/services/i18n/overrides/relativetimeformat': 'node_modules/@formatjs/intl-relativetimeformat/dist/locale-data',
};

Object.entries(localeOverrides).forEach(([sourceDir, targetDir]) => {
    fs.readdirSync(sourceDir).forEach((localeFile) => {
        fs.copyFileSync(path.join(sourceDir, localeFile), path.join(targetDir, localeFile));
    });
});
