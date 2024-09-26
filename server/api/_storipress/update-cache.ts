export default defineEventHandler(async () => {
  return updateCache()
})

async function updateCache() {
  const res = await Promise.allSettled([
    // we don't need to read the body
    $fetch.raw('/'),
    revalidateRecentArticles(),
  ])
  return {
    ok: true,
    results: flattenSettledPromises(res).map((res) => res.status),
  }
}

async function revalidateRecentArticles() {
  const articles = await $fetch('/_storipress/posts/__all.json')
  return await Promise.allSettled(
    articles.slice(0, 10).map(async (article: { slug: string }) => {
      try {
        // we don't need to read the body
        return await $fetch.raw(`/posts/${article.slug}`)
      } catch (error) {
        console.error(error)
        throw error
      }
    }),
  )
}

function flattenSettledPromises<T = unknown>(promises: PromiseSettledResult<T | PromiseSettledResult<T>[]>[]) {
  const result: PromiseSettledResult<T>[] = []
  for (const promise of promises) {
    if (isNestedSettledPromise<T>(promise) && promise.status === 'fulfilled') {
      result.push(...(promise.value as PromiseSettledResult<T>[]))
    } else {
      result.push(promise as PromiseSettledResult<T>)
    }
  }
  return result
}

function isNestedSettledPromise<T = unknown>(
  promise: unknown,
): promise is PromiseSettledResult<PromiseSettledResult<T>[]> {
  return (
    isSettledPromise(promise) &&
    promise.status === 'fulfilled' &&
    Array.isArray(promise.value) &&
    isSettledPromise(promise.value[0])
  )
}

function isSettledPromise(promise: unknown): promise is PromiseSettledResult<unknown> {
  return promise != null && typeof promise === 'object' && 'status' in promise
}
