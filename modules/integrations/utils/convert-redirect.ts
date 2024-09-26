import { isRelative, withLeadingSlash, withTrailingSlash, withoutTrailingSlash } from 'ufo'

export interface Redirection {
  path: string
  target: string
}

export interface RedirectRule {
  redirect: {
    to: string
    statusCode: number
  }
}

export function convertRedirectRule(rules: Redirection[]): [path: string, rule: RedirectRule][] {
  return rules.flatMap(({ path, target }) =>
    isRelative(path)
      ? []
      : [
          [withoutTrailingSlash(withLeadingSlash(path)), { redirect: { to: target, statusCode: 302 } }],
          [withTrailingSlash(withLeadingSlash(path)), { redirect: { to: target, statusCode: 302 } }],
        ],
  )
}
