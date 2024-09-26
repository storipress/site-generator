import { expect, it } from 'vitest'
import { parseToInjectHTML } from '../parse-to-head'

it.each([
  '<meta name="google-site-verification" content="kYgLy4ZCjuR-ZxaISEs0ofzt5wpJAd9nTZ51hYdC_zs" />',
  '<meta name="google-site-verification" content="kYgLy4ZCjuR-ZxaISEs0ofzt5wpJAd9nTZ51hYdC_zs" >',
  '<meta name="google-site-verification" content="kYgLy4ZCjuR-ZxaISEs0ofzt5wpJAd9nTZ51hYdC_zs">',
])('parse google search console meta', (html: string) => {
  expect(parseToInjectHTML(html)).toMatchSnapshot()
})

it.each(['<>', '</>', '<   >'])('should correctly handle for invalid html `%s`', (html: string) => {
  expect(parseToInjectHTML(html)).toMatchSnapshot()
})
