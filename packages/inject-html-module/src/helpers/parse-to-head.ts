import type { HTMLElement, Node } from 'node-html-parser'
import { NodeType, parse } from 'node-html-parser'
import type { Head } from 'zhead'

export type ParsedHead = Required<Pick<Head, 'link' | 'meta' | 'style' | 'script' | 'noscript'>>

export interface ParsedInjectHTML {
  head: ParsedHead
  html: string
}

const SUPPORTED_TAGS = ['script', 'link', 'meta', 'style', 'noscript'] as const
const SUPPORTED_TAG_SET: Set<string> = new Set(SUPPORTED_TAGS)

export function parseToInjectHTML(html: string, tagPosition: 'head' | 'bodyClose' = 'head'): ParsedInjectHTML {
  const parsedHead: ParsedHead = { script: [], link: [], meta: [], style: [], noscript: [] }
  let otherHTML = ''
  const root = parse(html)

  for (const node of root.childNodes) {
    if (isHtmlElement(node)) {
      const tagName = getTagName(node)
      if (isSupportTag(tagName)) {
        parsedHead[tagName].push({
          ...node.attributes,
          ...(node.innerHTML ? { innerHTML: node.innerHTML } : {}),
          // @ts-expect-error no type
          tagPriority: tagPosition === 'head' ? 'high' : 'low',
          tagPosition,
        })
      } else {
        otherHTML += node.outerHTML
      }
    } else {
      otherHTML += node.rawText
    }
  }

  return {
    head: parsedHead,
    html: otherHTML,
  }
}

export function mergeParsedHTML(heads: ParsedInjectHTML[]): ParsedInjectHTML {
  const mergedHead: ParsedHead = { script: [], link: [], meta: [], style: [], noscript: [] }
  let otherHTML = ''

  for (const head of heads) {
    for (const tag of SUPPORTED_TAGS) {
      mergedHead[tag].push(...head.head[tag])
    }
    otherHTML += head.html
  }

  return {
    head: mergedHead,
    html: otherHTML,
  }
}

function isSupportTag(tag: string): tag is (typeof SUPPORTED_TAGS)[number] {
  return SUPPORTED_TAG_SET.has(tag.toLowerCase())
}

function isHtmlElement(el: Node): el is HTMLElement {
  return el.nodeType === NodeType.ELEMENT_NODE
}

function getTagName(el: HTMLElement): string {
  return el.tagName.toLowerCase()
}
