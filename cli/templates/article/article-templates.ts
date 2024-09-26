import { mapKeys, mapValues, pipe } from 'remeda'
import { defineAsyncComponent } from 'vue'
import { basename, dirname } from 'pathe'

export const FORMATS = pipe(
  import.meta.glob('./article-template-*/index.js'),
  mapValues((val) => {
    return defineAsyncComponent(val)
  }),
  mapKeys((p) => {
    return basename(dirname(p))
  }),
)

export const FORMATS_OTHER = pipe(
  import.meta.glob('./other-template-*/index.js'),
  mapValues((val) => {
    return defineAsyncComponent(val)
  }),
  mapKeys((p) => {
    return basename(dirname(p))
  }),
)
