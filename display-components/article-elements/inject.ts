import { convertArticle } from '../common/convert-article'

export interface Focus {
  x: number
  y: number
}

interface Author {
  name: string
  url: string
}

export interface Article {
  elements: Record<string, string>

  id: string
  logo: string
  url: string
  title: string
  blurb: string
  desk: string
  deskUrl: string
  content: string
  authors: Author[]
  date: Date
  headlineURL: string | null
  headlineFocus: Focus
  headlineAlt: string
  headlineCaption: string

  subscribe: string
}

export type ArticleInjected = Article

export interface Injected {
  $element: ArticleInjected
}

export const INJECTED_DEFAULT: ArticleInjected = {
  elements: {},

  id: '',
  url: '',
  title: '',
  blurb: '',
  content: '',
  desk: '',
  deskUrl: '',
  authors: [],
  date: new Date(),
  headlineURL: null,
  headlineFocus: { x: 0, y: 0 },
  headlineAlt: '',
  headlineCaption: '',

  logo: '',
  subscribe: '',
}

export function useArticleElement() {
  const injected = inject('$element', INJECTED_DEFAULT)
  return reactiveComputed(() => {
    return convertArticle(injected)
  })
}
