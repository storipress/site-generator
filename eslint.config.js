import antfu from '@antfu/eslint-config'
import prettier from 'eslint-plugin-prettier'
import storybook from 'eslint-plugin-storybook'

const ignores = [
  '*.md',
  '**/*.md',
  '*.yml',
  '**/*.yml',
  '*.toml',
  '**/*.toml',
  '.yarn/**',
  'lib/client.es.js',
  'graphql-operations.ts',
  '**/graphql-operations.ts',
  'Builder-Blocks/**',
  'playground/generated',
  'playground/generated/**',
  'cli/encrypt-key.json',
  'cli/styles-mapping.json',
  'cli/handler/graphql-operations.ts',
  'cli/block-mapping.ts',
  'cli/block-mapping.json',
]

export default antfu(
  {
    ignores,
    stylistic: false,
    rules: {
      'node/prefer-global/process': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-newline': 'off',

      'antfu/top-level-function': 'error',
    },
  },
  {
    ignores,
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.stories.ts'],
    plugins: { storybook },
    rules: {
      ...storybook.configs.recommended.overrides[0].rules,
    },
  },
  {
    // config block that only contains ignores will work as global ignore, only global ignore can ignore directories
    // ref: https://github.com/eslint/eslint/discussions/17429
    ignores,
  },
)
