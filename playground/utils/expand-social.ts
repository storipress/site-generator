import type { NormalizedSocial } from './types'

interface RawSocial {
  Facebook?: string | null
  Instagram?: string | null
  Twitter?: string | null
  LinkedIn?: string | null
  YouTube?: string | null
  Pinterest?: string | null
  Whatsapp?: string | null
  Reddit?: string | null
  TikTok?: string | null
  Geneva?: string | null
}

export function expandSocial(social: RawSocial | null = {}): NormalizedSocial {
  social ??= {}

  const {
    Facebook: facebook = null,
    Instagram: instagram = null,
    Twitter: twitter = null,
    LinkedIn: linkedin = null,
    YouTube: youtube = null,
    Pinterest: pintrest = null,
    Whatsapp: whatsapp = null,
    Reddit: reddit = null,
    TikTok: tiktok = null,
    Geneva: geneva = null,
  } = social
  return {
    facebook: prefixHttps(facebook),
    twitter: prefixHttps(twitter),
    twitterUser: extractTwitterUser(twitter),
    instagram: prefixHttps(instagram),
    linkedin: prefixHttps(linkedin),
    youtube: prefixHttps(youtube),
    pintrest: prefixHttps(pintrest),
    whatsapp: prefixHttps(whatsapp),
    reddit: prefixHttps(reddit),
    tiktok: prefixHttps(tiktok),
    geneva: prefixHttps(geneva),
  }
}

export function prefixSocial(social: RawSocial | null = {}): RawSocial {
  social ??= {}

  const {
    Facebook: facebook = null,
    Instagram: instagram = null,
    Twitter: twitter = null,
    LinkedIn: linkedin = null,
    YouTube: youtube = null,
    Pinterest: pintrest = null,
    Whatsapp: whatsapp = null,
    Reddit: reddit = null,
    TikTok: tiktok = null,
    Geneva: geneva = null,
  } = social
  return {
    Facebook: prefixHttps(facebook),
    Twitter: prefixHttps(twitter),
    Instagram: prefixHttps(instagram),
    LinkedIn: prefixHttps(linkedin),
    YouTube: prefixHttps(youtube),
    Pinterest: prefixHttps(pintrest),
    Whatsapp: prefixHttps(whatsapp),
    Reddit: prefixHttps(reddit),
    TikTok: prefixHttps(tiktok),
    Geneva: prefixHttps(geneva),
  }
}

export function extractTwitterUser(twitter?: string | null): string | null {
  if (!twitter) {
    return null
  }
  const m = twitter.match(/twitter\.com\/(?<username>[^/]+)/)
  return m && m.groups?.username ? m.groups.username : null
}

export function prefixHttps(url?: string | null | undefined): string | null {
  if (!url) {
    return null
  }
  return url.startsWith('https://') ? url : `https://${url}`
}
