<script lang="ts" setup>
import ColorArea from './color-area.vue'

const props = defineProps({
  backgroundColor: [Boolean, String],
})

const color = computed((): string | undefined => {
  const { backgroundColor: color } = props
  return color ? (color === true ? '#ffffff' : (color as string)) : undefined
})
</script>

<template>
  <ColorArea component="section" kind="article-header" :disabled="!color" :background-color="color">
    <slot />
  </ColorArea>
</template>
