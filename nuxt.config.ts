import { createResolver, useNuxt } from '@nuxt/kit'

const resolver = createResolver(import.meta.url)

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  hooks: {
    'nitro:config': () => {
      const nuxt = useNuxt()
      if (!nuxt.options.runtimeConfig['nuxt-simple-sitemap']) {
        console.warn('no sitemap config')
        return
      }
      // Force enable API result
      nuxt.options.runtimeConfig['nuxt-simple-sitemap'].buildTimeMeta.hasApiRoutesUrl = true
      // Force use only API result
      // https://github.com/harlan-zw/nuxt-simple-sitemap/blob/7f1b81c29545b2c6ddf1b6dec1df6ce47e7b10f1/src/module.ts#L353
      nuxt.options.runtimeConfig['nuxt-simple-sitemap'].buildTimeMeta.hasPrerenderedRoutesPayload = false
    },
    'prerender:routes': ({ routes }) => {
      const nuxt = useNuxt()
      if ((nuxt.options as any).karbon?.fullStatic) {
        routes.add('/')
        routes.add('/api/_storipress/front.json')
        routes.add('/api/_storipress/version')
      }
    },
  },
  modules: [
    '@vueuse/nuxt',
    'nuxt-unhead',
    '@pinia/nuxt',
    'nuxt-site-config',
    '@storipress/karbon',
    '@nuxtjs/partytown',
  ],
  css: [
    '@unocss/reset/tailwind.css',
    '@storipress/common-style/style.scss',
    resolver.resolve('./assets/css/content.scss'),
  ],
  partytown: {
    forward: ['dataLayer.push', 'gtag'],
  },
  alias: {
    '@storipress/block': resolver.resolve('./display-components/block-elements'),
    '@storipress/article': resolver.resolve('./display-components/article-elements'),
    '@': resolver.resolve('./'),
    '#sp-cli': resolver.resolve('./cli'),
    '#generated': resolver.resolve('./playground/generated'),
    lodash: 'lodash-es',
  },
  runtimeConfig: {
    storipress: {},
  },
  site: {
    debug: true,
  },
  sitemap: {
    debug: true,
    sitemaps: true,
    runtimeCacheStorage: {
      driver: 'memory',
    },
  },
  pinia: {
    autoImports: ['defineStore'],
  },
})
