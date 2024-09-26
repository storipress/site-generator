import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import fse from 'fs-extra'
import { dedent } from 'ts-dedent'
import * as Sentry from '@sentry/serverless'
import { createCommonJS } from 'mlly'
import invariant from 'tiny-invariant'
import type { OtherPage } from '../schema/other-page'
import { GetDesignDocument, GetLayoutsDocument, GetPagesDocument } from '../graphql-operations'
import { client } from '../api/apollo'
import defaultFront from '../playground/utils/default-front.json'
import { createPagesMapping } from './page-map.ts'
import { BlockMapping } from './block-mapping.ts'
import { generatedPath } from './helpers'
import type { MappingInfo, MappingResult } from './types.ts'
import { ARTICLE_FALLBACK, createTemplateInfo } from './utils/MappingInfo.ts'

Sentry.init({
  dsn: 'https://f39b6c866a004b1084b5504f6cc0995b@o930441.ingest.sentry.io/4505464489967616',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

const { __dirname } = createCommonJS(import.meta.url)

function getDesign() {
  return client.query({ query: GetDesignDocument })
}

function getPages() {
  return client.query({ query: GetPagesDocument })
}

function getLayouts() {
  return client.query({ query: GetLayoutsDocument })
}

async function generate() {
  const { data: designData } = await getDesign()
  const { data: pagesData } = await getPages()
  const { data: layoutsData } = await getLayouts()
  const mappingResult: MappingResult = {
    front: [],
    article: [],
    page: [],
  }

  let parseDesign = JSON.parse(designData.design?.current)
  if (!parseDesign?.blocks || parseDesign.blocks.length === 0) {
    parseDesign = defaultFront
  }
  const layoutList = layoutsData.layouts
  const pageList = pagesData.pages

  const blocks: string[] = parseDesign.blocks
  const blockStates = blocks.map((key) => {
    return {
      key,
      ...parseDesign.blockStates[key],
    }
  })

  if (blockStates.length > 0) {
    blockStates.forEach((block) => {
      if (!block.type) {
        return
      }
      if (BlockMapping.block[block.type]) {
        const blockDir = BlockMapping.block[block.type]
        const destDir = `./playground/generated/front/${block.key}`

        if (fs.existsSync(blockDir)) {
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true })
          }
          fse.copy(blockDir, destDir)
        }

        const info: MappingInfo = {
          id: block.key,
          template: block.type,
          actualTemplate: block.type,
          isFallback: false,
          path: `./front/${block.key}`,
        }

        mappingResult.front.push(info)
      }
    })
  }

  invariant(blocks.length > 0, 'No blocks found in design')
  const heroBlock = blocks[0]
  const blockMapping = dedent`
    import type { Component } from 'vue'
    import { defineAsyncComponent } from 'vue'
    import HeroBlock from './${heroBlock}'

    interface Block{
      component: Component
      id: string
    }

    export const BLOCKS: Readonly<Block[]> = Object.freeze([
      {
        component: HeroBlock,
        id: ${JSON.stringify(heroBlock)},
      },
      ${blocks
        .slice(1)
        .map((block) => `{component: defineAsyncComponent(() => import('./${block}')), id: ${JSON.stringify(block)}},`)
        .join('\n')}
    ])

    export {Navbar} from './${blocks[0]}'
    export {default as Footer} from './${blocks.at(-1)}'
  `

  await fse.writeFile(generatedPath`front/index.ts`, blockMapping)

  if (layoutList.length > 0) {
    layoutList.forEach((layout) => {
      const destDir = generatedPath`article/article-template-${layout.id}`
      const { info, templateDir } = createTemplateInfo({
        id: layout.id,
        template: layout.template,
        fallback: ARTICLE_FALLBACK,
        path: `./article/article-template-${layout.id}`,
        pathMapping: BlockMapping.article,
      })

      mappingResult.article.push(info)

      if (fs.existsSync(templateDir)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }

        fse.copy(templateDir, destDir)
      }
    })
  }

  const pageMapping: Record<string, OtherPage> = await createPagesMapping(pageList, mappingResult)

  fs.writeFileSync(
    generatedPath`other-slugs.ts`,
    `export const otherSlugs: string[] = ${JSON.stringify(Object.keys(pageMapping), null, 2)}`,
  )
  fs.writeFileSync(
    generatedPath`other-mapping.ts`,
    dedent`
      import type { OtherPage } from '../../schema/other-page' 
      export { otherSlugs } from './other-slugs'
      export const otherMapping: Record<string, OtherPage> = ${JSON.stringify(pageMapping, null, 2)}
    `,
  )

  await fse.copy(path.resolve(__dirname, './templates'), generatedPath())
  await fse.writeJSON(generatedPath`mapping.json`, mappingResult, { spaces: 2 })
}

generate()
