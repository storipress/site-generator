import { P, match } from 'ts-pattern'
import { createEmptyArticle, getImageDataUrl } from '../display-components/common/article-placeholder'
import { convertArticle } from '../display-components/common/convert-article'

export function useNormalizedArticle(cacheKey?: string) {
  const articleFilter = useArticleFilter()
  const pageMeta = useResourcePageMeta()
  const desk = inject('desk', ref('latest'))
  // const cacheKey = useAutoKey(props)
  const condition = pageMeta.value
    ? usePageMetaAsCondition()
    : match(desk?.value)
        .with(P.union('', 'latest', P.nullish), () => [])
        .with('featured', () => [{ type: 'featured' as const, value: true }])
        .otherwise((value) => [{ key: 'slug' as const, value }])
  const { articles } = useFillArticles(1, condition, { cacheKey })
  const article = computed(() => {
    const deskSlug = pageMeta.value && pageMeta.value.type === 'desk' ? pageMeta.value.meta.slug : desk.value
    const a = articles.value?.[0]
    // FIXME: this only prevent crash, need to investigate why no article
    if (!a) {
      return createEmptyArticle(deskSlug)
    }

    return {
      headline: getImageDataUrl(),
      ...convertArticle(a),
    }
  })

  return {
    desk,
    condition,
    article,
    normalizedArticle: computed(() => {
      return (
        article.value && {
          ...article.value,
          title: articleFilter(article.value.title),
          blurb: articleFilter(article.value.blurb || ''),
        }
      )
    }),
  }
}
