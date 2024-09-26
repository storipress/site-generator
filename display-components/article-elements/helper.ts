import type { MaybeComputedRef } from '@vueuse/core'
import { useEventListener } from '@vueuse/core'

export function unwrapParagraph(input: string): string {
  if (!input) {
    return ''
  }

  return input.replace(/^<p>/, '').replace(/<\/p>$/, '')
}

interface TrackEvent {
  name: string

  target_id?: string
  data: Record<string, unknown>
}

export function useTrackLink(root: MaybeComputedRef<HTMLElement>, toEvent: (href: string) => TrackEvent | undefined) {
  const $tracker = useTracker()

  // https://www.ravelrumba.com/blog/tracking-links-with-javascript/
  useEventListener(root, 'click', async (event) => {
    const target = event.target as HTMLAnchorElement
    if (!target || target.tagName !== 'A') {
      return
    }

    const href = target.getAttribute('href')
    if (href) {
      const trackEvent = toEvent(href)
      if (!trackEvent) {
        return
      }
      event.preventDefault()

      await $tracker.track(trackEvent as any)
      window.location.href = target.href
    }
  })
}
