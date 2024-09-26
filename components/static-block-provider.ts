export const StaticBlockProvider = defineComponent({
  name: 'StaticBlockProvider',
  props: {
    block: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide('blockId', `@@${props.block}`)

    return () => slots.default?.()
  },
})

export default StaticBlockProvider
