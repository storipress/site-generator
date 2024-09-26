import { destr } from 'destr'
import type { useRuntimeConfig } from '#imports'

interface SchemaContent {
  '@graph': {
    '@type': 'BreadcrumbList'
    itemListElement: {
      '@type': 'ListItem'
      name: string
      item: string
      position: number
    }[]
  }[]
}
type ListItem = SchemaContent['@graph'][number]['itemListElement'][number]

interface AxiomContext {
  axiomVersion: string
  axiomToken: string
  runtimeConfig: ReturnType<typeof useRuntimeConfig>
}

export default defineNuxtPlugin({
  enforce: 'post',
  setup(nuxt) {
    const runtimeConfig = nuxt.$config
    const { axiomVersion, axiomToken } = runtimeConfig.storipress
    const axiomContext: AxiomContext = {
      runtimeConfig,
      axiomVersion: axiomVersion as string,
      axiomToken: axiomToken as string,
    }

    const head = nuxt.vueApp._context.provides.usehead
    verboseInvariant(head, 'No active head')
    head.hooks.hook('ssr:render', ({ tags }: { tags: { key: string; innerHTML: string }[] }) => {
      const schemaTag = tags?.find(({ key }) => key === 'schema-org-graph')
      if (!schemaTag) return

      const schemaContent = destr<SchemaContent>(schemaTag.innerHTML || '{}')
      const breadcrumb = schemaContent?.['@graph']?.find((graph) => graph?.['@type'] === 'BreadcrumbList')
      if (!breadcrumb) return

      const isSingle = breadcrumb.itemListElement.filter(({ position }) => position === 1).length === 1
      if (!isSingle) return

      const log = createLog(breadcrumb.itemListElement, axiomContext)
      sendLogs(log, axiomContext)
    })
  },
})

function createLog(list: ListItem[], ctx: AxiomContext) {
  const now = new Date()
  const runtimeConfig = ctx.runtimeConfig

  const workerTimestamp = now.toISOString()
  const workerId = crypto.randomUUID()

  const log = {
    breadcrumbList: list,
    _time: now.getTime(),
    id: workerId,
    type: 'SEO',
    worker: {
      axiomVersion: ctx.axiomVersion,
      id: workerId,
      started: workerTimestamp,
    },
    storipress: {
      ...runtimeConfig.storipress,
    },
    site: {
      name: runtimeConfig.public.site.name,
      url: runtimeConfig.public.site.url,
    },
  }

  return JSON.stringify(log)
}

async function sendLogs(log: string, ctx: AxiomContext) {
  try {
    await fetch('https://api.axiom.co/v1/datasets/customer_site_server/ingest', {
      signal: AbortSignal.timeout(5_000), // 5 seconds
      method: 'POST',
      body: log,
      headers: {
        Authorization: `Bearer ${ctx.axiomToken}`,
        'Content-Type': 'application/x-ndjson',
        'User-Agent': `axiom-cloudflare/${ctx.axiomVersion}`,
      },
    })
  } catch (error) {
    console.error(error)
  }
}
