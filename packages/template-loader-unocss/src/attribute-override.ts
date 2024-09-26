import { extractBlockId } from './block-id'
import type { Breakpoint } from './convert-attribute'
import { articleConverter, frontPageConverter, isPathShouldHoist, pathToSelector } from './path-converter'
import type { AttributeContext } from './transform'
import type { StyleTree } from './types'

interface HoistConfig {
  hoistAs: string
  keys: Set<string>
}
const SHOULD_HOIST = new Map<string, HoistConfig>([
  [
    'SpacingProvider',
    {
      hoistAs: '.spacing',
      keys: new Set(['width', 'maxWidth', 'minWidth', 'max', 'min']),
    },
  ],
])

interface TagAliasConfig {
  type?: 'front' | 'article'
  aliases: string[]
}

const TAG_ALIASES = new Map<string, TagAliasConfig>([
  [
    'Paragraph',
    {
      aliases: [':deep(.base-text)'],
    },
  ],
  [
    'Authors',
    {
      type: 'article',
      aliases: [':deep(.author-name)'],
    },
  ],
])

interface CreateAttributeOverrideInput {
  root: string
  map: Record<string, Record<string, Record<string, Breakpoint>>> | StyleTree
  get?: any
}

const converters = {
  front: frontPageConverter,
  article: articleConverter,
}

const ALLOW_NO_KIND = new Set(['Block', 'HeroBlock', 'FooterBlock', 'ColorArea', ...SHOULD_HOIST.keys()])

/**
 * create plugin to do override styles to merge user defined styles
 * Make this a plugin to make it easier to test
 * @param root
 * @param map
 * @returns
 */
export function createAttributeOverride({
  root,
  map,
  get = getStyles,
}: CreateAttributeOverrideInput): (ctx: AttributeContext) => void {
  return (ctx) => {
    const res = extractBlockId(ctx.id, root)

    if (res?.type === 'front' && !ctx.kind && !ALLOW_NO_KIND.has(ctx.tag)) {
      return
    }

    if (res) {
      const { type, blockId } = res
      const convert = converters[type]
      const path = convert({
        tag: ctx.tag,
        id: blockId,
        kind: ctx.kind,
      })
      if (path) {
        const override = get(map, path)?.[ctx.key]
        if (override) {
          ctx.value = {
            ...ctx.value,
            ...override,
          }
        }

        if (isPathShouldHoist(path)) {
          const scopedHoistAs = ctx.scopedHoistAs ? [...ctx.scopedHoistAs] : []
          ctx.scopedHoistAs = [...scopedHoistAs, pathToSelector(path)]
        }

        const tagAliasConfig = TAG_ALIASES.get(ctx.tag)
        if (tagAliasConfig && (!tagAliasConfig.type || tagAliasConfig.type === type)) {
          const scopedHoistAs = ctx.scopedHoistAs ? [...ctx.scopedHoistAs] : []
          ctx.scopedHoistAs = [...scopedHoistAs, ...tagAliasConfig.aliases]
        }
      }
    }

    const hoistConfig = SHOULD_HOIST.get(ctx.tag)
    if (hoistConfig && hoistConfig.keys.has(ctx.key)) {
      ctx.hoistAs = hoistConfig.hoistAs
    }
  }
}

function getStyles(obj: StyleTree, path: string[]): any {
  const lastKey = path[path.length - 1]
  let res: any = obj
  for (const key of path) {
    if (!res[key]) return
    if (res[lastKey]) return res[lastKey].styles

    res = res[key] ? res[key].children : {}
  }
}
