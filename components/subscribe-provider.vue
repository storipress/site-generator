<script lang="ts">
export default defineComponent({
  provide() {
    return {
      $element: {
        subscribe: this.subscribe,
      },
    }
  },
  props: {
    subscribe: {
      type: String,
      default: '',
    },
  },
})
</script>

<template>
  <div class="subscribe-block">
    <slot />
  </div>
</template>
