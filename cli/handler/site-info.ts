import { withHttps } from 'ufo'
import { P, match } from 'ts-pattern'
import { GraphQLClient } from 'graphql-request'
import { Effect } from 'effect'
import { getSdk } from './graphql-operations'
import { logger } from './pino'

export interface SiteInfo {
  cdnUrl: string
  searchDomain: string
  searchKey: string
  stripeKey: string
  apiHost: string
  apiToken: string
  clientId: string
  siteName: string
  siteDescription: string
  customerSiteDomain: string
  customDomain: string | null
  timezone: string
  workspace: string
  plan: string
}

export function getSiteInfo(clientId: string, token: string): Promise<SiteInfo> {
  return Effect.runPromise(getSiteInfo$(clientId, token))
}

export function getSiteInfo$(clientId: string, token: string): Effect.Effect<SiteInfo> {
  return Effect.gen(function* ($) {
    const host = getAPIHost(clientId)
    const endpoint = `${host}/client/${clientId}/graphql`
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'user-agent': 'generator-next/1.0.0',
        authorization: `Bearer ${token}`,
        // FIXME: workaround of mixing internal API + bearer token
        'storipress-internal-api-key': token,
      },
    })

    const sdk = getSdk(graphQLClient)

    const siteResult = yield* $(Effect.promise(() => sdk.GetSiteInfo()))
    const siteUrl = withHttps(siteResult.site.customer_site_domain)
    const searchKey = siteResult?.site?.typesense_search_only_key
    const cdnUrl = withHttps(siteResult.site.customer_site_storipress_url)
    const name = siteResult.site.name
    const description = siteResult.site.description
    logger.info(
      {
        siteUrl,
        searchKey,
        cdnUrl,
      },
      'loaded site info',
    )
    return {
      apiHost: host,
      apiToken: token,
      cdnUrl,
      clientId,
      customDomain: siteResult.site.custom_domain ?? null,
      customerSiteDomain: withHttps(siteResult.site.customer_site_domain),
      plan: siteResult.site.plan,
      searchDomain: getSearchDomain(clientId),
      searchKey: siteResult.site.typesense_search_only_key,
      siteDescription: description ?? '',
      siteName: name,
      stripeKey: getStripeKey(clientId),
      timezone: siteResult.site.timezone,
      workspace: siteResult.site.workspace,
    }
  })
}

export function getAPIHost(clientID: string) {
  return match(clientID)
    .with(
      P.when((id) => id.startsWith('D')),
      () => 'https://api.storipress.dev',
    )
    .with(
      P.when((id) => id.startsWith('S')),
      () => 'https://api.storipress.pro',
    )
    .otherwise(() => 'https://api.stori.press')
}

function getSearchDomain(clientID: string) {
  return match(clientID)
    .with(
      P.when((id) => id.startsWith('D')),
      () => 'search.storipress.dev',
    )
    .with(
      P.when((id) => id.startsWith('S')),
      () => 'search.storipress.pro',
    )
    .otherwise(() => 'search.stori.press')
}

function getStripeKey(clientId: string) {
  return clientId.startsWith('P')
    ? 'pk_live_51IDJb3DQE8vvr0rTUKovoAVC9RjsO1dzO2Eb0bwceznxJR4pI2tiRwZxodPpZXqV8eYFMvjxP8T1DpGHHPi9DWFR00ww5vHywX'
    : 'pk_test_51IDJb3DQE8vvr0rTAtkFYyhfpVMjYXk3lb7muychPVxSEDRTH6yMAb9hguRumjrVAqNvhmfPWxaIkZgA02LRFBBW00Wu74TZ2M'
}
