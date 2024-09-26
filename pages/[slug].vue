<script lang="ts" setup>
import InnerWrapper from '../components/layout-wrapper/inner-wrapper.vue'
import type { SEO } from '../api/apollo/seo/types'
import { otherMapping } from '#generated/other-mapping'
import { useStoripressCompatInject } from '#imports'

type Article = ReturnType<typeof setupArticlePage>['value'] & { layout: { id: '' } }

const site = useSite()
const $gtag = useGtag()
const $tracker = useTracker()
const articleData = ref({ seo: {} as SEO, title: '', layout: { id: '' } } as Article)
const route = useRoute()
const slug = route.params.slug as string
const page = otherMapping[slug]
const { SiteNavbar, SiteFooter } = useStoripressCompatInject()
if (page) {
  articleData.value = {
    ...page,
    title: page.pageTitle || page.title,
  } as any
}

useHead(() => {
  const { seo, title: articleTitle } = articleData.value
  const title = seo.meta?.title || articleTitle || site.value.name

  const meta = [
    {
      name: 'description',
      content: seo.meta?.description || '',
    },
    {
      property: 'og:title',
      content: seo.og?.title || title,
    },
    {
      property: 'og:description',
      content: seo.og?.description || '',
    },
    {
      property: 'og:image',
      content: seo.ogImage || '',
      skip: !seo.ogImage,
    },
  ]

  return { title, meta }
})

onMounted(() => {
  const pageId = articleData.value.layout.id
  if (pageId) {
    $gtag.pageview({
      page_title: document.title,
      page_path: document.location.pathname,
      internal_id: `other.${pageId}`,
    })

    $tracker.withReferer({
      name: 'other.seen',
      target_id: pageId,
    })
  }
})
</script>

<template>
  <SiteNavbar current-page="other" />
  <InnerWrapper v-if="articleData" :value="articleData" is-other style="margin-top: var(--sp-nav-height, 0)" />
  <SiteFooter />
</template>
