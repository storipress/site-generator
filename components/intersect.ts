// Modify from https://github.com/heavyy/vue-intersect/blob/master/src/index.js
// vue-server-renderer is seem not allow custom abstract component

import type { PropType, Ref } from 'vue'
import { useCurrentElement, useIntersectionObserver } from '@vueuse/core'

export default defineComponent({
  name: 'Intersect',
  props: {
    threshold: {
      type: Array as PropType<number[]>,
      required: false,
      default: () => [0, 0.2],
    },
    root: {
      type: typeof HTMLElement !== 'undefined' ? HTMLElement : Object,
      required: false,
      default: () => null,
    },
    rootMargin: {
      type: String,
      required: false,
      default: () => '0px 0px 0px 0px',
    },
  },
  emits: ['leave', 'change', 'enter'],
  setup(props, { emit, slots }) {
    const el = useCurrentElement() as Ref<HTMLElement>
    useIntersectionObserver(
      el,
      (entries) => {
        const entry = entries[0]
        const arg = [entry]
        if (!entry.isIntersecting) emit('leave', arg)
        else emit('enter', arg)

        emit('change', arg)
      },
      {
        threshold: props.threshold,
        root: props.root,
        rootMargin: props.rootMargin,
      },
    )

    return () => {
      const slot = slots.default?.()[0]
      const children = slot ? [slot] : []
      return h('div', children)
    }
  },
})
