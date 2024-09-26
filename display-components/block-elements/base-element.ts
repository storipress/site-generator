import invariant from 'tiny-invariant'
import { last } from 'remeda'
import type { Ref } from 'vue'

export interface ElementInfo {
  path: string[]
  display: string
}

export interface InsertInfo {
  at: number
  offset: number
}

export interface BlockInfo {
  id: string
  order: number
  top: number
  height: number
}

export interface BlockInjected {
  texts: Record<string, string>
  subscribe?: string
}

interface Storipress {
  clientID: string
}

export interface Injected {
  $storipress: Storipress
  $element: BlockInjected
}

const INJECTED_DEFAULT: BlockInjected = {
  texts: {},
}

export function useElement(): BlockInjected {
  return inject('$element', INJECTED_DEFAULT)
}

export function useBlockChild(path?: Ref<string[]>, dataType: 'texts' | 'images' = 'texts') {
  const element = useElement()
  const blockId = inject<string>('blockId')
  const portal = inject<string | null>('portal', null)

  const { frontData } = useStoripressCompatInject()
  const kind = computed(() => {
    if (!path) {
      return null
    }

    const kind = last(path.value || [])
    invariant(kind, 'must have a least one key for path')
    return kind
  })
  const staticBlock = computed(() => (path?.value[0].startsWith('b-@@') ? path?.value[0].replace('b-@@', '') : null))

  const data = computed(() => {
    if (portal) {
      return frontData.portal[portal]?.[kind.value as string]
    }
    if (staticBlock.value) {
      return frontData.staticBlocks[staticBlock.value]?.[dataType]?.[kind.value as string]
    }

    if (!path) {
      return null
    }

    const value = path.value.reduce((obj, key) => obj?.[key], frontData.blocks[dataType])
    return value
  })

  return {
    kind,
    element,
    blockId,
    portal,
    data,
  }
}
