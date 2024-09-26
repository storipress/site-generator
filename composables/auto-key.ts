import type { InjectionKey } from 'vue'

interface AutoKeyProp {
  autoKey?: string
}

const AUTO_KEY: InjectionKey<string[]> = Symbol('auto-key')

export function useAutoKey(props: AutoKeyProp) {
  if (!props.autoKey) {
    return
  }

  const stack = inject(AUTO_KEY, [])
  const newStack = [...stack, props.autoKey]
  provide(AUTO_KEY, newStack)

  return newStack.join('.')
}
