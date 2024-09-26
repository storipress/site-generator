import type { useNuxt } from '@nuxt/kit'
import { getRedirections } from './api-proxy'
import { convertRedirectRule } from './utils/convert-redirect'

type Nuxt = ReturnType<typeof useNuxt>

export async function setRedirections(nuxt: Nuxt): Promise<void> {
  const { data: redirectionsData } = await getRedirections()
  if (!redirectionsData.redirections?.length) return

  const routeRulesEntries = convertRedirectRule(redirectionsData.redirections)

  nuxt.options.nitro.routeRules = {
    ...nuxt.options.nitro.routeRules,
    ...Object.fromEntries(routeRulesEntries),
  }

  // eslint-disable-next-line no-console
  console.log(routeRulesEntries)
}
