<script lang="ts">
interface Desk {
  name: string
  slug: string
  url: string
}

export default defineComponent({
  name: 'DeskSection',

  inject: {
    blockId: {
      default: '',
    },
    portal: {
      default: '',
    },
  },

  props: {
    order: Number,
  },

  setup(props) {
    const data = reactive({ desk: '', slug: '', url: '' })
    const blockId = inject<string>('blockId') as string

    const { frontData } = useStoripressCompatInject()
    const { blockDesks } = frontData

    provide(
      'desk',
      computed(() => data.slug),
    )

    const order = props.order as number
    const slug = blockDesks[blockId]?.[order] ?? 'latest'
    const desk = frontData.desks.find((desk: Desk) => slug === desk.slug) || { name: slug, slug, url: `/${slug}` }
    data.desk = desk.name
    data.slug = desk.slug
    data.url = desk.url

    return data
  },
})
</script>

<template>
  <div>
    <!--
      @slot desk content
      @binding {string} desk desk name
    -->
    <slot :desk="desk" :url="url" />
  </div>
</template>
