import { sortBy } from 'lodash'
import slugify from '@sindresorhus/slugify'

import { exclude } from 'tsafe'
import { withHttps } from 'ufo'
import type { Design, GeneratorRawData } from './types'
import { expandSocial, prefixSocial } from './expand-social'
import defaultFront from './default-front.json'

export function getFrontData(generatorData: GeneratorRawData) {
  const data = generatorData
  const home: Design = extractDesign(data)

  const deskHasArticles = new Set(
    generatorData.desks
      .map(({ desks, articles_count: count, slug }) => {
        if ((desks && desks.some(({ articles_count: count }) => count > 0)) || count > 0) {
          return slug
        }
        return null
      })
      .filter(exclude(null)),
  )

  const payload = extractCommonData(data, home, deskHasArticles)

  const { desks, pages, hero, footer, site, portal, logo } = payload
  const blockDesks = Object.fromEntries(Object.entries(home.blockStates ?? {}).map(([key, { desks }]) => [key, desks]))
  const blocks = { texts: home.texts, images: home.images }
  return {
    logo,
    desks,
    pages,
    site,
    ...hero,
    portal,
    staticBlocks: { hero, footer },
    blockDesks,
    blocks,
    fallback: {
      layout: data.layouts[0]?.id,
    },
    elementsMap: Object.fromEntries(
      data.layouts.map(({ id, data }) => {
        const { elements = {} } = JSON.parse(data || '{}')

        return [
          id,
          {
            dropcap: 'none',
            blockquote: 'regular',
            ...elements,
          },
        ]
      }),
    ),
  }
}

interface RawDesignData {
  home?: {
    current?: string | null
  } | null
}

export function extractDesign(data: RawDesignData): Design {
  return {
    ...defaultFront,
    ...JSON.parse(data.home?.current ?? '{}'),
  }
}

function safeParse(raw: string) {
  try {
    return JSON.parse(raw)
  } catch (error) {}
}

export function extractCommonData(data: GeneratorRawData, home: Design, deskHasArticles: Set<string>) {
  const footerIndex = home.blocks?.length - 1 ?? 0
  const socials = safeParse(data.site.socials) || {}
  const prefixSocials = prefixSocial(socials)
  const lowerCaseSocials = expandSocial(socials)
  return {
    logo: home.images?.[`b-${home.blocks[0]}`]?.logo || 'https://assets.stori.press/storipress/sp-placeholder.svg',
    desks: sortBy(data.desks, ({ order }) => order)
      .filter(({ slug }) => deskHasArticles.has(slug))
      .map(({ slug, resolvedSEO, ...rest }) => ({
        slug,
        url: `/desks/${resolvedSEO.slug ?? slug}`,
        resolvedSEO,
        ...rest,
      })),
    pages: sortBy(data.pages, ({ order }) => order).map(({ title, resolvedSEO, ...rest }) => {
      const slug = resolvedSEO.slug ?? slugify(title)
      return { slug, title, name: title, url: `/${slug}`, ...rest }
    }),
    site: {
      ...data.site,
      ...expandSocial(data.site.socials),
      socials: {
        ...prefixSocials,
        ...lowerCaseSocials,
      },
      homepage: socials.__homepage ? withHttps(socials.__homepage) : undefined,
    },
    hero: {
      texts: home.texts[`b-${home.blocks[0]}`] ?? {},
      images: home.images[`b-${home.blocks[0]}`] ?? {},
    },
    footer: {
      texts: home.texts[`b-${home.blocks[footerIndex]}`] ?? {},
      images: home.images[`b-${home.blocks[footerIndex]}`] ?? {},
    },
    portal: {
      texts: home.texts['@@portal'] ?? {},
      images: home.images['@@portal'] ?? {},
    },
  }
}
