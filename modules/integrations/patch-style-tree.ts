import { produce } from 'immer'

import type { StyleTree } from './style-tree'
import { createStyleTree, getOptionalNode } from './style-tree'

const H1_NAME = '& .main-content h1'
const H2_NAME = '& .main-content h2'
const H3_NAME = '& .main-content h3'
const P_NAME = '& .main-content p'
const P_ALIAS_NAME = '& .main-content .base-text'

const ARTICLE_AUTHOR_NAME = 'article-author'
const UNSCOPED_AUTHOR_NAME = '& .author-name'

export function unscopedAuthorName(tree: StyleTree) {
  return produce(tree, (draft) => {
    const node = getOptionalNode(draft, ['article', 'author-name'])
    if (!node) {
      return
    }

    draft.children[ARTICLE_AUTHOR_NAME] = createStyleTree(ARTICLE_AUTHOR_NAME)
    draft.children[ARTICLE_AUTHOR_NAME].children[UNSCOPED_AUTHOR_NAME] = cloneAs(node, UNSCOPED_AUTHOR_NAME)
  })
}

export function shiftH1H2(tree: StyleTree) {
  return produce(tree, (draft) => {
    const node = getOptionalNode(draft, ['article', 'article-content'])
    if (!node) {
      return
    }

    if (node.children[H2_NAME]) {
      node.children[H3_NAME] = cloneAs(node.children[H2_NAME], H3_NAME)
    }

    if (node.children[H1_NAME]) {
      node.children[H2_NAME] = cloneAs(node.children[H1_NAME], H2_NAME)
    }
  })
}

export function aliasParagraph(tree: StyleTree) {
  return produce(tree, (draft) => {
    const node = getOptionalNode(draft, ['article', 'article-content'])
    if (!node) {
      return
    }

    if (node.children[P_NAME]) {
      node.children[P_ALIAS_NAME] = cloneAs(node.children[P_NAME], P_ALIAS_NAME)
    }
  })
}

function cloneAs(node: StyleTree, name: string): StyleTree {
  return {
    name,
    styles: {
      ...node.styles,
    },
    children: {
      ...node.children,
    },
  }
}
