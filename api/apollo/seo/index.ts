import defaultSlugify from '@sindresorhus/slugify'

import type { EditableSEO, Meta, SEO } from './types'

export interface ResolveSEOOptions {
  name: string
  base: Meta
  seo: Partial<EditableSEO>
  appendSite?: boolean
  defaultSlug?: string
  slugify?: typeof defaultSlugify
}

/// SEO format use in builder
export type RawSEO = EditableSEO

export interface ResolveSEOFromRaw extends Omit<ResolveSEOOptions, 'seo'> {
  seo?: RawSEO
}

export function resolveSEO({
  name,
  base,
  seo,
  appendSite = true,
  defaultSlug,
  slugify = defaultSlugify,
}: ResolveSEOOptions): Required<SEO> {
  const { meta = base, og, ogImage, inject, slug } = seo
  const { header = '', footer = '' } = inject ?? {}
  const resolvedMeta = {
    title: name && appendSite ? `${meta.title || base.title} - ${name}` : meta.title || base.title,
    description: meta.description || base.description,
  }

  return {
    slug: slug || defaultSlug || slugify(base.title),
    meta: resolvedMeta,
    og: {
      title: og?.matched ? resolvedMeta.title : og?.title || resolvedMeta.title,
      description: og?.matched ? resolvedMeta.description : og?.description || resolvedMeta.description,
    },
    ogImage: ogImage || '',
    inject: {
      header,
      footer,
    },
  }
}

export function resolveSEOFromRaw({ seo, ...opts }: ResolveSEOFromRaw): Required<SEO> {
  return resolveSEO({
    seo: { ogImage: '', ...seo },
    appendSite: false,
    ...opts,
  })
}
