// ref: https://support.google.com/adsense/answer/9274516?hl=en
import { Parser } from 'htmlparser2'

export interface AdSenseInfo {
  id: string
  script: string
}

const ID_ATTR = 'data-ad-client'

export function extractAdSense(html: string | null): AdSenseInfo {
  let info: AdSenseInfo = { id: '', script: '' }
  if (!html) return info
  const parser = new Parser({
    onopentag(name: string, attribs: Record<string, string>) {
      const src = attribs.src ?? ''
      if (name === 'script' && src.includes('adsbygoogle')) {
        info = {
          id: (extractAdIdFromScript(src) || attribs[ID_ATTR]) ?? '',
          script: src,
        }
      }
    },
  })
  parser.write(html)
  return info
}

function extractAdIdFromScript(script: string): string {
  const match = script.match(/client=(ca-pub-\d+)/)
  return match?.[1] ?? ''
}
