import { describe, expect, it } from 'vitest'
import { withTimeout } from '../common'

describe('withTimeout', () => {
  it('should resolve with the result when the promise resolves within the timeout', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('Hello, world!'), 500)
    })

    const result = await withTimeout(promise, 1000)
    expect(result).toBe('Hello, world!')
  })

  it('should reject with null when the promise does not resolve within the timeout', async () => {
    const promise = new Promise(() => {})

    const result = await withTimeout(promise)
    expect(result).toBeNull()
  })

  it('should reject with the error when throwError is true and the promise rejects', async () => {
    const promise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Something went wrong!')), 500)
    })

    try {
      await withTimeout(promise, 1000, true)
    } catch (_error) {
      const error = _error as Error
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Something went wrong!')
    }
  })
})
