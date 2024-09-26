import path, { dirname, join } from 'node:path'
import type { StorybookConfig } from '@storybook/vue3-vite'
import AutoImport from 'unplugin-auto-import/vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { mergeConfigs } from 'unocss'
import tailwindcss from 'tailwindcss'
import tailwindcssNesting from 'tailwindcss/nesting'
import templateLoader from '../packages/template-loader-unocss/src'
import { baseUnocssConfig } from '../modules/integrations/unocss'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/vue3-vite'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config, _options) {
    config.css = config.css || {}
    config.plugins = config.plugins || []
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}

    config.css.postcss = {
      plugins: [tailwindcss(), tailwindcssNesting()],
    }

    config.plugins = [
      ...config.plugins,
      Vue(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          { '@vueuse/core': ['useResizeObserver'] },
          { 'identity-obj-proxy': [['default', 'blockObj']] },
          {
            '#storybook-composables': [
              'useStoripressCompatInject',
              'useStoripress',
              'useNProgress',
              'useHead',
              'usePaywall',
              'useArticleFilter',
              'useResourcePageMeta',
              'useAutoKey',
              'useNormalizedArticle',
              'useLazySearchClient',
              'useBlockChild',
            ],
            '#components': ['NuxtLink'],
            '@components': ['PortalBlockProvider'],
          },
        ],
      }),
      UnoCSS(
        mergeConfigs([
          baseUnocssConfig,
          {
            transformers: [templateLoader()],
          },
        ]),
      ),
    ]

    config.resolve.alias = {
      ...config.resolve.alias,
      '#storybook-composables': `${path.resolve(__dirname, '../.storybook/composables')}`,
      '@/components': `${path.resolve(__dirname, '../components')}`,
      '@storipress/block': path.resolve(__dirname, '../display-components/block-elements'),
      '#builder-blocks': `${path.resolve(__dirname, '../Builder-Blocks')}`,
      '#components': `${path.resolve(__dirname, '../.storybook/components')}`,
    }

    return config
  },
}
export default config

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
