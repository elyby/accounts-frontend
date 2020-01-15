/* eslint-env node */

require('dotenv').config();

const { env } = process;

module.exports = {
  version: env.VERSION || env.NODE_ENV,
  apiHost: env.API_HOST || 'https://dev.account.ely.by',
  ga: env.GA_ID && { id: env.GA_ID },
  sentryDSN: env.SENTRY_DSN,
  crowdinApiKey: env.CROWDIN_API_KEY,
};
