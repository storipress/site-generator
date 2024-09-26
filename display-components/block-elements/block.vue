<script lang="ts">
import type { PropType } from 'vue'
import ColorArea from './color-area.vue'
import Spacing from './spacing.vue'
import { useInsufficientBlock } from './insufficient-block'

interface BlockProp {
  id: string
}

export default defineComponent({
  components: { ColorArea, Spacing },

  props: {
    /**
     * An required object for `Block`. Your block must accept a props called `block` and pass it to `Block`
     */
    block: {
      type: Object as PropType<BlockProp>,
      required: true,
    },

    full: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    provide('blockId', props.block.id)

    return {
      blockClasses: computed(() => `b-${props.block.id}`),
      ...useInsufficientBlock(),
    }
  },
})
</script>

<template>
  <ColorArea
    component="section"
    class="storipress-block relative"
    :class="[blockClasses, isLazy && 'block-lazy', isLazy && visible && 'block-lazy--visible']"
  >
    <Spacing :full="full">
      <slot />
    </Spacing>
  </ColorArea>
</template>

<style lang="scss">
.block-lazy {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.5s ease-in-out;

  &:not(.block-lazy--visible) {
    padding: 0;
  }

  &.block-lazy--visible {
    max-height: 2000px;
  }
}
</style>
