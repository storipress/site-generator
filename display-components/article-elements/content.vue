<script lang="ts">
import { debounce } from 'lodash'

import { useTrackLink } from './helper'
import { useArticleElement } from './inject'

export default defineComponent({
  setup() {
    const root = ref<HTMLElement>()
    const element = useArticleElement()

    useTrackLink(root, (link) => ({
      name: 'article.link.clicked',
      target_id: element.id,
      data: {
        link,
      },
    }))

    const { left } = useElementBounding(root)
    const { width: bodyWidth } = useElementSize(() => (typeof window !== 'undefined' ? markRaw(document.body) : null))

    onMounted(() => {
      const observer = new ResizeObserver(
        debounce(() => {
          const rect = root.value!.getBoundingClientRect()
          left.value = rect.left
        }, 10),
      )
      observer.observe(root.value as HTMLElement)

      onBeforeUnmount(() => {
        observer.disconnect()
      })
    })

    return {
      root,
      left,
      width: computed(() => (bodyWidth.value ? `${bodyWidth.value}px` : '100vw')),
      content: computed(() => element.content),
      elementStyles: computed((): string[] => {
        return [...Object.entries(element.elements ?? {})].map(([key, value]) => `${key}--${value}`)
      }),
    }
  },
})
</script>

<template>
  <div
    ref="root"
    class="article-content"
    :class="elementStyles"
    :style="{ '--left-offset': `${left}px`, '--body-width': width }"
  >
    <ArticleBody class="main-content" />
  </div>
</template>
