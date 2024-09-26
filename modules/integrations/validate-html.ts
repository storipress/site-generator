import * as htmlparser from 'node-html-parser'

export function validateHTML(html: string): boolean {
  return htmlparser.valid(html)
}
