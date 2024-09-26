import { createVitePlugin } from 'unplugin'
import MagicString from 'magic-string'
import { hash } from 'ohash'
import { kebabCase, pascalCase } from 'scule'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import type { SFCParseResult } from 'vue/compiler-sfc'
import { parse } from 'vue/compiler-sfc'
import { type AttributeNode, type DirectiveNode, type ElementNode, NodeTypes, type RootNode } from '@vue/compiler-core'
import invariant from 'tiny-invariant'
import { P, match } from 'ts-pattern'

export type FilterPattern = Array<string | RegExp> | string | RegExp | null

function toArray<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : [x]
}

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

enum SkipType {
  SKIP_SELF_AND_CHILDREN,
  SKIP_SELF,
}

export interface KeyedComponentOptions {
  /**
   * match component to process
   */
  components?: (string | RegExp)[]

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

  isSkip?: (tag: string) => SkipType | undefined | null
}

const valuedAttributeRE =
  // eslint-disable-next-line regexp/prefer-w, regexp/no-dupe-characters-character-class, regexp/no-useless-character-class, regexp/no-super-linear-backtracking, regexp/no-obscure-range, regexp/use-ignore-case, regexp/no-useless-flag
  /((?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:!%-.~<]+)(?:=(?:["]([^"]*)["]|[']([^']*)[']|[{]((?:[`(][^`)]*[`)]|[^}])+)[}]))?/gms

const CONTEXT_PROVIDER_COMPONENT = 'LoopKeyed'
const MANUAL_KEY_ATTRIBUTE = 'data-keyed'

/**
 * Keyed selected component + auto key v-for
 *
 * 1. key selected component
 *
 * For example we select `SelectedComponent`, this plugin will convert the following code
 * ```vue
 * <template>
 *  <SelectedComponent />
 * </template>
 * ```
 *
 * to:
 *
 * ```vue
 * <template>
 *  <SelectedComponent auto-key="$ak$....." />
 * </template>
 * ```
 *
 * And if it has v-for directive, to make sure key is correct, it will convert the following
 *
 * ```vue
 * <template>
 *  <SelectedComponent v-for="i of 3" :key="i" />
 * </template>
 * ```
 *
 * to:
 *
 * ```vue
 * <template>
 *  <SelectedComponent auto-key="$ak$....." v-for="i of 3" :key="i" />
 * </template>
 * ```
 *
 * 2. auto key v-for
 *
 * For example we select `SelectedComponent`, this plugin will convert the following code
 * ```vue
 * <template>
 *  <SelectedComponent v-for="i of 3" :key="i" />
 * </template>
 * ```
 *
 * to:
 *
 * ```vue
 * <template>
 *  <SelectedComponent :auto-key="`$ak$.....${i}`" v-for="i of 3" :key="i" />
 * </template>
 * ```
 *
 * The `i` part will be the dynamic key value
 *
 * 3. auto key v-for with context provider
 *
 * To support this kind of case, we will need more context for auto key
 *
 * ```vue
 * <!-- main.vue -->
 * <template>
 *  <ChildComponent v-for="i of 3" :key="i" />
 * </template>
 *
 * <!-- ChildComponent.vue -->
 * <template>
 *   <SelectedComponent />
 * </template>
 * ```
 *
 * To make sure key is correct, we will convert the following
 *
 * ```vue
 * <template>
 *  <ChildComponent v-for="i of 3" :key="i" />
 * </template>
 * ```
 *
 * to:
 *
 * ```vue
 * <template>
 *  <LoopKeyed :as="resolveComponent('ChildComponent')" :auto-key="`$ak$....${i}`" v-for="i of 3" :key="i" />
 * </template>
 * ```
 *
 * Where the `LoopKeyed` is the context provider. This will provide the auto key into Vue's context with `provide` and allow the child component to grab it
 *
 * 4. Manually ask for auto key
 *
 * Some component may contain article block, and be reused without v-for, like gq-1 (used in gen-zine)
 *
 * To make sure key is correct, we allow mark a component with `data-keyed`
 *
 * ```vue
 * <template>
 *  <ArticleTile data-keyed />
 * </template>
 * ```
 *
 * And it will be converted to:
 *
 * ```vue
 * <template>
 *  <LoopKeyed :as="resolveComponent('ArticleTile')" auto-key="`$ak$....`" data-keyed />
 * </template>
 *
 */
export const keyedComponent = createVitePlugin((options: KeyedComponentOptions = {}) => {
  const idFilter = createFilter(options.include || [/\.vue$/], options.exclude || [])
  const components = options.components || []

  function isTarget(tag: string) {
    const kebab = kebabCase(tag)
    const pascal = pascalCase(tag)
    const kebabMatch = components.some((c) => {
      if (typeof c === 'string') {
        return c === kebab
      }
      return c.test(kebab)
    })
    const pascalMatch = components.some((c) => {
      if (typeof c === 'string') {
        return c === pascal
      }
      return c.test(pascal)
    })
    return kebabMatch || pascalMatch
  }

  return {
    name: 'keyed-component',
    enforce: 'pre',
    transformInclude: idFilter,
    transform(rawCode, id) {
      const code = new MagicString(rawCode)
      const parsedResult: SFCParseResult = parse(rawCode)

      if (parsedResult.errors.length > 0) {
        return
      }

      const { descriptor } = parsedResult

      if (!descriptor.template) {
        return
      }

      let count = 0

      invariant(descriptor.template.ast, 'no ast do traverse')
      traverse(
        descriptor.template.ast,
        (node) => {
          const isRequestedKey = node.props.some((prop): prop is AttributeNode =>
            isAttribute(prop, MANUAL_KEY_ATTRIBUTE),
          )
          const vFor = node.props.find((prop): prop is DirectiveNode => isDirective(prop, 'for'))
          const dynamicKey = vFor
            ? node.props.find((prop): prop is DirectiveNode =>
                // `:key="foo"` will be normalize to `v-bind:key="foo"`, thus, we are looking for `bind` directive here
                isDirective(prop, 'bind', 'key'),
              )
            : null

          // Only component is possible to be our target
          if (node.tagType === 1 /* component */ && isTarget(node.tag)) {
            addKey({
              tag: node.tag,
              dynamicKeyContent: extractExpression(dynamicKey),
              start: node.loc.start.offset + 1,
            })
          } else if (vFor || isRequestedKey) {
            // TODO: check if we need to key the `slot` (`tagType` === 2)
            if (
              node.tagType === 0 /* plain element */ ||
              node.tagType === 1 /* component */ ||
              node.tagType === 3 /* template */
            ) {
              warpLoop({
                tag: node.tag,
                isComponent: node.tagType === 1 /* component */,
                isSelfClosing: node.isSelfClosing ?? false,
                dynamicKeyContent: extractExpression(dynamicKey),
                start: node.loc.start.offset + 1,
                end: node.loc.end.offset - 1,
              })
            }
          }
        },
        {
          isSkip: options.isSkip,
        },
      )

      const res = code.toString()
      const { errors } = parse(res)
      invariant(errors.length === 0)
      return {
        code: res,
        map: code.generateMap({ hires: true }),
      }

      /**
       * wrap component with context provider
       */
      function warpLoop({
        tag,
        isComponent,
        isSelfClosing,
        dynamicKeyContent,
        start,
        end,
      }: {
        tag: string
        isComponent: boolean
        isSelfClosing: boolean
        dynamicKeyContent: string | null | undefined
        start: number
        end: number
      }) {
        const dynamicKeyValue = dynamicKeyContent || ''

        const key = requestKey()

        const dynamicKeyValueCode = dynamicKeyValue ? `--\${${dynamicKeyValue}}` : ''
        const startTagEnd = start + tag.length
        const autoKeyProp = createKey(key, dynamicKeyValueCode)
        const asProp = isComponent ? `:as="resolveComponent('${tag}')"` : `as="${tag}"`

        code.overwrite(start, startTagEnd, `${CONTEXT_PROVIDER_COMPONENT} ${asProp} ${autoKeyProp}`)
        if (!isSelfClosing) {
          code.overwrite(end - tag.length, end, CONTEXT_PROVIDER_COMPONENT)
        }
      }

      /**
       * add key to selected component
       */
      function addKey({
        tag,
        dynamicKeyContent,
        start,
      }: {
        tag: string
        dynamicKeyContent: string | null | undefined
        start: number
      }) {
        const dynamicKeyValue = dynamicKeyContent || ''

        const key = requestKey()

        const dynamicKeyValueCode = dynamicKeyValue ? `--\${${dynamicKeyValue}}` : ''
        const startIdx = start + tag.length
        const autoKeyProp = createKey(key, dynamicKeyValueCode)
        code.appendRight(startIdx, autoKeyProp)
      }

      function requestKey() {
        const key = hash(`${id}-${count}`)
        count += 1
        return key
      }
    },
  }
})

// In Vue compiler, the parsing step is two steps
// 1. parse everything into ElementNode
// 2. transform special ElementNode like `v-for` into ForNode
// We only use the 1 phase parsing, thus, we can safely assume there is no ForNode in the AST
function traverse(
  node: ElementNode | RootNode,
  fn: (node: ElementNode) => void,
  { isSkip = () => null }: Pick<KeyedComponentOptions, 'isSkip'>,
) {
  const skip = node.type === NodeTypes.ROOT ? null : isSkip(node.tag)
  if (skip === SkipType.SKIP_SELF_AND_CHILDREN) {
    return
  }
  if (node.type !== NodeTypes.ROOT && skip !== SkipType.SKIP_SELF) {
    fn(node)
  }
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 1 /* element */) {
        traverse(child, fn, { isSkip })
      }
    }
  }
}

function isDirective(node: AttributeNode | DirectiveNode, name?: string, arg?: string): node is DirectiveNode {
  if (node.type !== 7 /* directive */) {
    return false
  }

  if (name && node.name !== name) {
    return false
  }

  if (arg) {
    if (!node.arg) {
      return false
    }

    if (node.arg.type !== 4 /* SIMPLE_EXPRESSION */) {
      return false
    }

    if (!node.arg.isStatic) {
      return false
    }

    if (node.arg.content !== arg) {
      return false
    }
  }

  return true
}

function isAttribute(node: AttributeNode | DirectiveNode, name?: string): node is AttributeNode {
  if (node.type !== 6 /* ATTRIBUTE */) {
    return false
  }

  if (name && node.name !== name) {
    return false
  }

  return true
}

function createKey(key: string, dynamicKeyValueCode: string) {
  if (!dynamicKeyValueCode) {
    return ` auto-key="$ak$${key}" `
  }
  return ` :auto-key="\`$ak$${key}${dynamicKeyValueCode}\`" `
}

function extractExpression(node: DirectiveNode | null | undefined): string | null {
  if (!node) {
    return null
  }
  if (!node.exp) {
    return null
  }
  if (node.exp?.type === 4 /* SIMPLE_EXPRESSION */) {
    return node.exp.content
  }

  const m = node.loc.source.match(valuedAttributeRE)
  if (!m) {
    return null
  }

  return m[2]
}

export default defineNuxtModule({
  meta: {
    name: '@storipress/keyed-component',
  },
  setup() {
    addVitePlugin(
      keyedComponent({
        components: ['ArticleBlock'],
        include: [/generated\/.*\.vue$/],
        isSkip(tag) {
          return (
            match(tag)
              // these are known that may cause issue if apply with LoopKeyed
              .with(P.union('Site', 'DeskList', 'PageList'), () => SkipType.SKIP_SELF_AND_CHILDREN)
              // these should not need key
              .with(P.union('TextElement', 'TextInput'), () => SkipType.SKIP_SELF)
              .otherwise(() => null)
          )
        },
      }),
    )
  },
})
