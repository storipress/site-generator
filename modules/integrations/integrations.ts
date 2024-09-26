import { validateHTML } from './validate-html'
import type { AdSenseInfo } from './extract-adsense'
import { extractAdSense } from './extract-adsense'

export interface GAConfig {
  id: string
  anonymous: boolean
}

export interface InjectConfig {
  header: string
  footer: string
}

export interface AdSenseConfig extends AdSenseInfo {
  adsTxt: string
  page: boolean
  front: boolean
}

export interface MailChimpConfig {
  action: string
}

export interface MailConfig {
  action: string
  strategy: 'jsonp' | 'ajax' | 'form'
  provider: string | null
  fieldName: string
}

export interface DisqusConfig {
  shortname: string
}

export interface Integration {
  ga: GAConfig
  inject: InjectConfig
  adsense: AdSenseConfig
  mailchimp: MailChimpConfig
  mail: MailConfig
  disqus: DisqusConfig
}

interface Extractor<K extends keyof Integration> {
  key: K
  alias?: keyof Integration
  handler: (raw: any, key: string) => Integration[K]
}

const MAIL_PROVIDER: Record<string, Pick<MailConfig, 'strategy' | 'provider' | 'fieldName'>> = {
  mailchimp: {
    strategy: 'jsonp',
    provider: 'mailchimp',
    fieldName: 'EMAIL',
  },
  convertkit: {
    strategy: 'ajax',
    provider: 'convertkit',
    fieldName: 'email_address',
  },
}

const extractors: Record<string, Extractor<keyof Integration>> = {
  'google-analytics': {
    key: 'ga',
    handler(raw: any) {
      return {
        id: raw.tracking_id || '',
        anonymous: raw.anonymous ?? false,
      }
    },
  },
  'code-injection': {
    key: 'inject',
    handler(raw: any) {
      return {
        header: raw.header && validateHTML(raw.header) ? raw.header : '',
        footer: raw.footer && validateHTML(raw.footer) ? raw.footer : '',
      }
    },
  },
  'google-adsense': {
    key: 'adsense',
    handler(raw: any) {
      return {
        ...extractAdSense(raw.code),
        adsTxt: raw['ads.txt'] ?? null,
        page: raw.scopes?.articles ?? false,
        front: raw.scopes?.['front-page'] ?? false,
      }
    },
  },
  mailchimp: {
    key: 'mailchimp',
    alias: 'mail',
    handler(raw: any) {
      return {
        action: raw.action,
      }
    },
  },
  disqus: {
    key: 'disqus',
    handler(raw: any) {
      return {
        shortname: raw.shortname,
      }
    },
  },
  mail: {
    key: 'mail',
    handler(raw: any, key: string) {
      const providerConfig = MAIL_PROVIDER[key === 'mailchimp' ? 'mailchimp' : raw.provider] ?? {
        strategy: 'form',
        provider: null,
        fieldName: 'email',
      }

      return {
        action: raw.action,
        ...providerConfig,
      }
    },
  },
}

const DEFAULT_INTEGRATION: Integration = {
  ga: {
    id: '',
    anonymous: false,
  },
  inject: {
    header: '',
    footer: '',
  },
  adsense: {
    id: '',
    script: '',
    adsTxt: '',
    page: false,
    front: false,
  },
  mailchimp: {
    action: '',
  },
  mail: {
    action: '',
    strategy: 'form',
    provider: null,
    fieldName: 'email',
  },
  disqus: {
    shortname: '',
  },
}

interface GeneratorDataQuery {
  integrations: {
    __typename?: 'Integration'
    /** determinate whether the integration is activated or not */
    activated_at?: any | null
    /** integration data */
    data: any
    /** integration key */
    key: string
  }[]
}
export function extractIntegrations({ integrations }: GeneratorDataQuery): Integration {
  const extracted = { ...DEFAULT_INTEGRATION }
  for (const integration of integrations) {
    const extractor = extractors[integration.key]
    if (!extractor || !integration.activated_at) {
      continue
    }
    const data = JSON.parse(integration.data)
    // @ts-expect-error don't know how to type it
    extracted[extractor.key] = extractor.handler(data, extractor.key)
    if (extractor.alias) {
      // @ts-expect-error don't know how to type it
      extracted[extractor.alias] = extractors[extractor.alias].handler(data, extractor.key)
    }
  }
  return extracted
}
