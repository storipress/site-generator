import { expect, it, vi } from 'vitest'
import { html } from 'proper-tags'
import { createTransformBuild } from './test-helper'
import type { AttributeContext } from './transform'
import { getValuedAttributes } from './transform'

it('transformer: basic', async () => {
  const fn = vi.fn()
  const { code } = await createTransformBuild({
    code: html`
      <template>
        <TextInput kind="foo" fontSize="12" color="ff0000" />
      </template>
    `,
    hooks: {
      'transformer:kind': fn,
    },
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextInput',
    kind: 'foo',
  })
  expect(code).toMatch('text-[12px]')
  expect(code).toMatch('text-[#ff0000]')
})

it('transformer: boolean attribute', async () => {
  const { code } = await createTransformBuild({
    code: html`
      <template>
        <TextInput bold />
      </template>
    `,
  })
  expect(code).toMatch('font-bold')
})

it('transformer: multiple component', async () => {
  const fn = vi.fn()
  const { code } = await createTransformBuild({
    code: html`
      <template>
        <TextInput kind="foo" fontSize="12" color="ff0000" />
        <TextElement kind="bar" fontSize="14" color="ff0000" />
      </template>
    `,
    hooks: {
      'transformer:kind': fn,
    },
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextInput',
    kind: 'foo',
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextElement',
    kind: 'bar',
  })
  expect(code).toMatch('text-[12px]')
  expect(code).toMatch('text-[14px]')
  expect(code).toMatch('text-[#ff0000]')
})

it('transformer: has class component', async () => {
  const fn = vi.fn()
  const { code } = await createTransformBuild({
    code: html`
      <template>
        <TextInput class="my-input" kind="foo" fontSize="12" color="ff0000" />
      </template>
    `,
    hooks: {
      'transformer:kind': fn,
    },
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextInput',
    kind: 'foo',
  })
  expect(code).toMatch('text-[12px]')
  expect(code).toMatch('text-[#ff0000]')
})

it('transformer: multiple has class component', async () => {
  const fn = vi.fn()
  const { code } = await createTransformBuild({
    code: html`
      <template>
        <TextInput class="my-input" kind="foo" fontSize="12" color="ff0000" />
        <TextElement class="my-el" kind="bar" fontSize="14" color="ff0000" />
      </template>
    `,
    hooks: {
      'transformer:kind': fn,
    },
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextInput',
    kind: 'foo',
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextElement',
    kind: 'bar',
  })
  expect(code).toMatch('text-[12px]')
  expect(code).toMatch('text-[14px]')
  expect(code).toMatch('text-[#ff0000]')
})

it('transformer: nested component', async () => {
  const fn = vi.fn()
  const { code } = await createTransformBuild({
    code: html`
      <template>
        <ColorArea kind="nav-bg" backgroundColor="0000ff">
          <TextInput class="my-input" kind="foo" fontSize="12" color="ff0000" />
          <TextElement class="my-el" kind="bar" fontSize="14" color="ff0000"> {{text}} </TextElement>
        </ColorArea>
      </template>
    `,
    hooks: {
      'transformer:kind': fn,
    },
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'ColorArea',
    kind: 'nav-bg',
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextInput',
    kind: 'foo',
  })
  expect(fn).toBeCalledWith({
    id: '/entry.vue',
    tag: 'TextElement',
    kind: 'bar',
  })
  expect(code).toMatch('text-[12px]')
  expect(code).toMatch('text-[14px]')
  expect(code).toMatch('text-[#ff0000]')
  expect(code).toMatch('bg-[#0000ff]')
})

it('transformer: self close attribute component', async () => {
  const { code, vue } = await createTransformBuild({
    code: html`
      <template>
        <ArticleBlock />
      </template>
    `,
    hooks: {
      'transformer:attribute': (ctx: AttributeContext) => {
        if (ctx.tag === 'ArticleBlock' && ctx.key === 'backgroundColor') {
          ctx.value = { xs: '0000ff' }
        }
      },
    },
  })
  expect(vue).toMatchSnapshot()
  expect(code).toMatch('bg-[#0000ff]')
})

it('transformer: no attribute component', async () => {
  const { code, vue } = await createTransformBuild({
    code: html`
      <template>
        <ArticleBlock></ArticleBlock>
      </template>
    `,
    hooks: {
      'transformer:attribute': (ctx: AttributeContext) => {
        if (ctx.tag === 'ArticleBlock' && ctx.key === 'backgroundColor') {
          ctx.value = { xs: '0000ff' }
        }
      },
    },
  })
  expect(vue).toMatchSnapshot()
  expect(code).toMatch('bg-[#0000ff]')
})

it('getValuedAttributes return all supported attributes', async () => {
  const attributes = getValuedAttributes([])

  expect(attributes.map((x) => x[1])).toMatchInlineSnapshot(`
    [
      "fontSize",
      "fontFamily",
      "align",
      "color",
      "lineHeight",
      "hoverColor",
      "width",
      "min",
      "max",
      "backgroundColor",
      "bold",
      "underline",
      "uppercase",
      "lowercase",
    ]
  `)
})
