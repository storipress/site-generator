<script lang="ts" setup>
defineProps({
  component: {
    type: String,
    default: 'p',
  },
  kind: String,
  blockType: String,
})
</script>

<template>
  <component :is="component" class="element" :class="kind">
    <slot />
  </component>
</template>
