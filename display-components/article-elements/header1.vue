<script lang="ts" setup>
import ArticleElement from './article-element.vue'

const styles = {}
</script>

<template>
  <ArticleElement component="h1" kind="h1" :styles="styles">
    <slot />
  </ArticleElement>
</template>
