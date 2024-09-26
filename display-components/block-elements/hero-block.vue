<script lang="ts">
import type { PropType } from 'vue'
import { IMAGE_CONTROL } from '../common/image'
import ColorArea from './color-area.vue'

interface BlockProp {
  id: string
}

export default defineComponent({
  components: { ColorArea },

  props: {
    /**
     * An required object for `Block`. Your block must accept a props called `block` and pass it to `Block`
     */
    block: {
      type: Object as PropType<BlockProp>,
      required: true,
    },
  },

  setup(props) {
    provide('blockId', props.block.id)
    provide(IMAGE_CONTROL, { lazy: false })

    return {
      blockClasses: computed(() => `b-${props.block.id}`),
    }
  },
})
</script>

<template>
  <ColorArea component="section" class="storipress-block relative" :class="blockClasses">
    <slot />
  </ColorArea>
</template>
