import { describe, expect, it } from 'vitest'
import { Effect, pipe } from 'effect'
import { z } from 'zod'
import { createGeneratedPath, parseSchemaJson } from '../helpers'
import { createTestLayer } from './test-helper'

it('generatedPath', () => {
  const generatedPath = createGeneratedPath('', true)

  expect(generatedPath`foo`).toMatchInlineSnapshot('"../playground/generated/foo"')
  expect(generatedPath`foo${'bar'}`).toMatchInlineSnapshot('"../playground/generated/foobar"')
  expect(generatedPath()).toMatchInlineSnapshot('"../playground/generated"')
})

describe('parseSchemaJson', () => {
  it('can parse valid data', () => {
    const schema = z.object({
      foo: z.string(),
    })
    const data = { foo: 'bar' }
    const { TestLayer } = createTestLayer()
    const parsed = pipe(parseSchemaJson(schema, JSON.stringify(data)), Effect.provide(TestLayer), Effect.runSync)
    expect(parsed).toEqual(data)
  })

  it('can handle invalid data', () => {
    const schema = z.object({
      foo: z.string(),
    })
    const data = '{ "foo": "bar" '
    const { TestLayer } = createTestLayer()
    const parsed = pipe(parseSchemaJson(schema, data), Effect.provide(TestLayer), Effect.runSync)
    expect(typeof parsed).toBe('string')
    expect(parsed).toEqual(data)
  })

  it('can handle empty data', () => {
    const schema = z.object({
      foo: z.string(),
    })
    const data = null
    const { TestLayer } = createTestLayer()
    const parsed = pipe(parseSchemaJson(schema, data), Effect.provide(TestLayer), Effect.runSync)
    expect(parsed).toBeNull()
    expect(parsed).toEqual(data)
  })
})
