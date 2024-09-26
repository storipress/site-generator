<script lang="ts" setup>
defineProps({
  kind: {
    type: String,
  },
  component: {
    type: String,
    default: 'div',
  },
  disabled: {
    type: Boolean,
  },
  backgroundColor: {
    type: [String, Object],
  },
})
</script>

<template>
  <component :is="component" :class="kind">
    <slot />
  </component>
</template>
