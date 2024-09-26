import type { InjectionKey } from 'vue'
import type { DisplayArticle } from '../common/article-placeholder'
import { isPlaceholder } from '../common/article-placeholder'

interface ArticleCount {
  count: number
  success: number
}

const ARTICLE_COUNT: InjectionKey<ArticleCount> = Symbol('insufficient-block')

export function useInsufficientBlock() {
  const articleCount = createArticleCount()
  const isLazy = ref(true)
  const visible = ref(false)
  provide(ARTICLE_COUNT, articleCount)

  onMounted(() => {
    if (articleCount.count === 0 || (articleCount.count > 0 && articleCount.success === articleCount.count)) {
      visible.value = true
      // ensure lazy effect remove and only if it should be visible
      setTimeout(() => {
        isLazy.value = false
      }, 1000)
    }
  })

  return {
    isLazy,
    visible,
  }
}

export function useCheckArticle(article: Ref<DisplayArticle>) {
  const articleCount = inject(ARTICLE_COUNT, createArticleCount, true)

  onBeforeMount(() => {
    articleCount.count += 1
    if (!isPlaceholder(article.value)) {
      articleCount.success += 1
    }
  })
}

function createArticleCount(): ArticleCount {
  return {
    count: 0,
    success: 0,
  }
}
