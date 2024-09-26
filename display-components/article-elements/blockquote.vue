<script lang="ts" setup>
import ArticleElement from './article-element.vue'

const styles = {}
</script>

<template>
  <ArticleElement class="z-10" component="blockquote" kind="blockquote" :styles="styles">
    <slot />
  </ArticleElement>
</template>
