<script lang="ts">
import { useCheckArticle } from './insufficient-block'

/**
 * An article showcase
 */
export default defineComponent({
  inject: {
    blockId: {
      default: '',
    },
    portal: {
      default: '',
    },
  },
  props: {
    autoKey: {
      type: String,
      default: undefined,
    },
  },

  setup(props) {
    const cacheKey = useAutoKey(props)
    const { desk, condition, article, normalizedArticle } = useNormalizedArticle(cacheKey)

    useCheckArticle(article)

    return {
      // this is just for devtool to inspect which desk is using
      desk,
      // for devtool
      condition,
      cacheKey,
      article,
      normalizedArticle,
    }
  },
})
</script>

<template>
  <div>
    <!--
      @slot display article preview
      @binding {object} article article info
    -->
    <slot v-if="article" :article="normalizedArticle" />
  </div>
</template>
