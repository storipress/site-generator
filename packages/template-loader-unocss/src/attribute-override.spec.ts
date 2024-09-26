import { expect, it } from 'vitest'
import { html } from 'proper-tags'
import { createTransformBuild } from './test-helper'
import { createAttributeOverride } from './attribute-override'

function get(obj: Record<string, any>, path: string[]): any {
  let res = obj
  for (const key of path) {
    res = res[key]
    if (!res) return
  }
  return res
}

it('createAttributeOverride: basic', async () => {
  const { code } = await createTransformBuild({
    code: html`
      <template>
        <TextInput kind="foo" fontSize="12" color="ff0000" />
      </template>
    `,
    pathPrefix: '/blocks/front/block-id',
    hooks: {
      'transformer:attribute': createAttributeOverride({
        get,
        root: '/blocks',
        map: {
          'b-block-id': {
            foo: {
              fontSize: {
                xs: '16',
              },
            },
          },
        },
      }),
    },
  })
  expect(code).toMatch('text-[16px]')
})

it('createAttributeOverride: hoist', async () => {
  const { vue, css } = await createTransformBuild({
    code: html`
      <template>
        <SpacingProvider width="80%" />
      </template>
    `,
    pathPrefix: '/blocks/front/block-id',
    hooks: {
      transformer: {
        attribute: createAttributeOverride({ get, root: '/blocks', map: {} }),
      },
    },
  })
  expect(vue).toMatchSnapshot()
  expect(css).toMatchSnapshot()
})

it('createAttributeOverride: hoist multiple', async () => {
  const { vue, css } = await createTransformBuild({
    code: html`
      <template>
        <SpacingProvider width="80%" max="1200" />
      </template>
    `,
    pathPrefix: '/blocks/front/block-id',
    hooks: {
      'transformer:attribute': createAttributeOverride({ get, root: '/blocks', map: {} }),
    },
  })
  expect(vue).toMatchSnapshot()
  expect(css).toMatchSnapshot()
})

it('createAttributeOverride: article scoped hoist', async () => {
  const { vue, css } = await createTransformBuild({
    code: html`
      <template>
        <ArticleBlock>
          <ArticleContent>
            <Paragraph color="ff0000" />
          </ArticleContent>
        </ArticleBlock>
      </template>
    `,
    pathPrefix: '/blocks/article/block-id',
    hooks: {
      'transformer:attribute': createAttributeOverride({ get, root: '/blocks', map: {} }),
    },
  })
  expect(vue).toMatchSnapshot()
  expect(css).toMatchSnapshot()
})

it('createAttributeOverride: article Authors', async () => {
  const { vue, css } = await createTransformBuild({
    code: html`
      <template>
        <ArticleBlock>
          <Authors bold />
        </ArticleBlock>
      </template>
    `,
    pathPrefix: '/blocks/article/block-id',
    hooks: {
      'transformer:attribute': createAttributeOverride({ get, root: '/blocks', map: {} }),
    },
  })
  expect(vue).toMatchSnapshot()
  expect(css).toMatchSnapshot()
})

it('createAttributeOverride: article Paragraph', async () => {
  const { vue, css } = await createTransformBuild({
    code: html`
      <template>
        <ArticleBlock>
          <Paragraph bold />
        </ArticleBlock>
      </template>
    `,
    pathPrefix: '/blocks/article/block-id',
    hooks: {
      'transformer:attribute': createAttributeOverride({ get, root: '/blocks', map: {} }),
    },
  })
  expect(vue).toMatchSnapshot()
  expect(css).toMatchSnapshot()
})
