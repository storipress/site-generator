import type { Element } from 'parse5/dist/tree-adapters/default'
import { parseFragment, serializeOuter } from 'parse5'

import { render } from '@storipress/tiptap-schema'

export interface NormalSegment {
  id: 'normal'
  type: string
  html: string
}

export interface AdSegment {
  id: string
  type: 'ad'
  props: Record<string, any>
}

export interface PaidSegment {
  id: 'paid'
  type: string
  paidContent: string
}

export type Segment = NormalSegment | AdSegment | PaidSegment

export function renderPage(content: any) {
  const html = render(content)
  const segments = splitArticle(html)

  return {
    html,
    segments,
  }
}

function splitArticle(source: string): Segment[] {
  if (!source) {
    return []
  }

  const fragment = parseFragment(source)
  const hasH1 = fragment.childNodes.some((node) => {
    const element = node as Element
    return element.tagName === 'h1'
  })
  if (hasH1) {
    fragment.childNodes = fragment.childNodes.map((node) => {
      const element = node as Element
      if (element.tagName === 'h2') {
        element.tagName = 'h3'
      }
      if (element.tagName === 'h1') {
        element.tagName = 'h2'
      }
      return element
    })
  }
  const segments = fragment.childNodes.map((_segment) => {
    const segment = _segment as Element
    const DATA_FORMAT = 'data-format'
    const format: { name: string; value: string } | undefined = segment.attrs?.find(
      ({ name }: { name: string }) => name === DATA_FORMAT,
    )
    const type = format?.value || segment.tagName

    return {
      id: 'normal' as const,
      type: type || 'div',
      html: serializeOuter(segment),
    }
  })

  return segments
}
