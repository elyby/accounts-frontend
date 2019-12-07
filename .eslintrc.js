module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  extends: [
    'eslint:recommended',
    'plugin:jsdoc/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],

  plugins: ['react'],

  env: {
    browser: true,
    es6: true,
    commonjs: true,
  },

  overrides: [
    {
      files: ['webpack-utils/**', 'scripts/**', 'jest/**'],
      env: {
        node: true,
      },
    },
    {
      files: ['*.test.js'],
      env: {
        jest: true,
      },
    },
    {
      files: ['tests-e2e/**'],
      env: {
        mocha: true,
      },
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
      },
      rules: {
        'no-restricted-globals': 'off',
      },
    },
  ],

  settings: {
    react: {
      version: 'detect',
    },
  },

  // @see: http://eslint.org/docs/rules/
  rules: {
    'no-prototype-builtins': 'warn', // temporary set to warn
    'no-restricted-globals': [
      'error',
      'localStorage',
      'sessionStorage', // we have our own localStorage module
      'event',
    ],
    'id-length': [
      'error',
      { min: 2, exceptions: ['x', 'y', 'i', 'k', 'l', 'm', 'n', '$', '_'] },
    ],
    'require-atomic-updates': 'warn',
    'guard-for-in': ['error'],
    'no-var': ['error'],
    'prefer-const': ['error'],
    'prefer-template': ['error'],
    'no-template-curly-in-string': ['error'],
    'no-multi-assign': ['error'],
    eqeqeq: ['error'],
    'prefer-rest-params': ['error'],
    'prefer-object-spread': 'warn',
    'prefer-destructuring': 'warn',
    'no-bitwise': 'warn',
    'no-negated-condition': 'warn',
    'no-nested-ternary': 'warn',
    'no-unneeded-ternary': 'warn',
    'no-shadow': 'warn',
    'no-else-return': 'warn',
    radix: 'warn',
    'prefer-promise-reject-errors': 'warn',
    'object-shorthand': 'warn',
    'require-atomic-updates': 'off',

    // force extra lines around if, else, for, while, switch, return etc
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['if', 'for', 'while', 'switch', 'return'],
      },
      {
        blankLine: 'always',
        prev: ['if', 'for', 'while', 'switch', 'return'],
        next: '*',
      },
      {
        blankLine: 'never',
        prev: ['if', 'for', 'while', 'switch', 'return'],
        next: 'break',
      },
    ],

    'jsdoc/require-param-description': 'off',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/require-jsdoc': 'off',
    'jsdoc/valid-types': 'off',
    'jsdoc/no-undefined-types': 'off',
    'jsdoc/require-returns': 'off',

    // react
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'warn',
    'react/forbid-prop-types': 'warn',
    'react/jsx-boolean-value': 'warn',
    'react/jsx-closing-bracket-location': 'off', // can not configure for our code style
    'react/jsx-curly-spacing': 'warn',
    'react/jsx-handler-names': [
      'warn',
      { eventHandlerPrefix: 'on', eventHandlerPropPrefix: 'on' },
    ],
    'react/jsx-key': 'warn',
    'react/jsx-max-props-per-line': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-no-duplicate-props': 'warn',
    'react/jsx-no-literals': 'off',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'warn',
    'react/jsx-uses-react': 'warn',
    'react/jsx-uses-vars': 'warn',
    'react/jsx-no-comment-textnodes': 'warn',
    'react/jsx-wrap-multilines': 'warn',
    'react/no-deprecated': 'warn',
    'react/no-did-mount-set-state': 'warn',
    'react/no-did-update-set-state': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/require-render-return': 'warn',
    'react/no-is-mounted': 'warn',
    'react/no-multi-comp': 'off',
    'react/no-string-refs': 'warn',
    'react/no-unknown-property': 'warn',
    'react/prefer-es6-class': 'warn',
    'react/prop-types': 'off', // using ts for this task
    'react/self-closing-comp': 'warn',
    'react/sort-comp': 'off',

    // ts
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
