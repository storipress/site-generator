<script lang="ts" setup>
import type { Component } from 'vue'

const props = defineProps<{
  as: string | Component
  autoKey?: string
}>()

useAutoKey(props)
</script>

<template>
  <slot v-if="as === 'template'" />
  <component :is="as" v-else v-bind="$attrs">
    <slot />
  </component>
</template>
