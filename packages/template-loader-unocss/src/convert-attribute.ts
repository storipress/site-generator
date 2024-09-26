import json5 from 'json5'
import { camelCase, kebabCase } from 'scule'

export const booleanAttributes = new Set(['bold', 'underline', 'uppercase', 'lowercase'])
export const attributeNames = [
  'fontSize',
  'fontFamily',
  'align',
  'color',
  'lineHeight',
  'hoverColor',
  'width',
  'min',
  'max',
  'backgroundColor',
]
const attributes = new Set([...attributeNames, ...attributeNames.map((name) => kebabCase(name))])

const renamedAttributeMap: Record<string, string> = {
  max: 'maxWidth',
  min: 'minWidth',
}

interface ValueTailwindItem {
  type: 'value'
  tw: string
  dynamic?: boolean
  prefix?: string
  unit?: string
  suffix?: string
}

interface BoolTailwindItem {
  type: 'bool'
  to: string
}

type TailwindItem = ValueTailwindItem | BoolTailwindItem

const attributeToTailwind: Record<string, TailwindItem> = {
  fontSize: {
    type: 'value',
    tw: 'text',
    dynamic: true,
    unit: 'px',
  },
  fontFamily: {
    type: 'value',
    tw: 'ff',
    dynamic: true,
  },
  align: {
    type: 'value',
    tw: 'text',
  },
  color: {
    type: 'value',
    tw: 'text',
    dynamic: true,
    prefix: '#',
  },
  lineHeight: {
    type: 'value',
    tw: 'leading',
    dynamic: true,
  },
  hoverColor: {
    type: 'value',
    tw: 'hover:text',
    dynamic: true,
    prefix: '#',
  },
  width: {
    type: 'value',
    tw: 'w',
    dynamic: true,
    unit: 'px',
  },
  minWidth: {
    type: 'value',
    tw: 'min-w',
    dynamic: true,
    unit: 'px',
  },
  maxWidth: {
    type: 'value',
    tw: 'max-w',
    dynamic: true,
    unit: 'px',
  },
  backgroundColor: {
    type: 'value',
    tw: 'bg',
    dynamic: true,
    prefix: '#',
  },
  bold: {
    type: 'bool',
    to: 'font-bold',
  },
  underline: {
    type: 'bool',
    to: 'underline',
  },
  uppercase: {
    type: 'bool',
    to: 'uppercase',
  },
  lowercase: {
    type: 'bool',
    to: 'lowercase',
  },
}

export interface Breakpoint {
  xs: string | boolean | number
  md?: string | boolean | number
  lg?: string | boolean | number
}

export function convertAttributeStringToStyle(n: string, v: string): string | null {
  const normalizedPair = normalizeAttribute(n, v)
  if (!normalizedPair) return null
  return convertAttributeToStyle(normalizedPair[0], normalizedPair[1])
}

export function convertAttributeToStyle(name: string, value: Breakpoint): string | null {
  const tailwindItem = attributeToTailwind[resolveAttributeName(name)]
  if (!tailwindItem) return null
  let res = ''
  if (value.xs) {
    res += ` ${expandTailwindValue(tailwindItem, value.xs)}`
  }
  if (value.md) {
    res += ` md:${expandTailwindValue(tailwindItem, value.md)}`
  }
  if (value.lg) {
    res += ` lg:${expandTailwindValue(tailwindItem, value.lg)}`
  }
  return res.trim()
}

function expandTailwindValue(item: TailwindItem, value: string | boolean | number): string {
  if (item.type === 'bool') {
    return value ? item.to : ''
  }
  let v = `${item.prefix || ''}${ensureUnit(value.toString().replaceAll(' ', '_'), item.unit)}${item.suffix || ''}`
  if (item.dynamic) {
    v = `[${v}]`
  }
  return `${item.tw}-${v}`
}

const UNITS = ['px', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax', '%']
const CALCULATIONS = ['calc']

function ensureUnit(value: string | number | boolean, unit?: string) {
  if (!unit || typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    if (UNITS.some((u) => value.endsWith(u)) || CALCULATIONS.some((u) => value.startsWith(u))) {
      return value
    }
    return `${value}${unit}`
  }

  return `${value}${unit}`
}

function resolveAttributeName(name: string): string {
  const camelCaseName = camelCase(name)
  return renamedAttributeMap[camelCaseName] || camelCaseName
}

export function normalizeAttribute(n: string, v: string): [string, Breakpoint] | null {
  if (n.startsWith(':')) {
    const key = n.slice(1)
    if (!isAttribute(key)) {
      return null
    }
    if (booleanAttributes.has(key)) {
      try {
        const val = json5.parse(v || 'true')
        return [camelCase(key), typeof val === 'boolean' ? { xs: val } : val]
      } catch {
        return null
      }
    }
    try {
      const val = json5.parse(v)
      return [camelCase(key), typeof val === 'object' && val ? val : { xs: val }]
    } catch {
      return null
    }
  }
  if (!isAttribute(n)) {
    return null
  }
  if (booleanAttributes.has(n)) {
    try {
      return [camelCase(n), { xs: json5.parse(v || 'true') }]
    } catch {
      return null
    }
  }
  return [camelCase(n), { xs: v }]
}

function isAttribute(name: string) {
  return attributes.has(name) || booleanAttributes.has(name)
}
