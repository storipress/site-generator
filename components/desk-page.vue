<script lang="ts" setup>
defineProps({
  articles: { type: Array, default: () => [] },
})
</script>

<template>
  <ArticleList :articles="articles" />
</template>
