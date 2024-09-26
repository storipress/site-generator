import { freeze, original, produce } from 'immer'
import { merge, pickBy } from 'lodash-es'
import invariant from 'tiny-invariant'

export interface Breakpoint {
  xs: unknown
  md?: unknown
  lg?: unknown
}

export type BREAKPOINTS = keyof Breakpoint

// it must be cloneable for pass across iframe
export const STYLE_TREE_FRAGMENT = '@@jraft/STYLE_TREE_FRAGMENT'

// eslint-disable-next-line ts/no-redeclare
export const BREAKPOINTS = ['xs', 'md', 'lg'] as (keyof Breakpoint)[]

export interface StyleTreeMeta {
  dirty: Record<string, BREAKPOINTS>
}

export interface StyleTree {
  name: string | typeof STYLE_TREE_FRAGMENT
  styles: Record<string, Breakpoint>
  children: Record<string, StyleTree>
  meta?: StyleTreeMeta
}

export function createStyleTree(name: string = STYLE_TREE_FRAGMENT): StyleTree {
  return {
    name,
    styles: {},
    children: {},
  }
}

export function filterChildren(tree: StyleTree, predictor: (key: string) => boolean): StyleTree {
  return produce(tree, (draft) => {
    draft.children = pickBy(draft.children, (_, key) => predictor(key))
  })
}

export function assertStyleTree(tree: StyleTree, root?: string): StyleTree {
  if (!tree || root === '' || (root && tree.name !== root)) {
    return freeze(createStyleTree(root || STYLE_TREE_FRAGMENT))
  }
  return produce(tree, (draft) => {
    ensureStyleTreeFormat(draft)
  })
}

function ensureStyleTreeFormat(tree: StyleTree) {
  if (typeof tree.styles !== 'object' || Array.isArray(tree.styles)) {
    tree.styles = {}
  }

  if (typeof tree.children !== 'object' || Array.isArray(tree.children)) {
    tree.children = {}
  }

  for (const subtree of Object.values(tree.children)) {
    ensureStyleTreeFormat(subtree)
  }
}

export function ensureNode(root: StyleTree | undefined, path: readonly string[]): StyleTree {
  if (path.length === 0) {
    invariant(root)
    return root
  }

  if (!root) {
    root = {
      name: path[0],
      styles: {},
      children: {},
    }
  }

  if (root.name !== STYLE_TREE_FRAGMENT) {
    invariant(path[0] === root.name, 'unmatch path name')
    const [, ...rest] = path
    if (rest.length > 0) {
      root.children[rest[0]] = ensureNode(root.children[rest[0]], rest)
    }
    return root
  }
  root.children[path[0]] = ensureNode(root.children[path[0]], path)
  return root
}

export function ensureStyle(root: StyleTree, path: readonly string[]): Record<string, Breakpoint> {
  ensureNode(root, path)
  const node = getNode(root, path)
  return node.styles
}

export function getStyleWithDefault(root: StyleTree, p: readonly string[]): Record<string, Breakpoint> {
  const node = getOptionalNode(root, p) ?? createStyleTree()
  return node.styles
}

export function getNode(root: StyleTree, p: readonly string[]): StyleTree {
  const node = getOptionalNode(root, p)
  invariant(node, 'node not found')
  return node
}

export function getOptionalNode(root: StyleTree, p: readonly string[]): StyleTree | undefined {
  let node = root
  const path = [...p]

  if (path.length === 0) {
    return root
  }

  if (!root) {
    return
  }

  if (root.name === STYLE_TREE_FRAGMENT) {
    node = node.children[path[0]]
  }

  if (!node) {
    return
  }

  while (path.length > 0) {
    invariant(path[0] === node.name, 'unmatch path name')
    path.shift()
    if (path.length === 0) {
      break
    }
    node = node.children[path[0]]
    if (!node) {
      return node
    }
  }
  return node
}

export function mergeTree(base?: StyleTree, tree?: StyleTree): StyleTree {
  invariant(base || tree, 'both empty')
  if (!tree) {
    return base as StyleTree
  }
  if (!base) {
    return tree
  }
  const node = createStyleTree(base.name)
  node.styles = merge({}, base.styles, tree.styles)
  const children = [...new Set([...Object.keys(base.children), ...Object.keys(tree.children)])]
  for (const key of children) {
    node.children[key] = mergeTree(base.children[key], tree.children[key])
  }
  return node
}

export function detachTree(tree: StyleTree, path: readonly string[]): { left: StyleTree; right: StyleTree } {
  if (path.length === 0) {
    return { left: tree, right: createStyleTree() }
  }
  let right = createStyleTree()
  const p = path.slice(0, -1)
  const last = path[path.length - 1]
  const left = produce(tree, (draft) => {
    const node = getOptionalNode(draft, p)
    if (!node || !node.children[last]) {
      return
    }
    right = original(node.children[last]) as StyleTree
    Reflect.deleteProperty(node.children, last)
  })
  return { left, right }
}

export function scopeTree(scope: string, tree: StyleTree): StyleTree {
  return {
    name: scope,
    styles: {},
    children: {
      [tree.name]: tree,
    },
  }
}

export const renderHelpers = {
  STYLE_TREE_FRAGMENT,

  useDeepSelector: false,

  ensureSelector(maybeSelector: string): string {
    if (this.hasElementSelector(maybeSelector)) {
      return this.renderElementSelector(maybeSelector)
    }
    return `.${maybeSelector}`
  },

  hasElementSelector(selector: string): boolean {
    return selector.startsWith('&')
  },

  renderElementSelector(selector: string): string {
    return this.useDeepSelector ? selector.replace('&', '&::v-deep') : selector
  },
}

export function insertToTree(
  tree: StyleTree,
  path: readonly string[],
  data: Record<string, unknown>,
  breakpoint: keyof Breakpoint = 'xs',
  noOverride = false,
): StyleTree {
  const style = ensureStyle(tree, path)
  const normalized = normalizeStyles(data, breakpoint)
  insertStyles(style, normalized, noOverride)
  return tree
}

export function insertToTreeWithCascadeDown(
  tree: StyleTree,
  path: readonly string[],
  raw: Record<string, unknown>,
  breakpoint: keyof Breakpoint = 'xs',
  noOverride = false,
): StyleTree {
  ensureNode(tree, path)
  const node = getNode(tree, path)
  const { styles, meta } = node
  const { styles: normalized, meta: newMeta } = cascadeDownStyles({ raw, meta, breakpoint })
  insertStyles(styles, normalized, noOverride)
  node.meta = newMeta
  return tree
}

export function insertStyles(
  styles: Record<string, Breakpoint>,
  newStyles: Record<string, Breakpoint>,
  noOverride = false,
): Record<string, Breakpoint> {
  for (const [key, value] of Object.entries(newStyles)) {
    for (const breakpoint of BREAKPOINTS) {
      // null means inherit/unset
      if (styles[key]?.[breakpoint] === null || value[breakpoint] === undefined) {
        continue
      }
      styles[key] ??= {} as any

      if (styles[key][breakpoint] != null && value[breakpoint] === null) {
        continue
      }

      if (styles[key][breakpoint] != null && noOverride) {
        continue
      }

      styles[key][breakpoint] = value[breakpoint]
    }
  }
  return styles
}

const CASCADE_DOWN: Record<BREAKPOINTS, BREAKPOINTS[]> = {
  lg: ['lg', 'md', 'xs'],
  md: ['md', 'xs'],
  xs: ['xs'],
}
interface CascadeDownInput {
  raw: Record<string, unknown>
  meta?: StyleTreeMeta
  breakpoint?: BREAKPOINTS
}
interface CascadeDownReturn {
  meta: StyleTreeMeta
  styles: Record<string, Breakpoint>
}

export function cascadeDownStyles({ raw, meta, breakpoint = 'xs' }: CascadeDownInput): CascadeDownReturn {
  const styles = normalizeStyles(raw, breakpoint)
  const { dirty = {} } = meta ?? {}
  for (const [key, style] of Object.entries(styles)) {
    const d = dirty[key] ?? 'lg'
    if (d !== breakpoint && CASCADE_DOWN[breakpoint].includes(d)) {
      continue
    }
    for (const cascade of CASCADE_DOWN[breakpoint]) {
      style[cascade] = style[breakpoint]
    }
    dirty[key] = breakpoint
  }

  return { meta: { dirty }, styles }
}

export function normalizeStyles(
  original: Record<string, unknown>,
  breakpoint: keyof Breakpoint = 'xs',
): Record<string, Breakpoint> {
  const res: Record<string, Breakpoint> = {}

  for (const key of Object.keys(original)) {
    res[key] = normalizeStyle(original[key], breakpoint)
  }
  return res
}

export function normalizeStyle(data: unknown, breakpoint: keyof Breakpoint = 'xs'): Breakpoint {
  if (data && typeof data === 'object') {
    return data as Breakpoint
  }
  return { [breakpoint]: data } as Partial<Breakpoint> as Breakpoint
}

export function pluckBreakpoint(
  styles: Record<string, Breakpoint>,
  breakpoint: keyof Breakpoint,
): Record<string, unknown> {
  const res: Record<string, unknown> = {}
  for (const key of Object.keys(styles)) {
    res[key] = styles[key][breakpoint] ?? (breakpoint === 'lg' ? styles[key].md : undefined) ?? styles[key].xs
  }
  return res
}
