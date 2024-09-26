import { resolveAlias } from '@nuxt/kit'
import fse from 'fs-extra'
import defaultFront from '../../playground/utils/default-front.json'
import { getStyleData } from './api-proxy'
import { fixArticleStyle } from './helpers'

export async function extractDesign(homeDesign: any) {
  const homeStyle = homeDesign?.styles?.children || defaultFront.styles.children || {}
  const { data: styleData } = await getStyleData()
  const styleMapping = await getStyleMapping()
  const elements = {
    dropcap: new Set<string>(),
    blockquote: new Set<string>(),
  }
  const layoutsStyle = styleData.layouts.reduce((acc, { id, data }) => {
    const parsedData = JSON.parse(data || '{}')
    elements.blockquote.add(parsedData.elements?.blockquote || 'regular')
    elements.dropcap.add(parsedData.elements?.dropcap || 'none')

    const styleTree = parsedData.styles

    return styleTree
      ? {
          ...acc,
          [`article-template-${id}`]: {
            name: `article-template-${id}`,
            styles: {},
            children: {
              article: fixArticleStyle({
                name: 'article',
                styles: styleTree.styles,
                children: styleTree.children,
              }),
            },
          },
        }
      : acc
  }, {})
  const pagesStyle = styleData.pages.reduce((acc, { id, current }) => {
    const styleTree = JSON.parse(current || '{}').styles
    return styleTree
      ? {
          ...acc,
          [`other-template-${id}`]: {
            name: `other-template-${id}`,
            styles: {},
            children: {
              article: fixArticleStyle({
                name: 'article',
                styles: styleTree.styles,
                children: styleTree.children,
              }),
            },
          },
        }
      : acc
  }, {})

  const elementStylesParts = [
    ...Array.from(elements.dropcap).map((key) => {
      return styleMapping.dropcap[key]
    }),
    ...Array.from(elements.blockquote).map((key) => {
      return styleMapping.blockquote[key]
    }),
  ]
  return { elementStylesParts, homeStyle, layoutsStyle, pagesStyle }
}

async function getStyleMapping(): Promise<Record<string, Record<string, string>>> {
  try {
    return await fse.readJSON(resolveAlias('#sp-cli/styles-mapping.json'))
  } catch (e) {
    console.error(e)
    return {
      blockquote: {},
      dropcap: {},
    }
  }
}
