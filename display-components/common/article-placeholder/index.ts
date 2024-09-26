import { getImageDataUrl } from './liner-gradients'

export { getImageDataUrl } from './liner-gradients'

export interface DisplayArticlePlaceholder {
  __isEmpty: boolean
  title: string
  slug: string
  url: string
  featured: boolean
  blurb?: string | null
  desk: string
  deskUrl: string
  authors: unknown[]
  cover: { url: string; alt: string; caption: string; focus: { x: number; y: number } }
  headline: string
  headlineAlt: string
  headlineCaption: string
  headlineFocus: { x: number; y: number }
  time: Date
}

export type DisplayArticle = Omit<DisplayArticlePlaceholder, '__isEmpty'>

export function createEmptyArticle(name: string): DisplayArticlePlaceholder {
  const time = new Date()

  return {
    __isEmpty: true,
    desk: name,
    url: '#',
    deskUrl: `#`,
    slug: '',
    title: 'Your publication does not have enough articles to fill this block. Better get writing!',
    blurb: '',
    cover: { url: getImageDataUrl(), alt: '', caption: '', focus: { x: 0, y: 0 } },
    featured: false,
    time,
    headline: getImageDataUrl(),
    headlineAlt: '',
    headlineCaption: '',
    headlineFocus: { x: 0, y: 0 },
    authors: [],
  }
}

export function isPlaceholder(article: DisplayArticle): article is DisplayArticlePlaceholder {
  return (article as DisplayArticlePlaceholder).__isEmpty
}
