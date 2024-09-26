<script lang="ts" setup>
import dayjs from 'dayjs'
import type { PropType } from 'vue'
import { getImageDataUrl } from '../display-components/common/article-placeholder'

const props = defineProps({
  article: Object as PropType<any>,
})

const desk = computed(() => {
  const { desk: d } = props.article
  return d?.desk?.name ?? d?.name ?? ''
})
const articleFilter: (html: string) => string = useArticleFilter()
const headline = computed(() => props.article.cover?.url || getImageDataUrl())
const title = computed(() => articleFilter(props.article.title))
const blurb = computed(() => articleFilter(props.article.blurb))
const time = computed(() => {
  const { published_at } = props.article
  const t = new Date(published_at)
  return dayjs(t).format('MMMM D, YYYY')
})
</script>

<template>
  <NuxtLink :to="article.url" class="article-box w-full overflow-hidden">
    <div class="article-headline flex items-center justify-center overflow-hidden">
      <img
        :src="headline"
        loading="lazy"
        :alt="article.cover?.alt"
        class="object-cover w-full max-w-full min-w-full min-h-full"
      />
    </div>
    <div class="article-body mx-1 mb-1">
      <h2 class="article-heading mt-4 mb-1 font-bold">
        {{ title }}
      </h2>
      <div class="mb-2 text-xs leading-5" style="color: #696969">{{ desk }}, Published {{ time }}</div>
      <div class="text-ellipsis line-clamp-5 overflow-hidden text-sm">
        {{ blurb }}
      </div>
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
$sm: 640px;
$md: 768px;
$lg: 1070px;

@mixin sm {
  @media (min-width: $sm) {
    @content;
  }
}

@mixin md {
  @media (min-width: $md) {
    @content;
  }
}

@mixin lg {
  @media (min-width: $lg) {
    @content;
  }
}

.article-box {
  color: #2e2e2e;
  margin-bottom: 4rem;

  @include sm {
    width: 19.25rem;
    margin-right: 1.6rem;
    margin-bottom: 1.6rem;
  }

  @include md {
    width: 16.25rem;
    height: 24rem;
  }
}

.article-headline {
  line-height: 24px;
  height: 180px;
}

.article-body {
  font-family: 'Lato', sans-serif;
}

.article-heading {
  font-size: 1.125rem;
  line-height: 24px;
}
</style>
