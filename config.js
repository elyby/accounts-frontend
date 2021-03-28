/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

require('dotenv').config();

const { env } = process;

module.exports = {
    version: env.VERSION || env.NODE_ENV,
    apiHost: env.API_HOST || 'https://dev.account.ely.by',
    ga: env.GA_ID && { id: env.GA_ID },
    sentryDSN: env.SENTRY_DSN,
    crowdin: {
        apiKey: env.CROWDIN_API_KEY,
        projectId: 350687,
        filePath: 'accounts/site.json',
        sourceLang: 'en',
        basePath: `${__dirname}/packages/app/i18n`,
        minTranslated: 80, // Minimal ready percent before translation can be published
    },
};
