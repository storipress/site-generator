<script lang="ts" setup>
import ColorArea from './color-area.vue'

const props = defineProps({
  backgroundColor: {
    type: [Boolean, Object, String],
    default: 'ffffff',
  },
})

const color = computed((): string | Record<string, string> | null => {
  const { backgroundColor: color } = props
  return color ? (color === true ? 'ffffff' : color) : null
})
</script>

<template>
  <ColorArea class="article pb-20" component="article" :background-color="color">
    <slot />
  </ColorArea>
</template>
