<script lang="ts" setup>
import ArticleElement from './article-element.vue'

const styles = {}
</script>

<template>
  <ArticleElement component="span" kind="author-name" class="author-name" :styles="styles">
    <slot />
  </ArticleElement>
</template>
