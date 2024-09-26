import { withHttps } from 'ufo'
import { destr } from 'destr'

export function normalizeSocials(rawSocials = '{}') {
  const socials = destr<Record<string, string>>(rawSocials || '{}')

  return Object.fromEntries(
    Object.entries(socials).flatMap(([name, url]) => {
      const normalizedUrl = withHttps(url as string)

      return [
        [name, normalizedUrl],
        [name.toLowerCase(), normalizedUrl],
      ]
    }),
  )
}
