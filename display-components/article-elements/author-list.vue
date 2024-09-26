<script lang="ts" setup>
import ArticleElement from './article-element.vue'
import { useArticleElement } from './inject'

const styles = {}

const authors = toRef(useArticleElement(), 'authors')
</script>

<template>
  <ArticleElement
    v-if="authors.length > 0"
    component="article"
    kind="article-author"
    class="article-author"
    :styles="styles"
  >
    <slot />
  </ArticleElement>
</template>
