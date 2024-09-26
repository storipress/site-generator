<script lang="ts">
import type { PropType } from 'vue'
import { FocusedImage } from '@storipress/image-focus'
import ResponsiveImage from './responsive-image.vue'

interface Focus {
  x: number
  y: number
}

interface ArticleImage {
  headline: string
  headlineAlt: string
  headlineFocus: Focus
}

export default defineComponent({
  components: { ResponsiveImage },

  props: {
    article: {
      type: Object as PropType<ArticleImage>,
      required: true,
    },
    sizes: {
      type: String,
    },
  },

  setup(props) {
    const image = ref()
    const src = computed(() => props.article.headline)

    onMounted(() => {
      const $img = image.value!.$el as HTMLImageElement
      const focusedImage = new FocusedImage($img, {
        focus: props.article.headlineFocus,
      })

      watch(
        src,
        async (src, old) => {
          const isDataUrl = src.startsWith('data:')
          const oldIsDataUrl = old?.startsWith('data:') ?? false
          if (isDataUrl === oldIsDataUrl) {
            return
          }

          await nextTick()

          focusedImage.applyShift()

          if (isDataUrl) {
            focusedImage.stopListening()

            await nextTick()
            // reset shift for svg image
            focusedImage.resetShift()
          } else {
            focusedImage.startListening()
          }
        },
        { immediate: true },
      )

      // FIXME: no idea why the above watch doesn't work
      setTimeout(() => {
        if (src.value.startsWith('data:')) {
          focusedImage.resetShift()
        }
      }, 1000)

      watch(
        () => props.article.headlineFocus,
        (focus) => {
          focusedImage.setFocus(focus)
        },
      )

      onBeforeUnmount(() => {
        focusedImage.stopListening()
      })
    })

    return {
      image,

      src,
      alt: computed(() => props.article.headlineAlt),
    }
  },
})
</script>

<template>
  <div class="relative">
    <ResponsiveImage
      ref="image"
      class="max-w-none transition-position inset-0 object-cover w-auto h-auto min-w-full min-h-full"
      :src="src"
      :sizes="sizes"
      :alt="alt"
    />
  </div>
</template>
