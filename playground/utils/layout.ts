import { attachDefaultArticleElements } from './article/article-elements'
import type { Layout, LayoutFragment } from './types'

export function resolveLayout(...layouts: [...(LayoutFragment | null | undefined)[], LayoutFragment]): Layout {
  const layout = layouts.find((l) => l != null) as LayoutFragment
  const data = JSON.parse(layout.data || '{}')
  return {
    ...layout,
    data: {
      ...data,
      elements: attachDefaultArticleElements(data.elements),
    },
  }
}
