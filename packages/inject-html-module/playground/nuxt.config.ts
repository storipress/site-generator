// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@nuxt/devtools', '../src/module.ts'],
  unocss: {
    uno: true,
    icons: true,
    attributify: true,
  },
  injectHtml: {
    profiles: {
      default: {
        footer: `
        <div>Global default</div>
      <script>console.log('default')</script>
      `,
      },
      front: {
        header: `
        <div>Front html</div>
      <script>console.log('front')</script>
      `,
      },
      article: {
        header: `
        <div>Article html</div>
      <script>console.log('article')</script>
      `,
      },
    },
  },
})
