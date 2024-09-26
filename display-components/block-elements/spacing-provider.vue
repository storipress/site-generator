<script lang="ts">
import Spacing from './spacing.vue'

export default defineComponent({
  components: { Spacing },
  props: {
    width: {
      type: [String, Object],
      default: 'auto',
    },
    max: {
      type: [String, Object],
    },
    min: {
      type: [String, Object],
    },
  },
})
</script>

<template>
  <Spacing>
    <slot />
  </Spacing>
</template>
