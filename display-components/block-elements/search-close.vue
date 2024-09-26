<script lang="ts" setup>
defineEmits(['click'])
</script>

<template>
  <button class="close icon-cross_thin" @click="$emit('click')" />
</template>

<style lang="scss" scoped>
.close {
  @apply fixed z-20 text-white;

  width: 1.875rem;
  height: 1.875rem;
  top: 1.125rem;
  right: 0.75rem;

  @screen md {
    top: 2.5rem;
    right: 1.563rem;
  }

  &:hover {
    @apply opacity-90 transition-opacity;
  }
}
</style>
