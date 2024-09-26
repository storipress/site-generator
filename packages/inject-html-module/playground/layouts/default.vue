<script setup lang="ts">
import { computed, useInjectHtml, useRoute } from '#imports'
import { FooterHtml } from '#components'

const route = useRoute()
const profile = computed(() => {
  if (route.path === '/') {
    return 'front'
  }
  if (route.path === '/article') {
    return 'article'
  }
  return 'unknown'
})

useInjectHtml(profile)
</script>

<template>
  <div>
    <div flex gap-2>
      <NuxtLink underline text-teal-600 block to="/"> Home </NuxtLink>
      <NuxtLink underline text-teal-600 block to="/article"> Article </NuxtLink>
    </div>
    <NuxtPage />
    <FooterHtml :profile="profile" />
  </div>
</template>
