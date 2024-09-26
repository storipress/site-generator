import type { Article, GeneratorDataQuery } from '~/../graphql-operations'
import { LayoutFragmentFragment as LayoutFragment } from '~/../graphql-operations'

export { LayoutFragment }

export type GeneratorRawData = GeneratorDataQuery

export interface Design {
  blocks: string[]
  blockStates: Record<string, { type: string; desks: string[] }>
  styles: {
    name?: string
    styles?: Record<string, any>
    children?: any
  }
  images: Record<string, any>
  texts: Record<string, any>
}

export interface Meta {
  title: string
  description: string
}

export interface Injection {
  header: string
  footer: string
}

export interface SEO {
  meta?: Meta
  og?: Meta
  ogImage: string
  slug?: string
  inject?: Injection
}

export interface DisplayDesk {
  id: string
  url: string
  name: string
  slug: string
  seo: Required<SEO>
}

export interface ExpansionArticle {
  url: string
  time: Date
  date: Date
  desk: string
  _desk: Partial<Article['desk']>
  deskUrl: string
  embeds: string[]
  paidContent: {
    content: string
  }
  stage: Partial<Article['stage']>
  layout: Partial<Article['layout']>
}

export type NormalizedArticle = Partial<Omit<Article, keyof ExpansionArticle> & ExpansionArticle>

export interface Layout {
  name?: string
  template?: string
  data: any
}

export interface RawUser {
  __typename?: 'User' | undefined
  id: string
  avatar?: string | null | undefined
  bio?: string | null | undefined
  website?: string | null | undefined
  facebook?: string | null | undefined
  twitter?: string | null | undefined
  socials?: Record<string, string> | null | undefined
  name: string
}

export interface DisplayUser extends RawUser {
  slug: string
  url: string
}

export interface NormalizedSocial {
  facebook?: string | null
  twitter?: string | null
  instagram?: string | null
  twitterUser?: string | null
  linkedin?: string | null
  youtube?: string | null
  pintrest?: string | null
  whatsapp?: string | null
  reddit?: string | null
  tiktok?: string | null
  geneva?: string | null
}
