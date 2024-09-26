<script lang="ts" setup>
import ArticleElement from './article-element.vue'
import { unwrapParagraph } from './helper'
import { useArticleElement } from './inject'

defineProps({
  kind: { type: String, default: 'article-description' },
})
const element = useArticleElement()

const blurb = computed(() => unwrapParagraph(element.blurb))
const styles = {}
</script>

<template>
  <ArticleElement component="p" :kind="kind" :class="kind" :styles="styles" :html="blurb" />
</template>
