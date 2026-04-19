const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'import/no-unresolved': ['error', { ignore: ['react-native-iap'] }],
      'prettier/prettier': 'warn',
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'docs/*'],
  },
]);
