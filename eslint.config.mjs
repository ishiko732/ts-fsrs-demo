import { FlatCompat } from '@eslint/eslintrc'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { dirname } from 'path'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
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
      'no-console': 'warn',

      'no-return-await': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-interface': 'error',
    },
  },
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.next/*', 'public/*'],
  },
]

export default eslintConfig
