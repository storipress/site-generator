import { defineNuxtModule, installModule, resolveAlias } from '@nuxt/kit'
import templateLoader, { createAttributeOverride } from '@storipress/template-loader-unocss'
import { withHttps } from 'ufo'
import { mergeConfigs } from 'unocss'
import defaultFront from '../playground/utils/default-front.json'
import {
  baseUnocssConfig,
  extractDesign,
  extractIntegrations,
  getGeneratorData,
  normalizeSocials,
  setRedirections,
} from './integrations/helpers'
import { setConfig } from './integrations/api-proxy'

const defaultFrontString = JSON.stringify(defaultFront)

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@storipress/integration',
    configKey: 'integration',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
    if (!(nuxt.options.runtimeConfig.storipress as { clientId: string }).clientId) {
      console.warn('no client id')
      // we are probably in `nuxi prepare`, just provide basic config
      await installModule('@unocss/nuxt')
      await installModule('@storipress/inject-html-module')
      return
    }
    const clientId = (nuxt.options.runtimeConfig.storipress as { clientId: string }).clientId
    if (clientId === 'USE_MOCK') {
      // eslint-disable-next-line no-console
      console.log('use mock data')
      setConfig({ useMock: true })
      process.env.NUXT_KARBON_CLIENT_ID = '##_CLIENT_ID_##'
      Object.assign(nuxt.options.runtimeConfig.storipress, {
        searchDomain: '##_SEARCH_DOMAIN_##',
        searchKey: '##_SEARCH_KEY_##',
        stripeKey: '##_SRRIPE_KEY_##',
        apiHost: '##_API_HOST_##',
        apiToken: '##_API_TOKEN_##',
        clientId: '##_CLIENT_ID_##',
      })

      Object.assign(nuxt.options.runtimeConfig.public.storipress, {
        searchDomain: '##_SEARCH_DOMAIN_##',
        searchKey: '##_SEARCH_KEY_##',
        stripeKey: '##_SRRIPE_KEY_##',
        apiHost: '##_API_HOST_##',
        clientId: '##_CLIENT_ID_##',
      })

      nuxt.options.runtimeConfig.public.siteUrl = '##_CUSTOMER_SITE_DOMAIN_##'
    }
    const { data: generatorData } = await getGeneratorData()
    const { site, home, desks, pages } = generatorData
    const integrations = extractIntegrations({ integrations: generatorData.integrations })

    const apiSiteConfig = {
      name: site.name,
      url: withHttps(site.customer_site_domain),
      description: site.description,
      defaultLocale: site.lang,
    }

    nuxt.options.runtimeConfig.public.site ??= {}
    Object.assign(nuxt.options.runtimeConfig.public.site, apiSiteConfig)

    type ResolvedSEO = Required<NonNullable<typeof home>['resolvedSEO']>
    // TODO: need mock and replace data
    nuxt.options.runtimeConfig.public = {
      ...nuxt.options.runtimeConfig.public,
      siteName: site.name,
      storipressCompat: {
        ...nuxt.options.runtimeConfig.public.storipressCompat,
        hostname: site.customer_site_domain,
        clientID: process.env.NUXT_KARBON_CLIENT_ID || '',
        timezone: site.timezone,
        gaID: integrations.ga.id,
        name: site.name,
        site: {
          ...site,
          name: site.name,
          socials: normalizeSocials(site.socials),
        } as any,
        mailchimp: integrations.mailchimp.action,
        disqus: integrations.disqus.shortname,
        integrations,
        seo: {
          home: structuredClone(home?.resolvedSEO) as ResolvedSEO,
          desks: desks.map((desk) => ({ ...structuredClone(desk.resolvedSEO), id: desk.id, _seo: desk.seo })),
          pages: pages.map((page) => ({ ...structuredClone(page.resolvedSEO), id: page.id, _seo: page.seo })),
        },
      },
      spGtag: {
        id: isProductionClient(clientId) ? 'G-HWVVLM3WJ9' : 'G-1REY9CYZ1T',
      },
    }

    nuxt.options.app.head.link = [
      ...(nuxt.options.app.head.link ?? []),
      { rel: 'icon', type: 'image', href: site.favicon ?? '' },
    ]

    const homeDesign = JSON.parse(home?.current || defaultFrontString)
    const logo = homeDesign.images?.[`b-${homeDesign.blocks[0]}`]?.logo || './assets/logomark.svg'
    nuxt.options = {
      ...nuxt.options,
      karbon: {
        ...(nuxt.options?.karbon as any),
        paywall: {
          ...nuxt.options?.karbon?.paywall,
          enable: site.subscription_setup_done,
          logo,
        },
      },
    }

    const { elementStylesParts, homeStyle, layoutsStyle, pagesStyle } = await extractDesign(homeDesign)

    // eslint-disable-next-line no-console
    console.log('generated directory:', resolveAlias('#generated'))

    await installModule(
      '@unocss/nuxt',
      mergeConfigs([
        baseUnocssConfig,
        {
          preflights: [
            {
              getCSS: () => elementStylesParts.join('\n'),
            },
          ],
          transformers: [
            templateLoader({
              hooks: {
                'transformer:attribute': createAttributeOverride({
                  root: resolveAlias('#generated'),
                  map: {
                    ...homeStyle,
                    ...layoutsStyle,
                    ...pagesStyle,
                  },
                }),
              },
            }),
          ],
        },
      ]),
    )

    const getInjectData = (list: typeof desks | typeof pages, prefix = '', key: 'id' | 'slug' = 'id') => {
      const entries = list
        .map((item) => {
          const { id, seo } = item
          const seoObject = JSON.parse(seo || '{}')
          const { inject, slug } = seoObject as { inject?: string; slug?: string }
          const map = { id, slug }
          return inject && [`${prefix}-${map[key]}`, inject]
        })
        .filter(Boolean) as [string, string][]
      return Object.fromEntries(entries)
    }

    const frontPageSeo = JSON.parse(home?.seo || '{}')
    const frontPageInject = frontPageSeo?.inject
    const desksInject = getInjectData(desks, 'desk')
    const pagesInject = getInjectData(pages, 'page', 'slug')
    await installModule('@storipress/inject-html-module', {
      profiles: {
        default: integrations.inject,
        front: frontPageInject,
        ...desksInject,
        ...pagesInject,
      },
    })

    await setRedirections(nuxt)
  },
})

function isProductionClient(clientID: string) {
  return clientID.startsWith('P')
}
