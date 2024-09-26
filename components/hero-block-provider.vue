<script lang="ts">
export default defineComponent({
  setup() {
    provide('blockId', '@@hero')
  },
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
