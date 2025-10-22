import globals from 'globals'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  { files: ['**/*.js', '**/*.ts'] },
  { ignores: ['dist'] },
  { plugins: { '@typescript-eslint': typescriptEslint } },
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node
      },
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'comma-dangle': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'no-throw-literal': 'warn',
      'quote-props': ['error', 'as-needed'],
      'constructor-super': 'warn',
      'no-const-assign': 'warn',
      'no-this-before-super': 'warn',
      'no-undef': 'warn',
      'no-unreachable': 'warn',
      'no-unused-vars': 'warn',
      'valid-typeof': 'warn',
      curly: ['error', 'multi-or-nest'],
      eqeqeq: 'error',
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      semi: ['error', 'never']
    }
  }
]
