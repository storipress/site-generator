import { getImageDataUrl } from './article-placeholder/liner-gradients'
import { createEmptyArticle } from './article-placeholder'

export function convertArticle(article: any) {
  if (!article) {
    return createEmptyArticle('latest')
  }

  const defaultURL = getImageDataUrl()
  if (!article.authors) {
    article.authors = []
  }
  return {
    ...article,
    blurb: article.blurb || article.seo?.meta?.description,
    authors: [
      ...article.authors?.map((author: any) => ({
        ...author,
        url: author.slug ? `/authors/${author.slug}` : '#',
        name: author.full_name,
      })),
      ...(article.shadow_authors?.map((name: string) => ({
        url: '#',
        name,
      })) ?? []),
    ],
    headline: article.cover?.url || defaultURL,
    headlineURL: article.cover?.url || defaultURL,
    headlineAlt: article.cover?.alt || '',
    headlineCaption: article.cover?.caption || '',
    desk: article.desk?.name || '',
    deskUrl: article.desk && `/desks/${getDesk(article.desk).slug}`,
    date: article.date || new Date(article.published_at),
    time: article.time || new Date(article.published_at),
  }
}

interface DeskLike {
  slug: string
  desk?: DeskLike
}

function getDesk(desk: DeskLike): DeskLike {
  return desk.desk ? desk.desk : desk
}
