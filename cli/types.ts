export interface MappingInfo {
  id: string
  template: string
  actualTemplate: string
  isFallback: boolean
  path: string
}

export interface MappingResult {
  front: MappingInfo[]
  article: MappingInfo[]
  page: MappingInfo[]
}
