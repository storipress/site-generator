<script lang="ts" setup>
defineProps({
  kind: {
    type: String,
  },
  component: {
    type: String,
    default: 'div',
  },
})
</script>

<template>
  <component :is="component" :class="kind" v-bind="$attrs">
    <slot />
  </component>
</template>
