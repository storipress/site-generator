import { parseURL } from 'ufo'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    // Nuxt offical plugin only support prerender route
    // TODO: remove this after official plugin support prefetch
    // https://github.com/nuxt/nuxt/blob/9742bffac24fbf9fa279d614ad6bf07b5d85672d/packages/nuxt/src/app/plugins/payload.client.ts#L10
    nuxtApp.hooks.hook('link:prefetch', async (url) => {
      if (!parseURL(url).protocol) {
        await loadPayload(url)
      }
    })
  },
})
