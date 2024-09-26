export interface Meta {
  title: string
  description: string
}

export interface EditableMeta extends Meta {
  matched?: boolean
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

export interface EditableSEO {
  meta?: EditableMeta
  og?: EditableMeta
  ogImage?: string
  slug?: string
  inject?: Injection
}
