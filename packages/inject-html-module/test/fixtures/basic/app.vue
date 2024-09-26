<script setup>
import { computed, useInjectHtml, useRoute } from '#imports'

const route = useRoute()
useInjectHtml(
  computed(() => {
    if (route.path === '/') {
      return 'front'
    }
    if (route.path === '/article') {
      return 'article'
    }
    if (route.path === '/complex') {
      return 'complex'
    }
    return 'unknown'
  }),
)
</script>

<template>
  <div>basic</div>
</template>
