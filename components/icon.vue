<script lang="ts">
export default defineComponent({
  props: {
    color: {
      default: 'currentColor',
      type: String,
    },
    icon: {
      type: String,
      required: true,
    },
  },
})
</script>

<template>
  <svg viewBox="0 0 24 24">
    <path :fill="color" :d="icon" />
  </svg>
</template>
