import { expect, it } from 'vitest'
import { convertRedirectRule } from '../convert-redirect'

it.each([
  ['/foo', ['/foo', '/foo/']],
  ['foo', ['/foo', '/foo/']],
  ['foo/bar', ['/foo/bar', '/foo/bar/']],
  ['./', []],
  ['', ['/', '/']],
])('can convert rule for "%s"', (path, _expected) => {
  const rule = {
    path,
    target: '/target',
  }
  const expected = _expected.map(
    (url) => [url, { redirect: { to: '/target', statusCode: expect.any(Number) } }] as const,
  )

  const result = convertRedirectRule([rule])

  expect(result).toEqual(expected)
})
