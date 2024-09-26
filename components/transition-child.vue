<script>
import { transitionProps, useTransitionClasses, useTransitionState } from '../lib/transition'

export default defineComponent({
  props: {
    as: {
      type: String,
      default: 'div',
    },
    ...transitionProps,
  },

  setup(props) {
    const state = useTransitionState()

    return useTransitionClasses(props, state)
  },
})
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
