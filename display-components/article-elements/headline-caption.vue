<script lang="ts" setup>
import { unwrapParagraph } from './helper'
import { useArticleElement } from './inject'

defineProps({ component: { type: String, default: 'p' } })

const element = useArticleElement()
const caption = computed(() => {
  return unwrapParagraph(element.headlineCaption)
})
</script>

<template>
  <component :is="component" class="headline-caption">
    <span class="caption-text" v-html="caption" />
  </component>
</template>

<style scoped>
:deep(.caption-text a) {
  color: inherit;
  text-decoration: underline;
}
</style>
