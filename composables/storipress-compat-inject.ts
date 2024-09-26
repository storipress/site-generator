import type { Component } from 'vue'
import { useNuxtApp } from '#imports'

interface Block {
  id: string
  component: Component
}

interface FrontDataItem<T = any> {
  texts: Record<string, T>
  images: Record<string, T>
}

interface Site {
  name: string
  socials: Record<string, string>
  lang: string
  homepage?: string
}

interface FrontData {
  portal: Record<string, any>
  staticBlocks: Record<string, FrontDataItem>
  blocks: FrontDataItem<Record<string, any>>
  blockDesks: Record<string, string[]>
  pages: URLItem[]
  desks: URLItem[]
  fallback: { layout: string }
  elementsMap: Record<string, Record<string, string>>
  site: Site
}

interface URLItem {
  id: string
  url: string
  name: string
  slug: string
}

interface StoripressCompatInjection {
  logo: string
  blocks: readonly Block[]
  formats: Record<string, Component>
  formatsOther: Record<string, Component>
  subscribes: Record<string, Component>
  SiteNavbar: Component
  SiteFooter: Component
  frontData: FrontData
}

export function useStoripressCompatInject(): StoripressCompatInjection {
  return useNuxtApp().$storipressCompatInject
}
