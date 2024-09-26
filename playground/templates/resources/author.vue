<script lang="ts" setup>
import { withHttps } from 'ufo'
import { StaticBlockProvider } from '../../../components/static-block-provider'
import socialLinks from '../../../assets/images/socials'

const { SiteFooter, SiteNavbar } = useStoripressCompatInject()

const author = setupPage({ type: 'author' })

const socials = computed(() => author.value.socials || {})

useHead(() => {
  const title = author.value.full_name
  const description = `${author.value.full_name} articles`

  return {
    title,
    meta: [
      {
        name: 'description',
        content: description,
      },
      {
        property: 'og:title',
        content: title,
      },
      {
        property: 'og:description',
        content: description,
      },
    ],
  }
})

const { preload: articles, createLoadMore } = useArticleLoader({
  chunk: 4,
  preload: 12,
  condition: usePageMetaAsCondition(),
})

const website = computed(() => (author.value.website ? withHttps(author.value.website) : ''))

const $tracker = useTracker()
const $gtag = useGtag()
onMounted(() => {
  const resourceId = author.value.id

  $gtag.pageview({
    page_title: document.title,
    page_path: document.location.pathname,
    // @ts-expect-error custom dimension
    internal_id: `author.${resourceId}`,
  })

  $tracker.withReferer({
    name: 'author.seen',
    target_id: resourceId,
  })
})
</script>

<template>
  <div>
    <StaticBlockProvider block="hero">
      <SiteNavbar current-page="author" />
    </StaticBlockProvider>
    <div
      class="page-container flex items-start justify-center w-full"
      style="margin-top: var(--sp-nav-height, 5rem); color: #333"
    >
      <div
        class="author-wrapper md:flex-row sm:mx-8 md:mb-40 lg:mb-60 lg:ml-0 lg:mr-8 flex flex-col justify-between pt-8 mx-4"
      >
        <div class="author-container md:sticky lg:w-80 md:mb-8 w-full mb-6">
          <div class="flex items-center justify-start mb-4">
            <div class="author-avatar relative mr-6 overflow-hidden rounded-full">
              <img
                :src="author.avatar"
                loading="lazy"
                :alt="author.full_name"
                class="max-w-none absolute inset-0 object-cover object-center w-full h-full"
              />
            </div>
            <div class="author-name font-bold">
              <span class="inline-block w-full">{{ author.first_name }}</span
              ><span class="inline-block w-full">{{ author.last_name }}</span>
            </div>
          </div>
          <div class="author-bio prose lg:mb-5 mb-4 font-sans text-sm" style="color: #696969" v-html="author.bioHTML" />
          <div class="flex gap-4">
            <a v-if="socials.Facebook" :href="`https://${socials.Facebook}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="Facebook">
                <path :d="socialLinks.facebook" fill="#898989" />
              </svg>
            </a>
            <a v-if="socials.Twitter" :href="`https://${socials.Twitter}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="Twitter">
                <path :d="socialLinks.twitter" fill="#898989" />
              </svg>
            </a>
            <a
              v-if="socials.Instagram"
              :href="`https://${socials.Instagram}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="Instagram">
                <path :d="socialLinks.instagram" fill="#898989" />
              </svg>
            </a>
            <a v-if="socials.LinkedIn" :href="`https://${socials.LinkedIn}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="LinkedIn">
                <path :d="socialLinks.linkedin" fill="#898989" />
              </svg>
            </a>
            <a
              v-if="socials.Pinterest"
              :href="`https://${socials.Pinterest}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="Pinterest">
                <path :d="socialLinks.pinterest" fill="#898989" />
              </svg>
            </a>
            <a v-if="socials.Reddit" :href="`https://${socials.Reddit}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="Reddit">
                <path :d="socialLinks.reddit" fill="#898989" />
              </svg>
            </a>
            <a v-if="socials.Whatsapp" :href="`https://${socials.Whatsapp}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="Whatsapp">
                <path :d="socialLinks.whatsapp" fill="#898989" />
              </svg>
            </a>
            <a v-if="socials.YouTube" :href="`https://${socials.YouTube}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="YouTube">
                <path :d="socialLinks.youtube" fill="#898989" />
              </svg>
            </a>
            <a v-if="socials.TikTok" :href="`https://${socials.TikTok}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="TikTok">
                <path :d="socialLinks.tiktok" fill="#898989" />
              </svg>
            </a>
            <a v-if="socials.Geneva" :href="`https://${socials.Geneva}`" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" height="2rem" width="1.5rem" aria-label="Geneva">
                <path :d="socialLinks.geneva" fill="#898989" />
              </svg>
            </a>

            <a v-if="website" :href="website" target="_blank" rel="noopener noreferrer">
              <i class="icon-web text-2xl" style="color: #898989" aria-label="Website" />
            </a>
          </div>
        </div>
        <div class="article-container md:ml-36 flex flex-wrap items-start justify-start w-full">
          <ArticleBox v-for="article of articles" :key="article.slug" :article="article" />
          <InfiniteScroll v-slot="{ items }" class="contents" :source="createLoadMore">
            <ArticleBox v-for="item of items" :key="item.slug" :article="item" />
          </InfiniteScroll>
        </div>
      </div>
    </div>
    <SiteFooter :block="{ id: '@@footer' }" />
  </div>
</template>

<style lang="scss" scoped>
$sm: 640px;
$md: 768px;
$lg: 1070px;

@mixin sm {
  @media (min-width: $sm) {
    @content;
  }
}

@mixin md {
  @media (min-width: $md) {
    @content;
  }
}

@mixin lg {
  @media (min-width: $lg) {
    @content;
  }
}

.page-container {
  font-family: Standard, sans-serif;
}

.author-wrapper {
  max-width: min(100vw, 92rem);
}

.author-container {
  @include sm {
    max-width: 75vw;
    height: 100%;
  }

  @include md {
    max-width: none;
    margin-left: 5vw;
    height: 50vh;
    max-height: 60rem;
    top: calc(var(--sp-nav-height, 5rem) + 3rem);
  }
}

@mixin force-width($width) {
  min-height: $width;
  height: $width;
  width: $width;
  min-width: $width;
}

.author-avatar {
  @include force-width(5.25rem);

  @include sm {
    @include force-width(104px);
  }
}

.author-name {
  font-size: 2rem;
  line-height: 1.3;

  @include sm {
    font-size: 2.5rem;
    line-height: 1.25;
  }
}
</style>
