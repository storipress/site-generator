<script lang="ts" setup>
import SwappableImage from './swappable-image.vue'

defineProps({
  kind: {
    type: String,
    default: 'logo',
  },
})
</script>

<template>
  <SwappableImage :kind="kind" alt="logo" />
</template>
