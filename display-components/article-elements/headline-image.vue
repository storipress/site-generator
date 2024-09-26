<script lang="ts">
import { getImageDataUrl } from '../common/article-placeholder'
import ResponsiveImage from '../common/responsive-image.vue'
import { useArticleElement } from './inject'

export default defineComponent({
  components: { ResponsiveImage },

  props: {
    sizes: {
      type: String,
      default: '95vw',
    },
  },

  setup() {
    const $element = useArticleElement()
    const src = computed(() => $element.headlineURL || getImageDataUrl())
    const alt = computed(() => $element.headlineAlt)
    // const focus = computed(() => $element.value.headlineFocus)
    // const { image } = useFocusedImage<Vue>({
    //   extractor: (vm: Vue) => vm.$el as HTMLImageElement,
    //   src,
    //   focus,
    // })

    return {
      // image,
      // focus,
      src,
      alt,
    }
  },
})
</script>

<template>
  <div class="headline">
    <div class="relative h-full overflow-hidden">
      <!-- w-auto h-auto is used to prevent aspect ratio plugin affect -->
      <ResponsiveImage
        class="transition-position inset-0 object-cover w-auto h-auto min-w-full min-h-full"
        :src="src"
        :sizes="sizes"
        :alt="alt"
      />
    </div>
  </div>
</template>
