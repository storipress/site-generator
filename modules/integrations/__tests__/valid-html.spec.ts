import { expect, it } from 'vitest'
import { validateHTML } from '../validate-html'

it.each([
  '<meta name="google-site-verification" content="kYgLy4ZCjuR-ZxaISEs0ofzt5wpJAd9nTZ51hYdC_zs" />',
  '<meta name="google-site-verification" content="kYgLy4ZCjuR-ZxaISEs0ofzt5wpJAd9nTZ51hYdC_zs" >',
  '<meta name="google-site-verification" content="kYgLy4ZCjuR-ZxaISEs0ofzt5wpJAd9nTZ51hYdC_zs">',
])('validate google search console', (html: string) => {
  expect(validateHTML(html)).toBe(true)
})
