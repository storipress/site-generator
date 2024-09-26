import { last, mapValues } from 'remeda'
import invariant from 'tiny-invariant'

export interface PathConverterOptions {
  hasKinds?: Set<string>
  hasOptionalKinds?: Set<string>
  maps?: Record<string, string[]>
  scope?: string
  exact?: boolean
}

export interface PathConverterInput {
  tag: string
  id: string
  kind?: string
}

export interface PathConverter {
  (input: PathConverterInput): string[] | undefined
}

export function createConverter({
  hasKinds = new Set(),
  hasOptionalKinds = new Set(),
  maps = {},
  scope,
  exact,
}: PathConverterOptions): PathConverter {
  return ({ tag, kind, id }: PathConverterInput): string[] | undefined => {
    let defaultPath: string[]
    if (maps[tag]) {
      defaultPath = [id, ...maps[tag]]
    } else if (scope && !exact) {
      defaultPath = [id, scope]
    } else {
      defaultPath = [id]
    }
    if (hasKinds.has(tag)) {
      if (!kind) {
        if (hasOptionalKinds.has(tag)) {
          return defaultPath ?? []
        }
        console.warn(`expect kind for ${tag}`)
        return
      }
      return scope ? [id, scope, kind] : [id, kind]
    }

    return defaultPath
  }
}

export const frontPageConverter = createConverter({
  hasKinds: new Set(['TextElement', 'TextInput', 'Authors', 'ColorArea']),
  hasOptionalKinds: new Set(['ColorArea']),
  maps: {
    Block: [],
    HeroBlock: [],
    Nav: [],
  },
})

const tags: Record<string, string> = {
  Title: 'article-title',
  TitleElement: 'article-title',
  Description: 'article-description',
  Date: 'article-date',
  AuthorList: 'article-author',
  AuthorName: 'author-name',
  Authors: 'author-name',
  Desk: 'article-desk',
  Header: 'article-header',
  HeaderBlock: 'article-header',
  Header1: 'h2',
  Header2: 'h3',
  Paragraph: 'p',
  Blockquote: 'blockquote',
  HeadlineCaption: 'headline-caption',
}

const articleRawMap: Record<string, string[]> = {
  Article: ['article'],
  ArticleBlock: ['article'],
}

export const articleConverter = createConverter({
  maps: { ...mapValues(tags, (tag: string): string[] => convertNameToPath(tag)), ...articleRawMap },
  hasKinds: new Set(['ColorArea', 'Title', 'TitleElement', 'Description', 'Date', 'Desk', 'HeadlineCaption']),
  hasOptionalKinds: new Set(['Title', 'TitleElement', 'Description', 'Date', 'Desk', 'HeadlineCaption']),
  scope: 'article',
  exact: true,
})

export function convertNameToPath(name: string): string[] {
  if (name === 'drop-cap') {
    return ['article', 'article-content', '& .main-content > p:first-of-type::first-letter']
  }

  if (name.includes('-')) {
    return ['article', name]
  }

  return ['article', 'article-content', `& .main-content ${name}`]
}

export function isPathShouldHoist(path: string[]): boolean {
  return last(path)?.startsWith('&') || false
}

export function pathToSelector(path: string[]): string {
  invariant(path.length > 1, 'path should not be empty')
  const initial = path.slice(1, -1)
  const lastItem = last(path)
  invariant(lastItem, 'last item should not be empty')

  if (lastItem.startsWith('&')) {
    return `${initial.map((item) => `.${item}`).join(' ')} :deep(${lastItem.slice(2)})`
  }

  return path
    .slice(1)
    .map((item) => `.${item}`)
    .join(' ')
}
