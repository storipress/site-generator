import VueGtag from 'vue-gtag'

export default defineNuxtPlugin((nuxtApp) => {
  const { vueApp, router } = nuxtApp

  const {
    public: { spGtag },
  } = useRuntimeConfig()
  const { clientID, name: siteName, integrations } = useStoripress()
  const { id: publicationID, anonymous } = integrations.ga

  const params = { anonymize_ip: anonymous }
  vueApp.use(
    VueGtag,
    {
      disableScriptLoad: true,
      pageTrackerTemplate(to: any) {
        return {
          page_title: to.name === 'posts-slug' ? document.title : to.name,
          page_path: to.path,
        }
      },
      config: {
        id: spGtag.id,
        params: {
          site_id: clientID,
          site_name: siteName,
          custom_map: { dimension1: 'site_id', dimension2: 'internal_id', dimension3: 'site_name' },
          send_page_view: false, // doing on mounted
        },
      },
      includes: publicationID && !process.dev ? [{ id: publicationID, params }] : [],
    },
    router,
  )
})
