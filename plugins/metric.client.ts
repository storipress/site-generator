/// <reference types="user-agent-data-types" />
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'
import { useStoripress } from '#imports'
import { useAxiom } from '@/composables/use-axiom'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    const axiomIngest = useAxiom()
    const { clientID } = useStoripress()

    const browserInfo = {
      user_agent: navigator.userAgent,
      brands: navigator.userAgentData?.brands,
      platform: navigator.userAgentData?.platform,
      mobile: navigator.userAgentData?.mobile,
    }

    onCLS((metric) => {
      const { entries, ...otherMetric } = metric

      axiomIngest('customer_sites', {
        type: 'webVital',
        client_id: clientID,
        url: nuxtApp._route.fullPath,
        metric: {
          entries: entries.map((layoutShift) => ({
            ...layoutShift.toJSON(),
            sources: layoutShift.sources.map(({ node }) => ({
              node: convertToClassSelector(node),
            })),
          })),
          ...otherMetric,
        },
        ...browserInfo,
      })
    })

    onFID((metric) => {
      const { entries, ...otherMetric } = metric

      axiomIngest('customer_sites', {
        type: 'webVital',
        client_id: clientID,
        url: nuxtApp._route.fullPath,
        metric: {
          entries: entries.map((performanceEventTiming) => ({
            ...performanceEventTiming.toJSON(),
            target: convertToClassSelector(performanceEventTiming.target),
          })),
          ...otherMetric,
        },
        ...browserInfo,
      })
    })

    onLCP((metric) => {
      const { entries, ...otherMetric } = metric

      axiomIngest('customer_sites', {
        type: 'webVital',
        client_id: clientID,
        url: nuxtApp._route.fullPath,
        metric: {
          entries: entries.map((largestContentfulPaint) => ({
            ...largestContentfulPaint.toJSON(),
            element: convertToClassSelector(largestContentfulPaint.element),
          })),
          ...otherMetric,
        },
        ...browserInfo,
      })
    })

    onFCP((metric) => {
      const { entries, ...otherMetric } = metric

      axiomIngest('customer_sites', {
        type: 'webVital',
        client_id: clientID,
        url: nuxtApp._route.fullPath,
        metric: {
          entries: entries.map((performancePaintTiming) => performancePaintTiming.toJSON()),
          ...otherMetric,
        },
        ...browserInfo,
      })
    })

    onINP((metric) => {
      const { entries, ...otherMetric } = metric

      axiomIngest('customer_sites', {
        type: 'webVital',
        client_id: clientID,
        url: nuxtApp._route.fullPath,
        metric: {
          entries: entries.map((performanceEventTiming) => ({
            ...performanceEventTiming.toJSON(),
            target: convertToClassSelector(performanceEventTiming.target),
          })),
          ...otherMetric,
        },
        ...browserInfo,
      })
    })

    onTTFB((metric) => {
      const { entries, ...otherMetric } = metric

      axiomIngest('customer_sites', {
        type: 'webVital',
        client_id: clientID,
        url: nuxtApp._route.fullPath,
        metric: {
          entries: entries.map((performanceNavigationTiming) => performanceNavigationTiming.toJSON()),
          ...otherMetric,
        },
        ...browserInfo,
      })
    })

    function convertToClassSelector(el?: Element | Node | null) {
      return [...(el?.classList ?? [])].map((className) => `.${className}`).join('')
    }
  },
})
