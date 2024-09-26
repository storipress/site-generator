<script lang="ts" setup>
import { useStoripress } from '../../composables/storipress'
import { useTrackLink } from './helper'
import { useArticleElement } from './inject'
import { generateLinks } from './social-shares'

const root = ref()
const element = useArticleElement()
const $storipress = useStoripress()
const site = $storipress.site

const socials = computed(() => {
  const siteName = site.name
  let { title, url } = element
  if (!/^https?:\/\//.test(url)) {
    url = `${$storipress.hostname}/${url}`
  }

  return generateLinks({
    url,
    title,
    siteName,
  })
})

const socialsReverseMap = computed(() => {
  return Object.fromEntries(
    Object.entries(socials.value).map(([key, value]) => {
      return [value, key]
    }),
  )
})

useTrackLink(root, (link) => {
  const social = socialsReverseMap.value[link]
  if (social) {
    return {
      name: 'article.shared',
      target_id: element.id,
      data: {
        platform: social,
      },
    }
  }
})

const article = computed(() => {
  const { title, blurb, headlineCaption, desk, deskUrl, authors, date, headlineURL, headlineFocus, headlineAlt } =
    element

  return {
    title,
    blurb,
    headlineCaption,
    desk,
    deskUrl,
    authors,
    date,
    headlineURL,
    headlineFocus,
    headlineAlt,

    headline: headlineURL,
  }
})
</script>

<template>
  <div ref="root">
    <slot :article="article" :socials="socials" />
  </div>
</template>
