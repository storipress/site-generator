<script lang="ts" setup>
defineProps({
  full: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="mx-auto" :class="[full ? null : 'spacing']">
    <slot />
  </div>
</template>
