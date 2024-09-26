import blockObj from 'identity-obj-proxy'

export function useStoripressCompatInject() {
  return {
    blocks: [
      {
        id: blockObj.blockId,
      },
    ],
    frontData: {
      portal: {
        texts: {},
        images: {},
      },
      staticBlocks: {
        hero: {
          texts: {},
          images: {
            logo: 'https://assets-global.website-files.com/60b9f1d6f8c3171bccdb0910/633cda31667e8f1887232c92_SP-Logo-BLACK.svg',
          },
        },
        footer: {
          texts: {
            copyright: blockObj,
          },
          images: {
            logo: 'https://assets.stori.press/storipress/sp-placeholder.svg',
          },
        },
      },
      blocks: {
        texts: {
          [`b-${blockObj.blockId}`]: blockObj,
        },
        images: {
          [`b-${blockObj.blockId}`]: {
            logo: 'https://assets-global.website-files.com/60b9f1d6f8c3171bccdb0910/633cda31667e8f1887232c92_SP-Logo-BLACK.svg',
          },
        },
      },
      blockDesks: {
        [blockObj.blockId]: ['featured', 'news', 'latest', 'latest'],
      },
      pages: [
        {
          slug: 'about',
          title: 'About Us',
          name: 'About Us',
          url: '/about',
          id: '1',
          order: 1,
        },
        {
          slug: 'privacy-policy',
          title: 'Privacy Policy',
          name: 'Privacy Policy',
          url: '/privacy-policy',
          __typename: 'Page',
          id: '2',
          order: 2,
        },
        {
          slug: 'new-page',
          title: 'Untitled',
          name: 'Untitled',
          url: '/new-page',
          __typename: 'Page',
          id: '3',
          order: 3,
        },
      ],
      desks: Array.from({ length: 5 }, (v, i) => ({
        slug: `desk-${i}`,
        url: `/desks/desk-${i}`,
        resolvedSEO: {
          slug: `desk-${i}`,
          meta: {
            title: `Desk-${i}`,
            description: `desk ${i}`,
          },
          og: {
            title: `Desk-${i}`,
            description: `desk ${i}`,
          },
          ogImage: '',
          inject: {
            header: '',
            footer: '',
          },
        },
        id: i,
        name: `Desk ${i}`,
        seo: null,
        order: 0,
        articles_count: 2,
        desks: [],
      })),
      fallback: {
        layout: '1',
      },
      elementsMap: {
        '1': {
          dropcap: 'out',
          blockquote: 'regular',
        },
      },
      site: {
        name: 'Storipress',
        description: '',
        socials: {
          Facebook: 'https://www.facebook.com',
          Twitter: 'https://test.com',
          Instagram: 'https://ig.com',
          LinkedIn: null,
          YouTube: null,
          Pinterest: null,
          Whatsapp: null,
          Reddit: null,
          TikTok: null,
          Geneva: null,
          facebook: 'https://www.facebook.com',
          twitter: 'https://test.com',
          twitterUser: null,
          instagram: 'https://ig.com',
          linkedin: null,
          youtube: null,
          pintrest: null,
          whatsapp: null,
          reddit: null,
          tiktok: null,
          geneva: null,
        },
        custom_domain: null,
        favicon:
          'https://assets-global.website-files.com/60b9f1d6f8c3171bccdb0910/633cda31667e8f1887232c92_SP-Logo-BLACK.svg',
        workspace: 'test-01-peik',
        customer_site_domain: 'test-01-peik-cdn.storipress.dev',
        timezone: 'Pacific/Honolulu',
        plan: 'blogger',
        lang: 'en-US',
        subscription_setup_done: false,
        facebook: null,
        twitter: null,
        twitterUser: null,
        instagram: null,
        linkedin: null,
        youtube: null,
        pintrest: null,
        whatsapp: null,
        reddit: null,
        tiktok: null,
        geneva: null,
      },
    },
  }
}

export function useStoripress() {
  return {
    site: {
      name: 'Storipress',
      description: 'This is site description',
      socials: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        linkedin: '#',
        youtube: '#',
        pinterest: '#',
        whatsapp: '#',
        reddit: '#',
        tiktok: '#',
        geneva: '#',
      },
      email: 'hello@storipress.com',
    },
  }
}

export function useNProgress() {}

export function useHead() {}

export function usePaywall() {}

export function useArticleFilter() {}

export function useResourcePageMeta() {
  const pageMeta = ref({
    type: '',
    route: '',
    meta: '',
  })

  return pageMeta
}

export function useAutoKey() {
  return undefined
}

export function useLazySearchClient() {
  return ''
}

export function useNormalizedArticle() {
  return {
    desk: '',
    condition: [{ type: 'featured', value: false }],
    article: computed(() => {
      return {
        __isEmpty: false,
        title: '',
        slug: '',
        url: '',
        featured: false,
        blurb: '',
        desk: '',
        deskUrl: '',
        authors: [],
        cover: { url: '', alt: '', caption: '', focus: { x: 0, y: 0 } },
        headline: '',
        headlineAlt: '',
        headlineCaption: '',
        headlineFocus: { x: 0, y: 0 },
        time: new Date('2000-01-01T00:00:00.000Z'),
      }
    }),
    normalizedArticle: computed(() => {
      return {
        __isEmpty: false,
        title: 'Red Coats Are the Latest Big Trend Says Top',
        blurb: 'Fusce lacinia dictum nulla eu pulvinar. Etiam ut efficitur tellus, sed tristique lectus',
        slug: '',
        url: '',
        featured: false,
        desk: '',
        deskUrl: '',
        authors: [
          {
            name: 'Storipress',
            url: '',
            full_name: 'Storipress',
            avatar: '',
          },
        ],
        cover: { url: '', alt: '', caption: '', focus: { x: 0, y: 0 } },
        headline: 'https://picsum.photos/id/237/1000/700',
        headlineAlt: '',
        headlineCaption: '',
        headlineFocus: { x: 0, y: 0 },
        time: new Date('2000-01-01T00:00:00.000Z'),
      }
    }),
  }
}
