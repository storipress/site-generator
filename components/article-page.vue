<script lang="ts" setup>
import HeroBlockProvider from './hero-block-provider.vue'
import InnerWrapper from './layout-wrapper/inner-wrapper.vue'

const article = setupPage({ type: 'article' })
const articleFilter = useArticleFilter()

useArticleSchemaOrg()

useHead(() => {
  type SEO = typeof article.value.seo & { canonical?: string }
  const { title } = article.value || {}
  const seo: SEO = article.value?.seo || {}
  const pageTitle = seo.meta?.title || title
  const canonicalLink = seo.canonical
    ? {
        hid: 'canonical',
        ref: 'canonical',
        href: seo.canonical,
      }
    : {}

  const meta = [
    {
      name: 'description',
      content: seo.meta?.description || '',
    },
    {
      property: 'og:title',
      content: seo.og?.title || pageTitle,
    },
    {
      property: 'og:description',
      content: seo.og?.description || '',
    },
  ]

  if (seo.ogImage) {
    meta.push({
      property: 'og:image',
      content: seo.ogImage || '',
    })
  }

  return {
    title: articleFilter(pageTitle),
    meta,
    link: [canonicalLink],
  }
})

async function* createNextGenerator(currentID: string) {
  const id = currentID
  const allIDs = await loadStoripressPayload<string[]>('posts', 'all')

  const idx = allIDs.indexOf(id)
  const index = idx === -1 ? 0 : idx
  const before = allIDs.slice(0, index)
  const after = allIDs.slice(index + 1)
  const list = [...after, ...before]
  for (const nextID of list) {
    yield await loadStoripressPayload('posts', nextID)
  }
}

const source = computed(() => {
  if (article.value) {
    return () => createNextGenerator(article.value.id)
  }
  return null
})

const { SiteNavbar } = useStoripressCompatInject()

const $paywall = usePaywall()
onMounted(async () => {
  await $paywall.mount()
  $paywall.enable()
  await nextTick()
  $paywall.checkQuery()
  $paywall.setArticle(article.value)
})

onBeforeUnmount(() => {
  $paywall.disable()
})
</script>

<template>
  <div>
    <HeroBlockProvider>
      <SiteNavbar current-page="article" />
    </HeroBlockProvider>
    <InnerWrapper :value="article" style="margin-top: var(--sp-nav-height, 0)" />
    <InfiniteScroll v-if="source" v-slot="{ items }" :distance="1000" :source="source" preload>
      <InnerWrapper :value="items" />
    </InfiniteScroll>
  </div>
</template>
