<script setup>
import { Axiom } from '@axiomhq/js'
import { serializeError } from 'serialize-error'
import { withoutTrailingSlash } from 'ufo'
import { LinkElement } from './display-components/article-elements'

const { SiteFooter, SiteNavbar, logo } = useStoripressCompatInject() ?? {}
const router = useRouter()
const route = useRoute()
const error = useError()

const axiom = new Axiom({
  token: 'xaat-ea2bdb03-5596-4c29-a197-9b6acc8974ab',
})
const browserInfo = {
  user_agent: navigator.userAgent,
  brands: navigator.userAgentData?.brands,
  platform: navigator.userAgentData?.platform,
  mobile: navigator.userAgentData?.mobile,
}

async function redirectIfFound() {
  const path = withoutTrailingSlash(route.path).split('/')
  const slug = path[path.length - 1]

  const articles = useGetAllArticles()
  await until(articles.pending).not.toBeTruthy()
  const targetArticle = articles.data.value?.find((article) => article.slug === slug)

  if (targetArticle) {
    router.replace(targetArticle.url)
  }
}

const message = computed(() => {
  if (error.value?.statusCode === 404) {
    return 'Uh oh… we can’t find that page.'
  }
  return 'Something went wrong.'
})

const { clientID } = useStoripress()

onBeforeMount(() => {
  axiom.ingest('customer_sites', {
    ...browserInfo,
    client_id: clientID,
    type: 'error',
    error: serializeError(error.value),
  })

  if (error.value?.statusCode === 404) {
    redirectIfFound()
  }
})
</script>

<template>
  <div class="not-found-page w-screen h-screen overflow-y-hidden">
    <SiteNavbar current-page="404" />
    <div class="md:px-14 md:flex-row bg-white-grey flex flex-col justify-between min-h-screen pt-16">
      <div class="error-message md:w-1/2 font-lato text-black-three md:p-0 px-4">
        <p class="md:mt-16 md:text-xl mt-4 text-lg font-light">
          {{ message }}
        </p>
        <h1 class="md:text-9xl text-7xl mt-4 font-light leading-tight">ERROR<br />{{ error?.statusCode ?? 500 }}</h1>
      </div>
      <div class="decoration-image md:w-1/2">
        <img src="./assets/images/404.svg" class="md:w-auto md:h-full w-full mt-auto" />
      </div>
      <div class="logo max-w-xs left-4 md:left-20 bottom-4 md:bottom-9 md:scale-150 fixed">
        <LinkElement href="/">
          <img :src="logo" />
        </LinkElement>
      </div>
    </div>
    <SiteFooter />
  </div>
</template>
