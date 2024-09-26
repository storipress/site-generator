<script lang="ts" setup>
import ArticleElement from './article-element.vue'
import { useArticleElement } from './inject'

defineProps({
  kind: {
    type: String,
    default: 'article-desk',
  },
  component: {
    type: String,
    default: 'p',
  },
})

const styles = {}
const element = useArticleElement()
</script>

<template>
  <ArticleElement :component="component" :kind="kind" :class="kind" :styles="styles">
    {{ element.desk }}
  </ArticleElement>
</template>
