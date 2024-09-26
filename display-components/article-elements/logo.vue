<script lang="ts">
import ResponsiveImage from '../common/responsive-image.vue'
import { useArticleElement } from './inject'

export default defineComponent({
  components: { ResponsiveImage },

  setup() {
    const $element = useArticleElement()

    const logo = computed(() => $element.logo)

    return {
      logo,
    }
  },
})
</script>

<template>
  <ResponsiveImage v-if="logo" :src="logo" alt="logo" />
</template>
