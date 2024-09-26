import { defineNuxtModule, useNuxt } from '@nuxt/kit'
import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'

const nitroCacheKeyPlugin = createUnplugin<{ cacheKey: string }>(({ cacheKey }) => {
  return {
    name: 'unplugin-nitro-cache-key',
    enforce: 'pre',
    transformInclude(id) {
      return id.includes('nitro') && (id.includes('cache') || id.includes('app'))
    },
    transform(code) {
      const s = new MagicString(code)
      s.replaceAll(/nitro\/(functions|handlers|routes)/g, `nitro/${cacheKey}/$1`)
      return {
        code: s.toString(),
        map: s.generateMap({ hires: true }),
      }
    },
  }
})

export default defineNuxtModule({
  meta: {
    name: 'nuxt-nitro-cache-key',
    version: '0.0.1',
  },
  setup() {
    const nuxt = useNuxt()
    // Lazy retrieve it to ensure karbon is loaded before this module
    let clientID: string
    nuxt.hook('modules:done', () => {
      // It could be undefined when preparing base layer
      clientID = nuxt.options.runtimeConfig.storipress.clientId
    })
    nuxt.hook('nitro:config', (config) => {
      const cacheKey = `${clientID || '_'}`
      // eslint-disable-next-line no-console
      console.log('nitro-cache-key', cacheKey)
      config.rollupConfig ??= {}
      config.rollupConfig.plugins ??= []
      if (!Array.isArray(config.rollupConfig.plugins)) {
        config.rollupConfig.plugins = [config.rollupConfig.plugins]
      }
      config.rollupConfig.plugins.push(nitroCacheKeyPlugin.rollup({ cacheKey }))
    })
  },
})
