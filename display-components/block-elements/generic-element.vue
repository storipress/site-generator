<script lang="ts">
import type { PropType } from 'vue'
import { useBlockChild } from './base-element'

export default defineComponent({
  name: 'GenericElement',

  props: {
    component: String,
    path: { type: Array as PropType<string[]>, required: true },
    defaultValue: String,
  },

  setup(props) {
    const { data: text, kind } = useBlockChild(toRef(props, 'path'))

    return {
      kind,
      text,
      computedClass: kind,
    }
  },
})
</script>

<template>
  <component :is="component" class="element" :class="computedClass">
    <template v-if="text">
      {{ text }}
    </template>
    <slot v-else />
  </component>
</template>
