<script lang="ts">
import { useBlockChild } from './base-element'

function raf() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve)
  })
}

function executeScriptElements(containerElement: HTMLElement) {
  const scriptElements = containerElement.querySelectorAll('script')

  for (const scriptElement of scriptElements) {
    const clonedElement = document.createElement('script')

    for (const attribute of scriptElement.attributes) {
      clonedElement.setAttribute(attribute.name, attribute.value)
    }

    clonedElement.text = scriptElement.text

    scriptElement.parentNode!.replaceChild(clonedElement, scriptElement)
  }
}

export default defineComponent({
  props: {
    kind: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const blockId = inject<string>('blockId')
    const path = computed(() => [`b-${blockId}`, props.kind])
    const { data } = useBlockChild(path)

    const root = ref<HTMLElement>()

    onMounted(async () => {
      await nextTick()
      await raf()
      executeScriptElements(root.value!)
    })

    return {
      root,
      text: data,
    }
  },
})
</script>

<template>
  <div ref="root" v-html="text" />
</template>
