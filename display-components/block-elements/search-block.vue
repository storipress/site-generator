<script lang="ts">
import ResponsiveImage from '../common/responsive-image.vue'

export default defineComponent({
  name: 'SearchBlock',
  components: { ResponsiveImage },
  props: {
    log: {
      type: Object,
      default: () => ({}),
    },
    url: {
      type: String,
      default: '',
    },
    info: {
      type: String,
      default: '',
    },
  },
  setup() {
    return {
      articleFilter: useArticleFilter(),
    }
  },
})
</script>

<template>
  <div class="md:mb-auto lg:mb-auto block-wrapper block mb-8">
    <div class="aspect-w-16 aspect-h-9 relative overflow-hidden opacity-100">
      <ResponsiveImage class="absolute object-cover w-full h-full" :src="url" :alt="info" />
    </div>
    <div class="long-title md:leading-7 lg:leading-7 overflow-x-hidden leading-snug">
      {{ articleFilter(log.title) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.block-wrapper:hover {
  opacity: 0.85;
  background: black;
  transition: all 0.35s ease-in-out;
}

img {
  @apply w-full h-full block cursor-pointer;

  transition: all 0.4s ease-in-out;
  transition-delay: 40ms;
  transform: scale(1);

  &:hover {
    transform: scale(1.08);
  }
}

.long-title {
  @apply text-2xl font-light text-center my-4 mx-auto text-white w-4/5 h-16;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow-y: hidden;

  @screen lg {
    height: 4.5rem;
  }
}
</style>
