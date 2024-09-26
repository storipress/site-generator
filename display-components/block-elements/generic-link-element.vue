<script lang="ts">
import { useBlockChild } from './base-element'

const URL_REGEX = /^https?:\/\//
const urlFormatter = (url: string) => (URL_REGEX.test(url) ? url : `https://${url}`)

export default defineComponent({
  name: 'GenericLinkElement',

  props: {
    component: String,
    path: { type: Array as PropType<string[]>, required: true },
    dataId: {
      type: String,
      default: null,
    },
    defaultValue: String,
  },

  setup(props) {
    const { frontData } = useStoripressCompatInject()
    const { data, kind } = useBlockChild(computed(() => (props.dataId ? [...props.path, props.dataId] : props.path)))

    const contentHTML = computed(() => {
      const text = data.value
      if (!text) return ''

      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        parsed = { content: text }
      }

      let { links, content, ...tmp } = parsed
      if (!links) links = [tmp]

      if (links.every((item: any) => item.start === -1 || item.end === -1 || (!item.href && !item.pageId)))
        return content

      return links.reduceRight((html: string, item: any) => {
        const { start, end, href, pageId } = item
        if (start === -1 || end === -1 || (!href && !pageId)) return html

        const page = frontData.pages.find((p: any) => p.id === pageId)
        const url = page ? page.url : urlFormatter(href || '')

        const linkHTML = `<a href="${url}">${content.slice(start, end)}</a>`
        return html.slice(0, start) + linkHTML + html.slice(end)
      }, content)
    })

    return {
      kind,
      computedClass: kind,
      contentHTML,
    }
  },
})
</script>

<template>
  <div class="generic-link-element-wrapper" :class="computedClass">
    <component :is="component" class="element">
      <span v-html="contentHTML" />
    </component>
  </div>
</template>

<style lang="scss">
.generic-link-element-wrapper > .element > span > a {
  @apply underline font-bold opacity-75;
}
</style>
