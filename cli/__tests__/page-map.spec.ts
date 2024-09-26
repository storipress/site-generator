import { expect, it } from 'vitest'
import { Effect, pipe } from 'effect'
import { createPagesMapping$ } from '../page-map'
import type { RawOtherPageData } from '../../schema/other-page'
import type { MappingResult } from '../types'
import { createTestLayer } from './test-helper'

it('should prepare page template and without using fallback', async () => {
  const mapping: MappingResult = {
    article: [],
    front: [],
    page: [],
  }
  const { TestLayer, fileSystemActions } = createTestLayer()
  const res = await pipe(
    createPagesMapping$(
      [
        {
          id: '1',
          title: 'title',
          seo: JSON.stringify({ slug: 'page-slug' }),
          current: JSON.stringify({
            elements: {
              blockquote: 'blockquote',
              dropcap: 'dropcap',
            },
            template: 'spare-page-3',
            templateData: {
              title: 'pageTitle',
              description: 'description',
              headlineURL: 'headlineURL',
              headlineAlt: 'headlineAlt',
              caption: 'caption',
            },
            editorContent: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'text',
                    },
                  ],
                },
              ],
            },
          } satisfies RawOtherPageData),
        },
      ],
      mapping,
    ),
    Effect.provide(TestLayer),
    Effect.runPromise,
  )

  expect(res).toMatchSnapshot()
  expect(mapping.page[0].isFallback).toBe(false)
  expect(mapping).toMatchSnapshot()
  expect(fileSystemActions).toMatchSnapshot()
})

it('should prepare page template and use fallback', async () => {
  const mapping: MappingResult = {
    article: [],
    front: [],
    page: [],
  }
  const { TestLayer, fileSystemActions } = createTestLayer()
  const res = await pipe(
    createPagesMapping$(
      [
        {
          id: '1',
          title: 'title',
          seo: JSON.stringify({ slug: 'page-slug' }),
          current: JSON.stringify({
            elements: {
              blockquote: 'blockquote',
              dropcap: 'dropcap',
            },
            template: 'template',
            templateData: {
              title: 'pageTitle',
              description: 'description',
              headlineURL: 'headlineURL',
              headlineAlt: 'headlineAlt',
              caption: 'caption',
            },
            editorContent: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'text',
                    },
                  ],
                },
              ],
            },
          } satisfies RawOtherPageData),
        },
      ],
      mapping,
    ),
    Effect.provide(TestLayer),
    Effect.runPromise,
  )

  expect(res).toMatchSnapshot()
  expect(mapping.page[0].isFallback).toBe(true)
  expect(mapping).toMatchSnapshot()
  expect(fileSystemActions).toMatchSnapshot()
})

it('can handle optional templateData', async () => {
  const mapping: MappingResult = {
    article: [],
    front: [],
    page: [],
  }
  const { TestLayer, fileSystemActions } = createTestLayer()
  const res = await pipe(
    createPagesMapping$(
      [
        {
          id: '1',
          title: 'title',
          seo: JSON.stringify({ slug: 'page-slug' }),
          current: JSON.stringify({
            elements: {
              blockquote: 'blockquote',
              dropcap: 'dropcap',
            },
            template: 'spare-page-3',
            templateData: {
              title: 'pageTitle',
            },
            editorContent: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'text',
                    },
                  ],
                },
              ],
            },
          } satisfies RawOtherPageData),
        },
      ],
      mapping,
    ),
    Effect.provide(TestLayer),
    Effect.runPromise,
  )

  expect(res).toMatchSnapshot()
  expect(mapping.page[0].isFallback).toBe(false)
  expect(mapping).toMatchSnapshot()
  expect(fileSystemActions).toMatchSnapshot()
})

it('can handle empty list', async () => {
  const mapping: MappingResult = {
    article: [],
    front: [],
    page: [],
  }
  const { TestLayer, fileSystemActions } = createTestLayer()
  const res = await pipe(createPagesMapping$([], mapping), Effect.provide(TestLayer), Effect.runPromise)

  expect(res).toEqual({})
  expect(mapping).toEqual({
    article: [],
    front: [],
    page: [],
  })
  expect(fileSystemActions).toEqual([])
})

it('can handle empty page', async () => {
  const { TestLayer, fileSystemActions } = createTestLayer()
  const mapping: MappingResult = {
    article: [],
    front: [],
    page: [],
  }
  const res = await pipe(
    createPagesMapping$(
      [
        {
          id: '1',
          title: 'title',
          seo: JSON.stringify({ slug: 'page-slug' }),
          current: null,
        },
      ],
      mapping,
    ),
    Effect.provide(TestLayer),
    Effect.runPromise,
  )

  expect(res).toMatchInlineSnapshot(`
    {
      "page-slug": {
        "cover": {
          "alt": undefined,
          "caption": undefined,
          "url": undefined,
        },
        "html": "",
        "layout": {
          "id": "1",
          "template": undefined,
        },
        "pageTitle": undefined,
        "segments": [],
        "seo": {
          "slug": "page-slug",
        },
        "title": "title",
      },
    }
  `)
  expect(mapping).toMatchInlineSnapshot(`
    {
      "article": [],
      "front": [],
      "page": [
        {
          "actualTemplate": "other-page-nophoto",
          "id": "1",
          "isFallback": true,
          "path": "./article/other-template-1",
          "template": undefined,
        },
      ],
    }
  `)
  expect(fileSystemActions).toMatchInlineSnapshot(`
    [
      {
        "action": "exists",
        "path": "#unknown",
      },
      {
        "action": "mkdir",
        "options": {
          "recursive": true,
        },
        "path": "/article/other-template-1",
      },
      {
        "action": "exists",
        "path": "/article/other-template-1",
      },
      {
        "action": "copy",
        "from": "#unknown",
        "to": "/article/other-template-1",
      },
    ]
  `)
})
