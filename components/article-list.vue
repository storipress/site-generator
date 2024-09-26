<script lang="ts" setup>
import { stubArray } from 'lodash'

withDefaults(
  defineProps<{
    articles?: any[]
    currentPage: string
  }>(),
  {
    articles: stubArray,
  },
)

const { SiteNavbar } = useStoripressCompatInject()
</script>

<template>
  <div>
    <SiteNavbar :current-page="currentPage" />
    <slot />
    <NuxtLink v-for="article of articles" :key="article.url" class="block" :to="article.url">
      <h3 class="text-4xl">
        {{ article.title }}
      </h3>
      <p>{{ article.blurb }}</p>
    </NuxtLink>
  </div>
</template>
