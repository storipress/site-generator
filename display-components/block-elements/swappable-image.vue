<script lang="ts">
import { useBlockChild } from './base-element'

export default defineComponent({
  name: 'SwappableImage',

  props: {
    kind: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
    },
    defaultValue: {
      type: String,
    },
  },

  setup(props) {
    const blockId = inject('blockId')
    const path = computed(() => [`b-${blockId}`, props.kind])
    const { data } = useBlockChild(path, 'images')

    return {
      url: data,
    }
  },
})
</script>

<template>
  <div class="relative">
    <img class="h-full" :src="url" :alt="alt" />
  </div>
</template>
