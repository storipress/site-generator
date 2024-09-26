import { expect, it } from 'vitest'
import { extractBlockId } from './block-id'

it('extractBlockId', () => {
  expect(extractBlockId('/foo/front/bar/baz', '/foo')).toEqual({ type: 'front', blockId: 'b-bar' })
  expect(extractBlockId('entry.vue', '/foo')).toBe(null)
})
