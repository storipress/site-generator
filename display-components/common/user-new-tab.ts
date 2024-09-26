// detect user try to open in new tab
// from: https://github.com/segmentio/analytics-next/blob/4da83396e47b94421b2ede5253654e73c9109db1/packages/browser/src/core/auto-track.ts#L6
export function userNewTab(event: Event): boolean {
  if (!event) {
    return false
  }

  const typedEvent = event as Event & {
    ctrlKey: boolean
    shiftKey: boolean
    metaKey: boolean
    button: number
  }
  if (
    typedEvent.ctrlKey ||
    typedEvent.shiftKey ||
    typedEvent.metaKey ||
    (typedEvent.button && typedEvent.button === 1)
  ) {
    return true
  }
  return false
}
