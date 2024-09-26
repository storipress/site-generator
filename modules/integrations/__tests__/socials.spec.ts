import { expect, it } from 'vitest'
import { normalizeSocials } from '../socials'

it('add https to url', () => {
  expect(normalizeSocials(JSON.stringify({ example: 'www.example.com' }))).toMatchInlineSnapshot(`
    {
      "example": "https://www.example.com",
    }
  `)
})
