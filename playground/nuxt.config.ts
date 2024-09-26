/* eslint-disable no-console */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createArticleRoute, createAuthorRoute, createDeskRoute } from '@storipress/karbon/helper'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fontVersion = '1.4.0'
const fontUrl = `https://assets.stori.press/storipress/css/fonts.css?ver=${fontVersion}`

export default defineNuxtConfig({
  extends: '..',
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://assets.stori.press',
        },
        {
          rel: 'preconnect',
          href: 'https://www.googletagmanager.com',
        },
        {
          href: fontUrl,
          rel: 'preload',
          as: 'style',
          onload: 'this.rel = "stylesheet"',
        },
      ],
      noscript: [
        {
          innerHTML: `<link rel="stylesheet" href="${fontUrl}">`,
        },
      ],
    },
    cdnURL: process.env.NUXT_APP_CDN_URL ?? '',
  },
  nitro: {
    preset: path.resolve(__dirname, 'nitro', 'nitro-preset.ts'),
    storage: {
      cache: {
        driver: import.meta.env.MODE === 'test' ? 'memory' : 'cloudflare-kv-binding',
      },
    },
  },
  routeRules: {
    '/api/**': {
      cache: false,
    },
    '/_storipress/**': {
      swr: false,
      cache: {
        swr: true,
        maxAge: 300,
        staleMaxAge: 60,
      },
    },
    '/**': {
      swr: true,
      cache: {
        swr: true,
        maxAge: 3600,
        staleMaxAge: 300,
      },
    },
  },
  modules: ['@nuxt/devtools'],
  typescript: {
    includeWorkspace: true,
  },
  alias: {},
  vite: {
    // define: {
    //   __VUE_PROD_DEVTOOLS__: 'true',
    // },
    optimizeDeps: {
      include: ['yup', 'p-retry', 'lodash'],
    },
  },
  runtimeConfig: {
    storipress: {
      apiHost: process.env.NUXT_KARBON_API_HOST,
      apiToken: process.env.NUXT_KARBON_API_TOKEN,
      clientId: process.env.NUXT_KARBON_CLIENT_ID,
      searchDomain: process.env.NUXT_KARBON_SEARCH_DOMAIN,
      encryptKey: process.env.NUXT_KARBON_ENCRYPT_KEY,
      searchKey: process.env.NUXT_KARBON_SEARCH_KEY,
      stripeKey: process.env.NUXT_KARBON_STRIPE_KEY,
      rid: process.env.NUXT_KARBON_RELEASE_ID,
      generatorId: process.env.NUXT_KARBON_GENERATOR_ID,
      axiomVersion: '2023-08-11',
      axiomToken: 'xaat-b02bc9c7-ece1-4924-af79-1238bea2019b',
    },
    public: {
      titleSeparator: '-',
      spGtag: {
        id: 'G-1REY9CYZ1T',
      },

      storipressCompat: {
        showBadge: true,
        flags: {
          paywall: true,
        },
      },

      storipress: {
        stripeKey: process.env.NUXT_KARBON_STRIPE_KEY,
      },

      siteName: process.env.NUXT_PUBLIC_SITE_NAME,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION,
    },
  },
  karbon: {
    flags: {
      lazySearch: true,
    },
    fullStatic: false,
    // @ts-expect-error no tag
    resources: {
      article: createArticleRoute('/posts/{slug}', {
        meta: {
          key: 'article',
        },
      }),
      desk: {
        ...createDeskRoute('/desks/{slug}'),
        getIdentity: (params, _ctx, metas) => {
          const paramName = '_slug'
          const queryString = params[paramName]

          type BaseMeta = NonNullable<typeof metas>[number]
          interface DeskMeta extends BaseMeta {
            seo: string
            desks: DeskMeta[]
          }
          function getMatchedDeskId(desks: DeskMeta[]) {
            for (const desk of desks) {
              const { slug } = JSON.parse(desk?.seo || '{}')
              console.log({
                seoSlug: slug,
                queryString,
                deskId: desk.id,
                slug: desk.slug,
              })
              if (!slug && desk.slug === queryString) {
                console.log('found desk.slug')
                return desk.id
              }

              if (slug === queryString) {
                console.log('found desk.seo.slug')
                return desk.id
              }

              // FIXME: currently we don't handle sub desk
              // for(const subDesk of desk.desks) {
              //   const { slug: subDeskSlug } = JSON.parse(subDesk?.seo || '{}')
              //   if (subDeskSlug === queryString) return subDesk.id
              // }
            }
          }
          const matchedDeskId = getMatchedDeskId(metas as DeskMeta[])

          const resourceID = matchedDeskId ? { type: 'desk', id: matchedDeskId } : { type: 'desk', slug: queryString }
          console.log(resourceID)

          return resourceID
        },

        isValid: (params, meta) => {
          const deskMeta = meta as typeof meta & { seo: string }
          const { slug: seoSlug } = JSON.parse(deskMeta?.seo || '{}')
          const querySlug = params._slug
          console.log('isValid', {
            seoSlug,
            querySlug,
            slug: meta.slug,
            isSeoEqual: seoSlug === querySlug,
            isMetaEqual: meta.slug === querySlug,
          })

          return seoSlug ? seoSlug === querySlug : meta.slug === querySlug
        },

        toURL: (meta) => {
          const deskMeta = meta as typeof meta & { seo: string }
          const { slug: seoSlug } = JSON.parse(deskMeta?.seo || '{}')

          return seoSlug ? `/desks/${seoSlug}` : `/desks/${meta?.slug}`
        },
      },
      author: createAuthorRoute('/authors/{slug}'),
    },
    paywall: {
      enable: true,
      logo: './assets/logomark.svg',
    },
  },
})
