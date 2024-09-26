import type { EventBusKey } from '@vueuse/core'

export const DISQUS: EventBusKey<boolean | undefined> = Symbol('disqus-bus')
export const DISQUS_COUNT: EventBusKey<number | false> = Symbol('disqus-count-bus')
