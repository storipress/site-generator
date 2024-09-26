export interface StyleTree {
  // element id -> used as class name
  name: string
  // style data for the element
  styles: Record<string, Breakpoint>
  // nested elements
  children: Record<string, StyleTree>
  // meta data
  meta?: StyleTreeMeta
}

export interface StyleTreeMeta {
  // dirty flag of each style
  // used in cascade down
  dirty: Record<string, keyof Breakpoint>
}

export interface Breakpoint {
  xs: unknown
  md?: unknown
  lg?: unknown
}
