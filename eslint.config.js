const globals = require('globals');
const pluginJs = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ['.nx/', '*.config.js', '**/node_modules/', '**/lib/', '**/dist/'],
  },
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
