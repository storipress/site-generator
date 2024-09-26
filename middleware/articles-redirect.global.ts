import { parseURL, withoutTrailingSlash } from 'ufo'
import type { Article } from '@storipress/sdk/helper'
import escapeRegex from 'escape-string-regexp'
import { otherSlugs } from '#generated/other-slugs'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.client) return

  const notArticle = to.name && to.name !== 'slug' && to.name !== 'article'
  if (notArticle) return

  const path = withoutTrailingSlash(to.path).split('/')
  const slug = path[path.length - 1]

  if (otherSlugs.includes(slug)) return

  const { resolveFromID } = useResourceResolver()
  const resourceID = { type: 'article', slug } as const
  const res = await resolveFromID(resourceID)

  const { pathname, search } = parseURL(to.fullPath)
  if (res) {
    if (withoutTrailingSlash(pathname) === withoutTrailingSlash(res.url)) return

    return navigateTo(withoutTrailingSlash(res.url) + search)
  }

  type Articles = (Article & { pathnames?: string[] })[]
  const articles: Articles = (await $fetch('/_storipress/posts/__all.json')) ?? []
  const slugRE = new RegExp(`/${escapeRegex(slug)}$`, 'i')

  const matchedArticle = articles.find(({ pathnames }) => {
    if (!pathnames?.length) return false

    return pathnames.find((path) => slugRE.test(path))
  })

  if (matchedArticle?.id) {
    const resourceID = { type: 'article', id: matchedArticle.id } as const
    const res = await resolveFromID(resourceID)

    if (res) return navigateTo(withoutTrailingSlash(res.url) + search)
  }

  throw createError({
    statusCode: 404,
    statusMessage: `Page Not Found within articles-redirect: ${to.fullPath}`,
    data: {
      resourceID,
      matchedArticle,
    },
  })
})
