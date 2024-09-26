const ARRAY_PROPS = new Set(['length', 'constructor', 'map'])
export function trackUsage<T>(
  object: T,
  { parentKey, usedProperties = new Set() }: { parentKey?: string; usedProperties?: Set<string> } = {},
): { proxy: T; usedProperties: Set<string> } {
  if (typeof object !== 'object' || object === null) {
    return { proxy: object, usedProperties }
  }

  function track(key: string | symbol) {
    if (typeof key === 'symbol') {
      return
    }

    if (Array.isArray(object)) {
      if (ARRAY_PROPS.has(key)) {
        return
      }

      if (/\d+/.test(key)) {
        key = '[]'
      }
    }

    const currentKey = parentKey ? `${parentKey}.${key}` : key
    if (parentKey && usedProperties.has(parentKey)) {
      usedProperties.delete(parentKey)
    }
    usedProperties.add(currentKey)
  }

  const proxy = new Proxy(object, {
    get(target, property, receiver) {
      track(property)
      const res = Reflect.get(target, property, receiver)
      if (typeof res === 'object' && res && typeof property !== 'symbol') {
        const maybeArrayKey = Array.isArray(object) && /\d+/.test(property) ? '[]' : property
        const currentKey = parentKey ? `${parentKey}.${maybeArrayKey}` : maybeArrayKey
        return trackUsage(res, { parentKey: currentKey, usedProperties }).proxy
      }
      return res
    },
    set(target, property, value, receiver) {
      track(property)
      return Reflect.set(target, property, value, receiver)
    },
    apply() {
      notImpl()
    },
  })

  return {
    proxy,
    usedProperties,
  }
}

function notImpl() {
  throw new Error('Not implemented')
}
