import type { MappingInfo } from '../types'

interface AddTemplateInput {
  id: string
  template?: string
  fallback: string
  path: string
  pathMapping: Record<string, string>
}

export const ARTICLE_FALLBACK = 'basically-one'
export const PAGE_FALLBACK = 'other-page-nophoto'

export function createTemplateInfo({ id, template, fallback, path, pathMapping }: AddTemplateInput) {
  let templateDir = pathMapping[fallback]

  const info: MappingInfo = {
    id,
    template: template as string,
    actualTemplate: fallback,
    isFallback: true,
    path,
  }

  if (template && pathMapping[template]) {
    templateDir = pathMapping[template]
    info.isFallback = false
    info.actualTemplate = template
  }

  return {
    info,
    templateDir,
  }
}
