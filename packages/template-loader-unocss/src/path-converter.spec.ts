import { expect, it } from 'vitest'
import { articleConverter, frontPageConverter, isPathShouldHoist, pathToSelector } from './path-converter'

it('articleConverter', () => {
  expect(articleConverter({ tag: 'Article', id: 'my-article' })).toEqual(['my-article', 'article'])
  expect(articleConverter({ tag: 'Paragraph', id: 'my-article' })).toEqual([
    'my-article',
    'article',
    'article-content',
    '& .main-content p',
  ])
  expect(articleConverter({ tag: 'Authors', id: 'my-article' })).toEqual(['my-article', 'article', 'author-name'])
  // header 1 is actually h2
  expect(articleConverter({ tag: 'Header1', id: 'my-article' })).toEqual([
    'my-article',
    'article',
    'article-content',
    '& .main-content h2',
  ])
  // header 2 is actually h3
  expect(articleConverter({ tag: 'Header2', id: 'my-article' })).toEqual([
    'my-article',
    'article',
    'article-content',
    '& .main-content h3',
  ])
})

it('frontPageConverter', () => {
  expect(frontPageConverter({ tag: 'Block', id: 'my-block' })).toEqual(['my-block'])
  expect(frontPageConverter({ tag: 'TextInput', id: 'my-block', kind: 'foo' })).toEqual(['my-block', 'foo'])
})

it('isPathShouldHoist', () => {
  expect(isPathShouldHoist(['my-article', 'article', 'article-content', '& .main-content p'])).toBe(true)
  expect(isPathShouldHoist(['my-article', 'article'])).toBe(false)
})

it('pathToSelector', () => {
  expect(pathToSelector(['my-article', 'article', 'article-content', '& .main-content p'])).toBe(
    '.article .article-content :deep(.main-content p)',
  )
  expect(pathToSelector(['my-article', 'article'])).toBe('.article')
})
