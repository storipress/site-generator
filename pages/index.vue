<script lang="ts" setup>
const storipress = useStoripress()
const seo = computed(() => storipress.seo.home)

useHead(() => {
  const { name } = storipress.site

  return {
    titleTemplate: '%s',
    title: seo.value.meta?.title || name,
    meta: [
      {
        name: 'description',
        content: seo.value.meta?.description || '',
      },
      {
        property: 'og:title',
        content: seo.value.og?.title || seo.value.meta?.title || name,
      },
      {
        property: 'og:description',
        content: seo.value.og?.description || seo.value.meta?.description || '',
      },
      {
        property: 'og:image',
        content: seo.value.ogImage || '',
        skip: !seo.value.ogImage,
      },
    ],
  }
})

const paywall = usePaywall()
const gtag = useGtag()
const tracker = useTracker()

onMounted(() => {
  paywall.mount()
  paywall.checkQuery()
  gtag.pageview({
    page_title: document.title,
    page_path: document.location.pathname,
    // @ts-expect-error custom dim
    internal_id: `front`,
  })
  tracker.withReferer({
    name: 'home.seen',
  })
})
</script>

<template>
  <BlocksView />
</template>
