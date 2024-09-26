import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { relative, resolve } from 'node:path'
import { createCommonJS } from 'mlly'
import { globby } from 'globby'
import { compileString } from 'sass'
import postcss from 'postcss'
import unocssPlugin from '@unocss/postcss'
import presetUno from '@unocss/preset-uno'
import { match } from 'ts-pattern'

const { __dirname } = createCommonJS(import.meta.url)

const rootDir = resolve(__dirname, '../')
const srcDir = resolve(rootDir, 'Builder-Blocks/')
const mixinPath = resolve(__dirname, './_mixins.scss')
const mixinURL = pathToFileURL(mixinPath)
const processor = postcss([
  unocssPlugin({
    configOrPath: {
      presets: [presetUno({})],
    },
  }),
])

async function generateStylesMapping() {
  const mapping: Record<string, Record<string, string>> = {}
  const renderStyle = createRenderer(await fs.readFile(mixinPath, 'utf-8'))
  const paths = await globby(`${srcDir}/ArticleComponents/*/*/style.scss`)
  for (const path of paths) {
    const splits = path.split('/')
    const key = splits[splits.length - 3]
    const styleKey = splits[splits.length - 2]
    mapping[key] = mapping[key] || {}
    mapping[key][styleKey] = await renderStyle(await fs.readFile(path, 'utf-8'), path)
  }
  mapping.blockquote = Object.fromEntries(Object.entries(mapping.blockquote).sort())
  mapping.dropcap = Object.fromEntries(Object.entries(mapping.dropcap).sort())
  await fs.writeFile('./cli/styles-mapping.json', JSON.stringify(mapping, null, 2))
}

async function generate() {
  let mapping: Record<string, Record<string, string>> = { block: {}, article: {}, page: {} }
  const paths = await globby(`${srcDir}/**/*/block/index.js`)
  paths.forEach((path) => {
    if (path.includes('boilerplate')) {
      return
    }
    const splits = path.split('/')
    const pathConcat = splits.slice(0, splits.length - 1).join('/')
    const key = splits[splits.length - 3].replace(/^article-/, '')
    const group = splits.at(-4)
    const groupKey = match(group)
      .with('ArticleTemplates', () => 'article')
      .with('PageTemplates', () => 'page')
      .otherwise(() => 'block')
    mapping[groupKey][key] = `./${relative(rootDir, pathConcat)}`
  })

  mapping = Object.fromEntries(
    Object.entries(mapping).map(([key, innerMapping]) => [
      key,
      Object.fromEntries(Object.entries(innerMapping).sort()),
    ]),
  )

  await fs.writeFile(
    './cli/block-mapping.ts',
    `export const BlockMapping: Record<'article' | 'block' | 'page', Record<string, string>> = ${JSON.stringify(
      mapping,
      null,
      2,
    )}`,
  )
  await fs.writeFile('./cli/block-mapping.json', JSON.stringify(mapping, null, 2))
}

function createRenderer(mixin: string) {
  async function renderStyle(style: string, from: string) {
    const pcss = compileString(style.replace('&nbsp', ' '), {
      url: new URL('file://style.scss'),
      importer: {
        canonicalize(url) {
          if (url.replace('file://style.scss/', '') === '@storipress/article/mixins') {
            return mixinURL
          }
          return null
        },
        load(url) {
          if (url.href === mixinURL.href) {
            return { contents: mixin, syntax: 'scss' }
          }
          return null
        },
      },
    }).css.toString()

    const res = await processor.process(pcss, { from }).then((result) => result.css)
    const lines = res.split('\n')
    if (lines[0].startsWith('@charset')) {
      lines.shift()
    }
    return lines.join('\n')
  }

  return renderStyle
}

generate()
generateStylesMapping()
