/* eslint-env node */
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      {
        allowDeclareFields: true,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-env',
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
      },
    ],
    ['react-intl', { messagesDir: './dist/messages/' }],
  ],
  env: {
    webpack: {
      plugins: ['react-hot-loader/babel'],
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            useBuiltIns: 'usage', // or "entry"
            corejs: 3,
          },
        ],
      ],
    },
  },
};
