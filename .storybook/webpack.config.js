const rootConfig = require('../webpack.config');

module.exports = async ({ config }) => ({
  ...config,
  resolve: rootConfig.resolve,
  module: {
    ...config.module,
    // our rules should satisfy all storybook needs,
    // so replace all storybook defaults with our rules
    rules: rootConfig.module.rules,
  },

  resolveLoader: rootConfig.resolveLoader,
});
