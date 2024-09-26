import { P, match } from 'ts-pattern'
import { request } from 'undici'
import { snakeCase } from 'scule'
import { withHttps } from 'ufo'
import { dedent } from 'ts-dedent'
import invariant from 'tiny-invariant'
import { type ClientInfo, clientPreset } from './client-preset'

export function convertObjectToEnvObject({
  obj,
  prefix = 'NUXT_KARBON',
  renameMap = {},
}: {
  obj: Record<string, unknown>
  prefix?: string
  renameMap?: Record<string, string>
}) {
  const res: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = renameMap[key] || `${prefix}_${snakeCase(key).toUpperCase()}`
    res[newKey] = `${value}`
  }

  return res
}

export function generateEnv({
  name,
  clientID,
  token,
  searchKey,
  encryptKey,
  domain,
}: ClientInfo & { encryptKey: string }) {
  return `${dedent`
  NUXT_KARBON_ENCRYPT_KEY=${encryptKey}
  
  # ${name}
  NUXT_KARBON_CLIENT_ID=${clientID}
  NUXT_KARBON_API_TOKEN=${token}
  NUXT_KARBON_SEARCH_KEY=${searchKey}
  NUXT_KARBON_API_HOST=${getAPIHost(clientID)}
  NUXT_KARBON_SEARCH_DOMAIN=${getSearchDomain(clientID)}
  NUXT_KARBON_STRIPE_KEY=${getStripeKey(clientID)}
  NUXT_PUBLIC_SITE_URL=${withHttps(domain)}
  `}\n`
}

export function getAPIHost(clientID: string): string {
  return match(clientID)
    .with(P.string.startsWith('P'), () => {
      return `https://api.stori.press`
    })
    .with(P.string.startsWith('S'), () => {
      return `https://api.storipress.pro`
    })
    .otherwise(() => {
      return `https://api.storipress.dev`
    })
}

const TEST_STRIPE_KEY =
  'pk_test_51IDJb3DQE8vvr0rTAtkFYyhfpVMjYXk3lb7muychPVxSEDRTH6yMAb9hguRumjrVAqNvhmfPWxaIkZgA02LRFBBW00Wu74TZ2M'
const PROD_STRIPE_KEY =
  'pk_live_51IDJb3DQE8vvr0rTUKovoAVC9RjsO1dzO2Eb0bwceznxJR4pI2tiRwZxodPpZXqV8eYFMvjxP8T1DpGHHPi9DWFR00ww5vHywX'

function getStripeKey(clientID: string): string {
  return match(clientID)
    .with(P.string.startsWith('P'), () => {
      return PROD_STRIPE_KEY
    })
    .otherwise(() => {
      return TEST_STRIPE_KEY
    })
}

function getSearchDomain(clientID: string): string {
  return match(clientID)
    .with(P.string.startsWith('P'), () => {
      return `search.stori.press`
    })
    .with(P.string.startsWith('S'), () => {
      return `search.storipress.pro`
    })
    .otherwise(() => {
      return `search.storipress.dev`
    })
}

export async function resolvePublicationOpts(
  publication: string,
): Promise<{ name: string; clientID: string; token: string; searchKey: string; domain: string }> {
  if (clientPreset[publication]) {
    return {
      clientID: publication,
      ...clientPreset[publication],
    }
  }

  const apiURL = getAPIUrl(publication)

  const res = await request(apiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'storipress-internal-api-key': 'c5b036210464ff5ffe2eb535421f060f206f6d18e560cd420339b110',
    },
    body: JSON.stringify({
      query: `
      query {
        site {
          name
          newstand_key
          typesense_search_only_key
          customer_site_domain
        }
      }
      `,
    }),
  })

  invariant(res.statusCode === 200, 'could not get newstand_key')
  const body = await res.body.json()
  return {
    token: body.data.site.newstand_key,
    name: body.data.site.name,
    clientID: publication,
    searchKey: body.data.site.typesense_search_only_key,
    domain: body.data.site.customer_site_domain,
  }
}

function getAPIUrl(clientID: string): string {
  return match(clientID)
    .with(P.string.startsWith('P'), (clientID) => {
      return `https://api.stori.press/client/${clientID}/graphql`
    })
    .with(P.string.startsWith('S'), (clientID) => {
      return `https://api.storipress.pro/client/${clientID}/graphql`
    })
    .otherwise((clientID) => {
      return `https://api.storipress.dev/client/${clientID}/graphql`
    })
}
