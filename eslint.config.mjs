import pluginJs from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ['*.config.js', '**/lib/', '**/dist/'],
  },
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
