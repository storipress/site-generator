import { beforeEach, expect, vi } from 'vitest'
import { createStorage } from 'unstorage'
import { fc, it } from '@fast-check/vitest'
import cloudflareKVBindingDriver from 'unstorage/drivers/cloudflare-kv-binding'

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var STORAGE: {
    get: (key: string) => any
    put: (key: string, value: any, meta: Record<string, unknown>) => void
    delete: (key: string) => void
  }
}

beforeEach(() => {
  vi.stubGlobal('STORAGE', {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })
})

it('should set with expires', async () => {
  const storage = createStorage({
    driver: cloudflareKVBindingDriver({ binding: 'STORAGE' }),
  })

  await storage.setItem('foo', { expires: 100 })

  expect(globalThis.STORAGE.put).toHaveBeenCalledWith('foo', JSON.stringify({ expires: 100 }), { expirationTtl: 60 })
})

it.prop([fc.object()])('can set any object', async (data) => {
  const storage = createStorage({
    driver: cloudflareKVBindingDriver({ binding: 'STORAGE' }),
  })

  await storage.setItem('foo', data)

  expect(globalThis.STORAGE.put).toHaveBeenCalledWith('foo', JSON.stringify(data), { expirationTtl: 60 })
})
