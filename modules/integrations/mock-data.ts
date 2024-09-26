/* used data
'integrations.[].key',
  'integrations.[].activated_at',
  'integrations.[].data',
  'site.name',
  'site.customer_site_domain',
  'site.description',
  'site.lang',
  'site.timezone',
  'site.__typename',
  'site.socials',
  'site.custom_domain',
  'site.favicon',
  'site.workspace',
  'site.plan',
  'site.subscription_setup_done',
  'home.resolvedSEO',
  'desks.[].resolvedSEO.__typename',
  'desks.[].resolvedSEO.slug',
  'desks.[].resolvedSEO.meta',
  'desks.[].resolvedSEO.og',
  'desks.[].resolvedSEO.ogImage',
  'desks.[].resolvedSEO.inject',
  'desks.[].id',
  'desks.[].seo',
  'pages.[].resolvedSEO.__typename',
  'pages.[].resolvedSEO.slug',
  'pages.[].resolvedSEO.meta',
  'pages.[].resolvedSEO.og',
  'pages.[].resolvedSEO.ogImage',
  'pages.[].resolvedSEO.inject',
  'pages.[].id',
  'pages.[].seo',
  'home.current',
  'home.seo' 
  */

export const mockGeneratorData = {
  site: {
    // need inject
    name: '##_SITE_NAME_##',
    customer_site_domain: '##_CUSTOMER_SITE_DOMAIN_##',
    custom_domain: '##_CUSTOM_DOMAIN_##',
    timezone: '##_TIMEZONE_##',
    workspace: '##_WORKSPACE_##',
    plan: '##_PLAN_##',

    // default value
    description: '',
    lang: 'en',
    subscription_setup_done: false,

    // default should be empty
    socials: '{}',
    favicon: null,
  },
  home: {
    key: 'home',
    // use for find logo
    // Safety: will fallback to default
    current: null,
    seo: '{}',
    resolvedSEO: {
      slug: '',
      meta: {
        title: '##_SITE_NAME_##',
        description: '##_SITE_DESCRIPTION_##',
      },
      og: {
        title: '##_SITE_NAME_##',
        description: '##_SITE_DESCRIPTION_##',
      },
      ogImage: '',
      inject: {
        header: '',
        footer: '',
      },
    },
  },
  // use to generate seo and html injection
  // Safety: new publication should not have these data
  desks: [],
  // use to generate seo and html injection
  // Safety: new publication should not have these data
  pages: [],
  // use to generate necessary integration, like Disqus
  // Safety: new publication should not have connected integrations
  integrations: [],
}

export { default as mockStyleData } from './style-data.json'
