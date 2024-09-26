import { aliasParagraph, shiftH1H2, unscopedAuthorName } from './patch-style-tree'
import type { StyleTree } from './style-tree'
import { assertStyleTree } from './style-tree'

export function fixArticleStyle(style: StyleTree) {
  let tree = assertStyleTree(style, 'article')
  tree = shiftH1H2(tree)
  tree = aliasParagraph(tree)
  tree = unscopedAuthorName(tree)
  return tree
}
