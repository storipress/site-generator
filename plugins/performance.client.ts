/// <reference types="user-agent-data-types" />
import { P, match } from 'ts-pattern'
import { normalizeURL, parseURL } from 'ufo'
import { useStoripress } from '#imports'
import { useAxiom } from '@/composables/use-axiom'

export default defineNuxtPlugin({
  setup() {
    const axiomIngest = useAxiom()
    const { clientID } = useStoripress()

    const browserInfo = {
      user_agent: navigator.userAgent,
      brands: navigator.userAgentData?.brands,
      platform: navigator.userAgentData?.platform,
      mobile: navigator.userAgentData?.mobile,
    }

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const performanceResourceTiming = entry.toJSON()
        const { initiatorType, name } = performanceResourceTiming

        const isRecordable = filterRecord({ type: initiatorType, name })
        if (!isRecordable) return

        const assetSize = performanceResourceTiming.transferSize || performanceResourceTiming.encodedBodySize

        axiomIngest('customer_sites', {
          type: 'performance',
          client_id: clientID,
          assets_name: performanceResourceTiming.name,
          assets_size: assetSize,
          assets_type: performanceResourceTiming.initiatorType,
          assets_duration: performanceResourceTiming.duration,
          ...browserInfo,
        })
      })
    })

    observer.observe({ type: 'resource', buffered: true })

    function filterRecord({ type, name }: { type: string; name: string }) {
      return match(type)
        .with(P.union('img', 'script', 'link'), () => true)
        .with('fetch', () => {
          const result = parseURL(normalizeURL(name))
          const current = parseURL(normalizeURL(window.location.href))

          return current.host === result.host || isStoripressDomain(result.host)
        })
        .otherwise(() => false)
    }
    const STORIPRESS_DOMAIN = new Set([
      'api.stori.press',
      'api.storipress.dev',
      'api.storipress.pro',
      'assets.stori.press',
      'static.stori.press',
    ])

    function isStoripressDomain(hostname?: string) {
      return hostname && STORIPRESS_DOMAIN.has(hostname)
    }
  },
})
