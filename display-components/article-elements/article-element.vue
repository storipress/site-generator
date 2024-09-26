<script lang="ts" setup>
defineProps({
  component: {
    type: String,
    required: true,
  },
  kind: {
    type: String,
  },
  html: {
    type: String,
    default: null,
  },
  styles: {
    type: Object,
    default: () => Object.freeze({}),
  },
})
</script>

<template>
  <component :is="component" v-if="html">
    <span v-html="html" />
  </component>
  <component :is="component" v-else>
    <slot />
  </component>
</template>
