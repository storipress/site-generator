<script lang="ts" setup>
import { joinURL, withHttps, withoutTrailingSlash } from 'ufo'
import { FooterHtml } from '#components'
import { useInjectHtml, useStoripressCompatInject } from '#imports'

const storipress = useStoripress()
const ADSENSE_ID = storipress.integrations.adsense.id
const ADSENSE_SCRIPT = storipress.integrations.adsense.script
const ADSENSE_PAGE = storipress.integrations.adsense.page
const ADSENSE_FRONT = storipress.integrations.adsense.front
const showDisqus = !storipress.flags.paywall

const route = useRoute()

type resource = 'article' | 'desk' | 'tag' | 'author'
const pageMeta = useResourcePageMeta()
const profile = computed(() => {
  if (route.path === '/') {
    return 'front'
  }

  switch (pageMeta.value?.type as resource) {
    case 'desk':
      return `desk-${pageMeta.value?.meta.id}`
  }

  return `page-${route?.params?.slug}`
})

useInjectHtml(profile)
const compatInject = useStoripressCompatInject()

useHead(() => {
  const { name, path } = route
  const { hostname } = storipress
  const canonical = withoutTrailingSlash(withHttps(joinURL(hostname, path)))
  const link = [
    {
      hid: 'canonical',
      rel: 'canonical',
      href: canonical,
    },
  ]
  const common = {
    htmlAttrs: {
      lang: compatInject.frontData.site.lang || 'en-US',
    },
    link,
    meta: [
      {
        property: 'og:url',
        content: canonical,
      },
    ],
  }

  if (!ADSENSE_ID) {
    return common
  }

  const isPost = name === 'posts-slug'

  if ((isPost && !ADSENSE_PAGE) || (!isPost && !ADSENSE_FRONT)) {
    return common
  }

  return {
    ...common,
    script: [
      {
        src: ADSENSE_SCRIPT,
        'data-ad-client': ADSENSE_ID,
        async: true,
      },
    ],
  }
})
</script>

<template>
  <div>
    <slot />
    <div class="fixed bottom-0 right-0 z-50 flex flex-col justify-center pointer-events-none">
      <DisqusComp
        class="pointer-events-auto"
        :class="showDisqus && 'w-[58px] h-[58px] first:mr-[27px] mx-auto mb-4 bg-white rounded-full shadow-xl'"
      />
    </div>
    <FooterHtml :profile="profile" />
  </div>
</template>

<style lang="scss" scoped>
.disqus-btn {
  // same as badge
  width: 58px;
  height: 58px;

  // for Disqus when badge is hidden
  &:first-child {
    margin-right: 27px;
  }
}
</style>
