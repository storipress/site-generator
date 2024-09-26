<script lang="ts">
import { stubObject } from 'lodash'

function normalizeValue(x: number | string) {
  return typeof x === 'number' ? `${x}px` : x
}

export default defineComponent({
  provide: {
    // ! make the nav detacth from our data tree
    blockId: '@@hero',
  },

  props: {
    height: {
      type: [Number, String, Object],
      default: stubObject as () => { xs?: string | number; md?: string | number; lg?: string | number },
    },
  },

  setup(props) {
    const root = ref<HTMLElement>()
    const route = useRoute()

    useHead(() => {
      if (!props.height) {
        return {}
      }

      const {
        xs = null,
        md = null,
        lg = null,
      } = typeof props.height === 'string' || typeof props.height === 'number' ? { xs: props.height } : props.height
      const meta = { style: [] as { hid: string; cssText: string }[] }

      if (xs) {
        meta.style.push({
          hid: 'xs-nav',
          cssText: `:root{--sp-nav-height:${normalizeValue(xs)}}`,
        })
      }
      if (md) {
        meta.style.push({
          hid: 'md-nav',
          cssText: `@media(min-width:768px){:root{--sp-nav-height:${normalizeValue(md)}}}`,
        })
      }
      if (lg) {
        meta.style.push({
          hid: 'lg-nav',
          cssText: `@media(min-width:1070px){:root{--sp-nav-height:${normalizeValue(lg)}}}`,
        })
      }

      return meta
    })

    function updateHeight() {
      if (!root.value) {
        return
      }
      const $root = root.value
      const style = getComputedStyle($root)
      if (style.position === 'fixed') {
        const height = $root.offsetHeight
        document.body.style.setProperty('--sp-nav-height', `${height}px`)
      }
    }

    useResizeObserver(root, updateHeight)
    watch(
      () => route.path,
      () => updateHeight(),
    )
    onMounted(() => {
      updateHeight()
    })

    return {
      root,
    }
  },
})
</script>

<template>
  <nav ref="root" class="nav">
    <slot />
  </nav>
</template>
