export const PortalBlockProvider = defineComponent({
  name: 'PortalBlockProvider',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide('portal', props.name)

    return () => slots.default?.()
  },
})

export default PortalBlockProvider
