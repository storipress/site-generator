<script lang="ts" setup>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useArticleElement } from './inject'
import ArticleElement from './article-element.vue'

const props = defineProps({
  format: {
    type: String,
    default: 'MMM-DD-YYYY hh:mmA [GMT]Z',
  },
})

dayjs.extend(utc)
dayjs.extend(timezone)

const element = useArticleElement()
const storipress = useStoripress()
const date = computed((): dayjs.Dayjs => {
  const date = element.date
  return dayjs(date)
})

const datetime = computed((): string => {
  try {
    return date.value.toISOString()
  } catch {
    return ''
  }
})

const display = computed((): string => {
  try {
    try {
      return date.value.tz(storipress.timezone).format(props.format)
    } catch {}
    return date.value.format(props.format)
  } catch {
    return ''
  }
})

const styles = {}
</script>

<template>
  <ArticleElement component="p" kind="article-date" class="article-date" :styles="styles">
    <time :datetime="datetime">{{ display }}</time>
  </ArticleElement>
</template>
