const DEFAULT_ELEMENTS = {
  dropcap: 'none',
  blockquote: 'regular',
}

export function attachDefaultArticleElements(
  elements: Record<string, string | null> = {},
): Record<string, string | null> {
  return {
    ...DEFAULT_ELEMENTS,
    ...elements,
    // FIXME: disable subscribe for now
    subscribe: null,
  }
}
