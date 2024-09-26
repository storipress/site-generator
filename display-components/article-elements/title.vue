<script lang="ts" setup>
import { unwrapParagraph } from './helper'
import { useArticleElement } from './inject'

defineProps({
  kind: { type: String, default: 'article-title' },
})

const element = useArticleElement()
const title = computed(() => {
  return unwrapParagraph(element.title)
})
</script>

<template>
  <h1 :class="kind" v-html="title" />
</template>
