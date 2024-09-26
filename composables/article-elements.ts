import { useStoripressCompatInject } from '#imports'

interface Identifiable {
  id: string
}

interface DeskLike {
  desk?: DeskLike
  layout?: Identifiable
}

interface ArticleLike {
  layout?: Identifiable
  desk: DeskLike
}

export function useArticleElement(article: ArticleLike) {
  const id = resolveLayoutID(article)
  const compatData = useStoripressCompatInject()
  const elementsMap = compatData.frontData.elementsMap
  if (!id) {
    return elementsMap[compatData.frontData.fallback.layout] || { dropcap: 'none', blockquote: 'regular' }
  }
  return elementsMap[id] || { dropcap: 'none', blockquote: 'regular' }
}

function resolveLayoutID(article: ArticleLike) {
  if (article.layout) {
    return article.layout.id
  }
  if (article.desk?.desk?.layout) {
    return article.desk.desk.layout.id
  }
  if (article.desk) {
    return article.desk.layout?.id
  }
  return null
}
