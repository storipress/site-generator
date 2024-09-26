import type { TypePolicies } from '@apollo/client/core'
import { gql, makeReference } from '@apollo/client/core'
import slugify from '@sindresorhus/slugify'

import { resolveSEOFromRaw } from './seo'
import type { Site } from '~~/../graphql-operations'

interface TemplateData {
  title: string
  description: string
  headlineURL: string
  headlineAlt: string
  caption: string
}

interface OtherData {
  template: string
  templateData: TemplateData
  editorContent: object
  elements: object
  styles: object
  html: string
  plaintext: string
  embeds: string[]
}

export const typeDefs = gql`
  type SEOMeta {
    title: String!
    description: String!
  }

  type Injection {
    header: String!
    footer: String!
  }

  type ResolvedSEO {
    meta: SEOMeta!
    og: SEOMeta!
    ogImage: String!
    slug: String!
    inject: Injection!
  }

  extend type Article {
    resolvedSEO: ResolvedSEO!
  }

  extend type Page {
    resolvedSEO: ResolvedSEO!
  }

  extend type Desk {
    resolvedSEO: ResolvedSEO!
  }

  extend type Design {
    resolvedSEO: ResolvedSEO!
  }
`

const ROOT_REFERENCE = makeReference('ROOT_QUERY')

export const typePolicies: TypePolicies = {
  Design: {
    fields: {
      resolvedSEO: {
        read(_, { readField }) {
          const { name = '', description } = readField<Site>('site', ROOT_REFERENCE) ?? {}
          const title = name || 'Front Page'

          let seo: {
            og:
              | {
                  matched: boolean
                  title: string
                  description: string
                }
              | undefined
          } = { og: undefined }
          try {
            const seoStr = readField<string>('seo')
            seo = JSON.parse(seoStr || '{}')
          } catch (error) {
            // empty
          }

          const resolvedSEO = resolveSEOFromRaw({
            name,
            base: {
              title,
              description: description || '',
            },
            seo,
            appendSite: false,
          })

          const og = {
            title: seo.og?.matched === false ? seo.og?.title : resolvedSEO.meta.title,
            description: seo.og?.matched === false ? seo.og?.description : resolvedSEO.meta.description,
          }

          return {
            __typename: 'ResolvedSEO',
            ...resolvedSEO,
            og,
          }
        },
      },
    },
  },
  Desk: {
    fields: {
      resolvedSEO: {
        read(_, { readField }) {
          const { name = '', description } = readField<Site>('site', ROOT_REFERENCE) ?? {}
          const title = readField<string>('name') ?? ''
          const seo = readField<string>('seo')
          const slug = readField<string>('slug')

          return {
            __typename: 'ResolvedSEO',
            ...resolveSEOFromRaw({
              name,
              base: {
                title,
                description: description || '',
              },
              defaultSlug: slug,
              seo: JSON.parse(seo || '{}'),
            }),
          }
        },
      },
    },
  },
  Article: {
    fields: {
      resolvedSEO: {
        read(_, { readField }) {
          const site = readField<Site>('site', ROOT_REFERENCE)
          const title = readField<string>('title')
          const slug = readField<string>('slug')
          const plaintext = readField<string>('plaintext')
          const seo = readField<string>('seo')
          const cover = JSON.parse(readField<string>('cover') || '{}')

          return {
            __typename: 'ResolvedSEO',
            ...resolveSEOFromRaw({
              name: site?.name || '',
              base: {
                title: title || '',
                description: plaintext || '',
              },
              seo: {
                ogImage: cover.url ?? '',
                ...JSON.parse(seo || '{}'),
                slug,
              },
            }),
          }
        },
      },
    },
  },
  Page: {
    fields: {
      resolvedSEO: {
        read(_, { readField }) {
          const site = readField<Site>('site', ROOT_REFERENCE)
          const title = readField<string>('title')
          const current: OtherData = JSON.parse(readField<string>('current') ?? '{}')
          const seo = readField<string>('seo')

          return {
            __typename: 'ResolvedSEO',
            ...resolveSEOFromRaw({
              name: site?.name || '',
              defaultSlug: slugify(title ?? ''),
              base: {
                title: current.templateData?.title || '',
                description: current.templateData?.description || '',
              },
              seo: JSON.parse(seo || '{}'),
            }),
          }
        },
      },
    },
  },
}
