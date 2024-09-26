<script lang="ts" setup>
import type { GeneratorDataQuery } from '../../../graphql-operations'

type DeskSEO = GeneratorDataQuery['desks'][number]['resolvedSEO'] & { id: string }

const desk = setupPage({ type: 'desk' })
const storipress = useStoripress()

useHead(() => {
  const { name } = desk.value || {}
  const seo = computed(() => {
    const desks = storipress.seo.desks as DeskSEO[]
    return (desks.find(({ id }) => id === desk.value.id) ?? {}) as DeskSEO
  })
  const title = seo.value.meta?.title || name

  const meta = [
    {
      name: 'description',
      content: seo.value.meta?.description || '',
    },
    {
      property: 'og:title',
      content: seo.value.og?.title || title,
    },
    {
      property: 'og:description',
      content: seo.value.og?.description || seo.value.meta?.description || '',
    },
  ]

  if (seo.value.ogImage) {
    meta.push({
      property: 'og:image',
      content: seo.value.ogImage || '',
    })
  }

  return {
    title,
    meta,
  }
})

const $paywall = usePaywall()
const $gtag = useGtag()
const $tracker = useTracker()
onMounted(() => {
  $paywall.mount()
  $paywall.checkQuery()
  const resourceId = desk.value.id

  $gtag.pageview({
    page_title: document.title,
    page_path: document.location.pathname,
    // @ts-expect-error custom dimension
    internal_id: `desk.${resourceId}`,
  })

  if (!resourceId) {
    return
  }

  $tracker.withReferer({
    name: 'desk.seen',
    target_id: resourceId,
  })
})
</script>

<template>
  <BlocksView />
</template>
