<script lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { withoutTrailingSlash } from 'ufo'
import usePosts from '../stores/posts'
import { useResourceResolver, useSEO } from '#imports'

export default defineComponent({
  props: {
    article: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    forTracking: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const root = ref()
    const $route = useRoute()
    const $router = useRouter()
    const postsStore = usePosts()
    const $gtag = useGtag()
    const $tracker = useTracker()
    const $paywall = usePaywall()

    if (!props.disabled) {
      if (props.forTracking) {
        useIntersectionObserver(
          root,
          ([{ isIntersecting }]) => {
            isIntersecting && handleReading()
          },
          { threshold: 0.8 },
        )
      } else {
        useIntersectionObserver(
          root,
          ([{ isIntersecting }]) => {
            const [{ bottom }] = root.value.getClientRects()
            if (isIntersecting && bottom > window.innerHeight) showPaywall()
            else $paywall.setArticle({ id: '', plan: 'free' })
          },
          { threshold: [0.6, 1] },
        )
      }
    }

    async function handleReading() {
      const { article } = props
      const { title, id, seo } = article
      const { _resolveFromMetaSync } = useResourceResolver()
      const res = _resolveFromMetaSync('article', article as any)
      if (res && res.url !== withoutTrailingSlash($route.path)) {
        // replace url but keep query and hash
        await $router.replace({
          path: res.url,
          query: $route.query,
          hash: $route.hash,
        })
        useSEO(article)
        useHead({
          title: filterHTMLTag(seo?.meta?.title || title),
        })
      }

      postsStore.SET_TITLE(filterHTMLTag(seo?.meta?.title || title))

      if (id) {
        $gtag.pageview({
          page_title: document.title,
          page_path: $route.fullPath,
          // @ts-expect-error custom dim
          internal_id: `article.${id}`,
        })

        $tracker.withReferer({
          name: 'article.seen',
          target_id: id,
        })
      }
    }

    async function showPaywall() {
      if ($paywall.paywall.value?.paywallMachine?.context?.article?.id !== props.article?.id)
        $paywall.setArticle(props.article)
    }

    return { root }
  },
})
</script>

<template>
  <div
    ref="root"
    class="absolute left-0 invisible w-1 max-h-full sensor -z-10"
    :class="forTracking ? 'h-52' : 'h-[37.5rem]'"
  />
</template>
