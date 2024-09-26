<script lang="ts" setup>
import ArticleElement from './article-element.vue'

const styles = {}
</script>

<template>
  <ArticleElement component="h2" kind="h2" :styles="styles">
    <slot />
  </ArticleElement>
</template>
