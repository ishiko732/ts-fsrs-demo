import { FlatCompat } from '@eslint/eslintrc'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'prettier'],
  }),
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      // 'require-await': 'error',
      'no-console': 'off',

      'no-return-await': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-interface': 'error',
    },
  },
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.next/*', 'public/*', 'tailwind.config.ts'],
  },
]

export default eslintConfig
