import uno from '@unocss/preset-uno'
import { h } from '@unocss/preset-mini/utils'
import unocss from 'unocss/vite'
import { build } from 'vite'
import type { OutputAsset, RollupOutput } from 'rollup'
import transformerDirectives from '@unocss/transformer-directives'
import vue from '@vitejs/plugin-vue'
import type { NestedHooks } from 'hookable'
import transformer from './transform'
import type { TransformerHooks } from './transform'

interface CreateTransformBuildInput {
  code: string
  pathPrefix?: string
  hooks?: NestedHooks<TransformerHooks>
}

export async function createTransformBuild({ code, pathPrefix, hooks }: CreateTransformBuildInput) {
  let vueCode = ''
  const res = await build({
    logLevel: 'error',
    configFile: false,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id.endsWith('entry')) {
            return id
          }
          if (id.endsWith('entry.vue')) {
            return id
          }
        },
        load(id) {
          if (id.endsWith('entry')) {
            return `
              export {default} from '${pathPrefix ?? ''}/entry.vue'
            `
          }
          if (id.endsWith('entry.vue')) {
            return code
          }
        },
      },
      unocss({
        mode: 'vue-scoped',
        presets: [
          uno({
            preflight: false,
          }),
        ],
        rules: [[/^ff-(.+)$/, ([, family]) => ({ 'font-family': `"${h.bracket(family)}"` })]],
        transformers: [
          transformer({
            hooks,
          }),
          transformerDirectives(),
        ],
      }),
      {
        name: 'inspect',
        transform(code, id) {
          if (id.endsWith('entry.vue')) {
            vueCode = code
          }
          return code
        },
      },
      vue({}),
    ],
    build: {
      lib: {
        entry: 'entry',
        formats: ['es'],
      },
      rollupOptions: {
        output: undefined,
        external: ['vue'],
      },
    },
  })

  const out = res as RollupOutput[]

  return {
    code: out[0].output[0].code,
    vue: vueCode,
    css: (out[0].output[1] as OutputAsset)?.source || '',
  }
}
