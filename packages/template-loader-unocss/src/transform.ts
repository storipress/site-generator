import type { SourceCodeTransformer } from '@unocss/core'
import { toArray } from '@unocss/core'
import type { HookCallback, Hookable, NestedHooks } from 'hookable'
import { createHooks } from 'hookable'
import { id as css, html } from 'proper-tags'
import { camelCase, kebabCase } from 'scule'
import type { Breakpoint } from './convert-attribute'
import { attributeNames, booleanAttributes, convertAttributeToStyle, normalizeAttribute } from './convert-attribute'

export type FilterPattern = Array<string | RegExp> | string | RegExp | null

function createFilter(include: FilterPattern, exclude: FilterPattern): (id: string) => boolean {
  const includePattern = toArray(include || [])
  const excludePattern = toArray(exclude || [])
  return (id: string) => {
    if (excludePattern.some((p) => id.match(p))) {
      return false
    }
    return includePattern.some((p) => id.match(p))
  }
}

export interface HookContext {
  id: string
  tag: string
  kind?: string
  userContext?: Record<string, any>
}

export interface AttributeContext extends HookContext {
  key: string
  value: Breakpoint
  hoistAs?: string
  scopedHoistAs?: string[]
}

export type ExtractKindContext = HookContext

export interface TransformerHooks extends Record<string, HookCallback> {
  'transformer:kind': (ctx: ExtractKindContext) => Promise<void> | void
  'transformer:attribute': (ctx: AttributeContext) => Promise<void> | void
}

export interface TransformerAttributifyJsxOptions {
  /**
   * Regex of modules to be included from processing
   * @default [/\.[jt]sx$/, /\.mdx$/]
   */
  include?: FilterPattern

  /**
   * Regex of modules to exclude from processing
   *
   * @default []
   */
  exclude?: FilterPattern

  hooks?: NestedHooks<TransformerHooks>
}

// eslint-disable-next-line regexp/no-useless-escape
const noAttributeElementRE = /(<\w[\w:\.$-]*)>/g
const elementRE =
  // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/prefer-character-class, regexp/no-dupe-disjunctions, regexp/no-useless-character-class, regexp/no-useless-escape
  /(<\w[\w:\.$-]*\s)((?:'[^>]*?'|"[^>]*?"|`(?:[^>]|[\S])*?`|\{(?:[^>]|[\S])*?\}|[^>]+=\s*".+"[^>]*?|[^>]*?)*)/g
// const attributeRE = /([a-zA-Z()#][\[?a-zA-Z0-9-_:()#%\]?]*)(?:\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+))?/g
const valuedAttributeRE =
  // eslint-disable-next-line regexp/prefer-w, regexp/use-ignore-case, regexp/no-super-linear-backtracking, regexp/no-dupe-characters-character-class, regexp/no-obscure-range, regexp/no-useless-character-class, regexp/no-useless-non-capturing-group, regexp/no-useless-flag
  /((?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:!%-.~<]+)(?:=(?:["]([^"]*)["]|[']([^']*)[']|[{]((?:[`(](?:[^`)]*)[`)]|[^}])+)[}]))?/gms

export default function transformerAttributifyJsx(
  options: TransformerAttributifyJsxOptions = {},
): SourceCodeTransformer {
  const { hooks: userHooks = {} } = options
  const hooks = createHooks<TransformerHooks>()
  hooks.addHooks(userHooks)

  const idFilter = createFilter(options.include || [/\.vue$/], options.exclude || [])

  return {
    name: '@unocss/transformer-storipress',
    enforce: 'pre',
    idFilter,
    async transform(code, id) {
      const hoistMap = new Map<string, Set<string>>()
      const scopedHoistMap = new Map<string, Set<string>>()

      for (const item of Array.from(code.original.matchAll(elementRE))) {
        let attributifyPart = item[2]
        // Here we find all the attributes, and we can extract the `kind` here
        // Then we can use `kind` to find the correct value from theme and replace other attributes with the correct value
        // For example, if we have `kind="foo"` and `fontSize="16"`, but in theme we have `foo.fontSize: 20`, then we can replace `fontSize="16"` with `font-[20px]`
        // To get the theme, we will need to extract the block id from filename, which is a little tricky
        // We didn't implement the theme extraction here, but we created a hook for it
        const hadValuedAttributes = Array.from(attributifyPart.matchAll(valuedAttributeRE))
        const hadAttributes = new Set(
          hadValuedAttributes.map((valuedAttribute) => camelCase(valuedAttribute[1]).replace(':', '')),
        )
        const valuedAttributes = getValuedAttributes(hadValuedAttributes)
        const tagName = item[1].slice(1).trim()
        const kind = extractKind({ valuedAttributes, hooks, tagName, id })

        const classAttr = valuedAttributes.find((attr) => attr[1] === 'class')
        const originClassValue = classAttr?.[2] || ''
        let classValue = originClassValue

        for (const m of valuedAttributes) {
          const normalizedPair = normalizeAttribute(m[1], m[2])
          if (normalizedPair) {
            const [normalizedKey, normalizedValue] = normalizedPair
            const ctx: AttributeContext = {
              id,
              tag: tagName,
              kind,
              key: normalizedKey,
              value: normalizedValue,
            }
            await hooks.callHook('transformer:attribute', ctx)
            const { xs, md, lg } = ctx.value
            const hasValue = [xs, md, lg].some((val) => val === 0 || !!val)
            if (!hasValue) {
              continue
            }

            const converted = convertAttributeToStyle(ctx.key, ctx.value)
            if (converted) {
              if (ctx.hoistAs) {
                addToMap(hoistMap, ctx.hoistAs, converted)
              } else if (ctx.scopedHoistAs?.length) {
                addToMap(scopedHoistMap, ctx.scopedHoistAs, converted)
              } else {
                classValue += ` ${converted}`
              }

              // remove the attribute
              if (hadAttributes.has(camelCase(ctx.key))) {
                const startIndex = (item.index || 0) + item[1].length + (m.index || 0)
                const endIndex = startIndex + m[0].length
                code.overwrite(startIndex, endIndex, ' '.repeat(m[0].length))
              }
            }
          }
          attributifyPart = attributifyPart.replace(m[0], ' '.repeat(m[0].length))
        }
        // replace class attribute with new value
        classValue = classValue.trim()
        if (!classValue) {
          continue
        }
        if (classValue !== originClassValue) {
          if (classAttr) {
            const tag = item[1]
            const startIdx = (item.index || 0) + (classAttr.index || 0) + tag.length
            const endIdx = startIdx + classAttr[0].length
            code.overwrite(startIdx, endIdx, `class="${classValue}"`)
          } else {
            const tag = item[1]
            const startIdx = (item.index || 0) + tag.length
            const newClass = ` class="${classValue}" `
            code.appendRight(startIdx, newClass)
          }
        }
      }

      // Handle not self-close tag
      // Like `<ArticleBlock></ArticleBlock>`
      for (const item of Array.from(code.original.matchAll(noAttributeElementRE))) {
        let classValue = ''
        const tagName = item[1].slice(1).trim()
        const valuedAttributes = getValuedAttributes([])
        for (const m of valuedAttributes) {
          const normalizedPair = normalizeAttribute(m[1], m[2])
          if (normalizedPair) {
            const [normalizedKey, normalizedValue] = normalizedPair
            const ctx: AttributeContext = {
              id,
              tag: tagName,
              key: normalizedKey,
              value: normalizedValue,
            }
            await hooks.callHook('transformer:attribute', ctx)
            const { xs, md, lg } = ctx.value
            const hasValue = [xs, md, lg].some((val) => val === 0 || !!val)
            if (!hasValue) {
              continue
            }

            const converted = convertAttributeToStyle(ctx.key, ctx.value)
            if (converted) {
              if (ctx.hoistAs) {
                addToMap(hoistMap, ctx.hoistAs, converted)
              } else if (ctx.scopedHoistAs?.length) {
                addToMap(scopedHoistMap, ctx.scopedHoistAs, converted)
              } else {
                classValue += ` ${converted}`
              }
            }
          }
        }
        // replace class attribute with new value
        classValue = classValue.trim()
        if (!classValue) {
          continue
        }
        const tag = item[1]
        const startIdx = (item.index || 0) + tag.length
        const newClass = ` class="${classValue}" `
        code.appendRight(startIdx, newClass)
      }

      stringifyHoistMap(hoistMap, code)
      stringifyHoistMap(scopedHoistMap, code, 'scoped')
    },
  }
}
interface ExtractKindInput {
  valuedAttributes: RegExpMatchArray[]
  hooks: Hookable<TransformerHooks>
  tagName: string
  id: string
}

interface MagicStringLike {
  append: (str: string) => void
}

function stringifyHoistMap(hoistMap: Map<string, Set<string>>, code: MagicStringLike, attr = '') {
  const styles = Array.from(hoistMap.entries())
    .map(([id, styles]) => {
      return css`
        ${id} {
          @apply ${Array.from(styles).join(' ')};
        }
      `
    })
    .join('\n')
    .trim()

  if (styles) {
    code.append(html`
      <style lang="postcss" ${attr}>
        ${styles}
      </style>
    `)
  }
}

function extractKind({ valuedAttributes, hooks, tagName, id }: ExtractKindInput) {
  const kindAttr = valuedAttributes.find((attr) => attr[1] === 'kind')
  const kind = kindAttr?.[2]
  const ctx: ExtractKindContext = {
    id,
    tag: tagName,
    kind,
  }
  if (kind) {
    hooks.callHook('transformer:kind', ctx)
  }
  return ctx.kind
}

function addToMap(map: Map<string, Set<string>>, keys: string | string[], value: string) {
  const addKey = (key: string) => {
    const set = map.get(key) || new Set()
    set.add(value)
    map.set(key, set)
  }
  if (Array.isArray(keys)) {
    keys.forEach(addKey)
  } else {
    addKey(keys)
  }
}

const supportAttributes = [...attributeNames, ...booleanAttributes]
export function getValuedAttributes(hadValuedAttributes: RegExpMatchArray[]) {
  const defaultValuedAttributes = supportAttributes.map((attribute) => {
    const defaultValue = booleanAttributes.has(attribute) ? 'false' : ''
    return [`${attribute}="${defaultValue || ''}"`, attribute, defaultValue] as [string, string, string | undefined]
  })

  const otherValuedAttributes = hadValuedAttributes.filter((attr) => attr[1] === 'class' || attr[1] === 'kind')

  return [
    ...(defaultValuedAttributes.map((valuedAttribute) => {
      const attribute = valuedAttribute[1]
      const attributeRegExp = new RegExp(
        `^(:|v-bind:)*${camelCase(attribute)}|^(:|v-bind:)*${kebabCase(attribute)}`,
        'i',
      )
      const hadValuedAttribute = hadValuedAttributes.find((hadAttribute) => attributeRegExp.test(hadAttribute[1]))
      return hadValuedAttribute || valuedAttribute
    }) as RegExpMatchArray[]),
    ...otherValuedAttributes,
  ]
}
