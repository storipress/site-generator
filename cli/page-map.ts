import { Array, Effect, Option, Record, Tuple, pipe } from 'effect'
import { renderPage } from '@storipress/render-helper/index.mts'
import { RawOtherPageDataSchema } from '../schema/other-page.ts'
import type { OtherPage } from '../schema/other-page.ts'
import { BlockMapping } from './block-mapping.ts'
import { FileSystem } from './services/FileSystem.ts'
import type { GetPagesQuery } from './handler/graphql-operations.ts'
import type { MappingResult } from './types.ts'
import { generatedPath, parseSchemaJson } from './helpers.ts'
import { PAGE_FALLBACK, createTemplateInfo } from './utils/MappingInfo.ts'

export function createPagesMapping(pageList: GetPagesQuery['pages'], mappingResult: MappingResult) {
  return Effect.runPromise(pipe(createPagesMapping$(pageList, mappingResult), Effect.provide(FileSystem.Live)))
}

export function createPagesMapping$(
  pageList: GetPagesQuery['pages'],
  mappingResult: MappingResult,
): Effect.Effect<Record<string, OtherPage>, never, FileSystem> {
  if (pageList.length === 0) {
    return Effect.succeed({})
  }

  return pipe(
    pageList,
    Array.map((page) => {
      return pipe(
        Effect.gen(function* ($) {
          const fs = yield* $(FileSystem)
          const current = yield* $(parseSchemaJson(RawOtherPageDataSchema, page.current))
          const seo = JSON.parse(page.seo)
          const title = page.title
          const { html, segments } = current ? renderPage(current.editorContent) : { html: undefined, segments: [] }
          const layout = {
            id: page.id,
            template: current?.template,
          }

          const { info, templateDir: pageDir } = createTemplateInfo({
            id: page.id,
            template: current?.template,
            fallback: PAGE_FALLBACK,
            path: `./article/other-template-${page.id}`,
            pathMapping: BlockMapping.page,
          })
          const destDir = generatedPath`article/other-template-${page.id}`

          mappingResult.page.push(info)

          const pageExist = yield* $(fs.exists(pageDir))

          if (!pageExist) {
            return Option.none()
          }

          yield* $(fs.mkdir(destDir, { recursive: true }), Effect.unlessEffect(fs.exists(destDir)))

          yield* $(fs.copy(pageDir, destDir))

          return Option.some(
            Tuple.make(seo.slug as string, {
              title,
              seo,
              pageTitle: current?.templateData?.title,
              cover: {
                url: current?.templateData?.headlineURL,
                alt: current?.templateData?.headlineAlt,
                caption: current?.templateData?.caption,
              },
              layout,
              html: html ?? '',
              segments,
            } satisfies OtherPage),
          )
        }),
        Effect.annotateLogs('pageId', page.id),
      )
    }),
    Effect.all,
    Effect.map((optionTuples) => pipe(optionTuples, Array.getSomes, Record.fromEntries)),
  )
}
