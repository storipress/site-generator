<script lang="ts" setup>
import type { Article } from '@storipress/sdk/helper'
import type { PropType } from 'vue'
import Empty from '../formats/empty.vue'
import ReadingDetector from '../reading-detector.vue'
import { useArticleElement } from '../../composables/article-elements'

const props = defineProps({
  value: {
    type: Object as PropType<Article>,
    required: true,
  },
  isOther: {
    type: Boolean,
    default: false,
  },
})

const { formats: FORMATS, formatsOther: FORMATS_OTHER } = useStoripressCompatInject()

function raf() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve)
  })
}

const root = ref()
const logo = useLogo()
const elements = useArticleElement(props.value)
provide('$element', {
  logo,
  ...props.value,
  elements,
})
const profile = ref<{ id: string; subscribed: boolean } | null>(null)
const article = computed(() => ({
  logo,
  elements,
  ...props.value,
  authors:
    props.value.authors?.map((author) => ({
      ...author,
      url: `/authors/${author.slug}`,
      name: author.full_name,
    })) ?? [],
}))
const willShowPaywall = computed(() => {
  return (
    (article.value?.plan === 'member' && !profile.value?.id) ||
    (article.value?.plan === 'subscriber' && !profile.value?.subscribed)
  )
})
const paywall = usePaywall()
onMounted(async () => {
  await nextTick()
  await nextTick()
  await raf()

  watch(
    [paywall.paywall, () => paywall.paywall.value?.profile],
    () => {
      profile.value = paywall.paywall.value?.profile?.id ? paywall.paywall.value?.profile : null
    },
    { immediate: true },
  )
})

const paywallUnmounted = ref(true)
watch([paywall.paywall, willShowPaywall], ([nowPaywall, nowShowPaywall]) => {
  if (article.value.id && nowShowPaywall) {
    nowPaywall?.mountArticlePaywall(`paywall-${article.value.id}`, article.value)
    paywallUnmounted.value = false
  }
})

useProvideArticle(props.value)

const template = computed(() => {
  return (props.isOther ? FORMATS_OTHER[resolveLayout()] : FORMATS[resolveLayout()]) ?? Empty
})

function resolveLayout() {
  if (props.isOther) {
    return `other-template-${props.value.layout?.id}`
  }
  const articleLayoutId = props.value.layout?.id || props.value?.desk?.layout?.id || props.value?.desk?.desk?.layout?.id
  if (articleLayoutId != null) {
    return `article-template-${articleLayoutId}`
  }

  return Object.keys(FORMATS)[0]
}
</script>

<template>
  <div ref="root" class="article-display relative">
    <ReadingDetector :disabled="isOther" :article="article" for-tracking />
    <component
      :is="template"
      :article="article"
      :style="{ 'padding-bottom': willShowPaywall && paywallUnmounted ? '24rem' : '' }"
    />
    <ReadingDetector v-if="willShowPaywall" :disabled="isOther" :article="article" class="bottom-0" />
  </div>
</template>
