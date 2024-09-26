import * as elements from './elements'

export const Template = defineComponent({
  components: {
    ...elements,
  },

  provide() {
    return {
      $element: this.article,
    }
  },

  props: {
    article: {
      type: Object,
      required: true,
    },
  },
})
