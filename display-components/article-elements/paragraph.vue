<script lang="ts">
import ArticleElement from './article-element.vue'

export default defineComponent({
  components: { ArticleElement },
  props: {
    order: {
      type: Number,
    },
  },
})
</script>

<template>
  <ArticleElement component="p" kind="p" :styles="{}">
    <slot />
  </ArticleElement>
</template>
