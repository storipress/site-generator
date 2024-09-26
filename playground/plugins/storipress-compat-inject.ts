import { BLOCKS, Footer, Navbar } from '../generated/front'
import { FORMATS, FORMATS_OTHER } from '../generated/article/article-templates'
import { StaticBlockProvider } from '#components'
import {} from 'vue'

export default defineNuxtPlugin(async () => {
  useStoripressCompatInject()
  const frontData = await $fetch('/api/_storipress/front.json')
  return {
    provide: {
      storipressCompatInject: {
        logo: frontData.logo,
        blocks: BLOCKS,
        formats: FORMATS,
        formatsOther: FORMATS_OTHER,
        subscribes: {},
        SiteNavbar: (props: Record<string, unknown> = {}) =>
          h(StaticBlockProvider, { block: 'hero' }, () => h(Navbar, props)),
        SiteFooter: (props: Record<string, unknown> = {}) =>
          h(StaticBlockProvider, { block: 'footer' }, () => h(Footer, { ...props, block: { id: '@@footer' } })),
        frontData,
      },
    },
  }
})
