<script lang="ts">
import { hasProtocol } from 'ufo'
import { userNewTab } from './user-new-tab'
import { NuxtLink } from '#components'

export default defineComponent({
  components: {
    NuxtLink,
  },
  props: {
    href: {
      type: String,
      // prevent crash
      default: '#',
    },
  },
  setup(props) {
    const compatInject = useStoripressCompatInject()
    const isHome = computed(() => props.href === '/')
    const link = computed(() => {
      const homepage = compatInject.frontData.site.homepage || '/'
      return isHome.value ? homepage : props.href
    })

    const nprogress = useNProgress()
    const route = useRoute()

    const properties = computed(() => {
      const { href: _href, ...rest } = props
      const isExternal = hasProtocol(link.value, { acceptRelative: true })
      // TODO: find a better way to detect article link
      const isPost = !isExternal && link.value.includes('posts')
      const isDesk = !isExternal && link.value.includes('desks')
      return {
        ...rest,
        external: isExternal,
        // Only prefetch article to improve UX
        prefetch: isPost || isDesk,
        // for debug
        prefetchedClass: 'prefetched',
        ...(isExternal ? { to: link.value, target: isHome.value ? '_self' : '_blank' } : { to: link.value }),
        onClick(event: Event) {
          if (!isExternal && link.value !== route.path && !userNewTab(event)) {
            nprogress.start()
          }
        },
      }
    })

    return {
      properties,
    }
  },
})
</script>

<template>
  <NuxtLink v-bind="properties">
    <slot />
  </NuxtLink>
</template>
