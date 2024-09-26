<script>
import { TRANSITION_STATE, transitionProps, useTransitionClasses } from '../lib/transition'

export default defineComponent({
  props: {
    as: {
      type: String,
      default: 'div',
    },
    appear: Boolean,
    ...transitionProps,
  },

  setup(props) {
    const count = ref(0)
    const state = ref('leaved')

    provide(TRANSITION_STATE, state)

    watch(
      () => props.appear,
      async (appear) => {
        if (appear) state.value = 'enter'
        else state.value = 'leave'
      },
    )

    watch(
      () => props.appear,
      (appear) => {
        requestAnimationFrame(() => {
          if (appear) state.value = 'entering'
          else state.value = 'leaving'
        })
      },
      { flush: 'post' },
    )

    watch(count, async (count) => {
      if (count !== 0) return

      await nextTick()
      if (props.appear) state.value = 'entered'
      else state.value = 'leaved'
    })

    return {
      count,
      state,
      ...useTransitionClasses(props, state),
    }
  },
})
</script>

<template>
  <component :is="as" :class="classes" @transitionstart="count += 1" @transitionend="count -= 1">
    <slot />
  </component>
</template>
