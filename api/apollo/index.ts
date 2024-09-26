import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client/core'
import { SentryLink } from 'apollo-link-sentry'
import fetch from 'cross-fetch'
import { typeDefs, typePolicies } from './resolver'

interface CreateClientOptions {
  apiHost: string
  clientID?: string
  apiToken?: string
}
export function createClient({ apiHost, clientID, apiToken }: CreateClientOptions) {
  const uri = clientID ? `${apiHost}/client/${clientID}/graphql` : `${apiHost}/graphql`
  const headers = {
    'storipress-internal-api-key': apiToken || '',
    authorization: `Bearer ${apiToken || ''}`,
    'user-agent': 'storipress/nuxt3_compatible_layer',
  }

  // eslint-disable-next-line no-console
  console.log('front client', uri)

  const link: ApolloLink[] = [
    new SentryLink({
      uri,
      setTransaction: false,
      setFingerprint: false,
      attachBreadcrumbs: {
        includeVariables: true,
        includeError: true,
        transform(crumb, op) {
          crumb.data.operationName = op.operationName
          crumb.data.variables = op.variables
          return crumb
        },
      },
    }),
    new HttpLink({
      fetch,
      uri,
      headers,
    }),
  ]

  return new ApolloClient({
    link: ApolloLink.from(link),
    cache: new InMemoryCache({ typePolicies }),
    typeDefs,
  })
}

export const client = createClient(getEnv())

function getEnv(): CreateClientOptions {
  try {
    const { storipress } = useRuntimeConfig()
    return {
      apiHost: (storipress.apiHost || 'https://api.storipress.dev') as string,
      apiToken: storipress.apiToken as string,
      clientID: storipress.clientId as string,
    }
  } catch {
    return {
      apiHost: process.env.NUXT_KARBON_API_HOST || 'https://api.storipress.dev',
      apiToken: process.env.NUXT_KARBON_API_TOKEN,
      clientID: process.env.NUXT_KARBON_CLIENT_ID,
    }
  }
}
