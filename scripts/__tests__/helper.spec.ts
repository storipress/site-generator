import { expect, it } from 'vitest'
import { convertObjectToEnvObject, generateEnv } from '../helper'

it('generateEnv', () => {
  expect(
    generateEnv({
      clientID: 'client_id',
      domain: 'domain',
      encryptKey: 'encrypt_key',
      name: 'name',
      searchKey: 'search_key',
      token: 'token',
    }),
  ).toMatchInlineSnapshot(`
    "NUXT_KARBON_ENCRYPT_KEY=encrypt_key

    # name
    NUXT_KARBON_CLIENT_ID=client_id
    NUXT_KARBON_API_TOKEN=token
    NUXT_KARBON_SEARCH_KEY=search_key
    NUXT_KARBON_API_HOST=https://api.storipress.dev
    NUXT_KARBON_SEARCH_DOMAIN=search.storipress.dev
    NUXT_KARBON_STRIPE_KEY=pk_test_51IDJb3DQE8vvr0rTAtkFYyhfpVMjYXk3lb7muychPVxSEDRTH6yMAb9hguRumjrVAqNvhmfPWxaIkZgA02LRFBBW00Wu74TZ2M
    NUXT_PUBLIC_SITE_URL=https://domain
    "
  `)
})

it('convertObjectToEnvObject', () => {
  expect(
    convertObjectToEnvObject({
      obj: {
        clientId: 'client_id',
        apiToken: 'token',
        searchKey: 'search_key',
      },
    }),
  ).toMatchInlineSnapshot(`
    {
      "NUXT_KARBON_API_TOKEN": "token",
      "NUXT_KARBON_CLIENT_ID": "client_id",
      "NUXT_KARBON_SEARCH_KEY": "search_key",
    }
  `)
})
