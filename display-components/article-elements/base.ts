import ArticleElement from './article-element.vue'
import { BaseElement } from './inject'

export { BaseElement }

export const Element = BaseElement.extend({
  components: { ArticleElement },

  computed: {
    styles(): Record<string, unknown> {
      return {}
    },
  },
})
