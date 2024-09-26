import VueDisqus from 'vue-disqus'
import { useStoripress } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const { integrations } = useStoripress()
  if (!integrations.disqus?.shortname) {
    return
  }

  nuxtApp.vueApp.use(VueDisqus, {
    shortname: integrations.disqus.shortname,
  })
})
