<script lang="ts" setup>
import { useStoripressCompatInject } from '../composables/storipress-compat-inject'

const { blocks } = useStoripressCompatInject()

provide('seenArticles', new Set())
</script>

<template>
  <div>
    <template v-for="block of blocks" :key="block.id">
      <component :is="block.component" :block="{ id: block.id }" />
    </template>
  </div>
</template>
