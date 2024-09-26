import type { EventContext } from '@cloudflare/workers-types'
import type { H3Error, H3Event } from 'h3'
import type { NitroApp } from 'nitropack'
import { serializeError } from 'serialize-error'
import type { Span } from '@opentelemetry/api'
import { trace } from '@opentelemetry/api'
import type { SearchResponseContext } from '@storipress/karbon/dist/runtime/composables/storipress-base-client'
import { useRuntimeConfig } from '#imports'

interface CloudflareContext {
  context: EventContext<any, any, any>
}

let VERSION = ''
let axiomToken = ''

let workerId: string
let workerTimestamp: string
const batch: any[] = []
const typesenseBatch: any[] = []

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const tracer = trace.getTracer('api')
  const runtimeConfig = useRuntimeConfig()
  VERSION = runtimeConfig.storipress.axiomVersion as string
  axiomToken = runtimeConfig.storipress.axiomToken as string

  // https://github.com/unjs/h3/blob/8af047416cf1e7c03d8a8ccc2cce137d4af50996/src/app.ts#L50
  const originalOnRequest = nitroApp.h3App.options.onRequest
  nitroApp.h3App.options.onRequest = (event: H3Event) => {
    if (originalOnRequest) {
      originalOnRequest(event)
    }
    const span = tracer.startSpan(`${event.method} ${event.path}`)
    event.context.span = span
    span.setAttributes({
      method: event.method,
      path: event.path,
    })
    event.context.span = span
    const now = new Date()
    const context = getCloudflareContext(event)

    if (!workerTimestamp) {
      workerTimestamp = now.toISOString()
    }
    if (!workerId) {
      workerId = crypto.randomUUID()
    }

    event.context.axiomStart = now.getTime()
    event.context.axiomTrace = crypto.randomUUID()

    attachTrace(event)

    context.passThroughOnException()
  }

  nitroApp.hooks.hook('karbon:searchResponse', async (ctx: SearchResponseContext) => {
    const runtimeConfig = useRuntimeConfig()
    const item = {
      id: ctx.id,
      group_id: ctx.groupId,
      name: ctx.name,
      query: ctx.query,
      response: {
        duration: ctx.responseTime - ctx.requestTime,
        ...(ctx.hasMore ? {} : { group_duration: ctx.responseTime - ctx.groupStartTime }),
      },
      hasMore: ctx.hasMore,
    }

    typesenseBatch.push({
      ...item,
      _time: Date.now(),
      type: 'api' as const,
      status: ctx.type === 'error' ? 'ERROR' : 'OK',
      error: ctx.error ? serializeError(ctx.error) : null,
      worker: {
        version: VERSION,
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
    })
  })

  nitroApp.hooks.hook('karbon:request', (ctx) => {
    ctx.operation.setContext({ tracingStart: Date.now() })
  })

  nitroApp.hooks.hook('karbon:response', (ctx) => {
    if (ctx.type === 'next') {
      return
    }
    collectApiLog({
      id: ctx.id,
      name: ctx.name,
      operation: {
        name: ctx.operation.operationName,
        variables: JSON.stringify(ctx.operation.variables),
      },
      duration: Date.now() - ctx.operation.getContext().tracingStart,
      error: ctx.type === 'error' ? ctx.data : undefined,
    })
  })

  nitroApp.hooks.hook('beforeResponse', (event) => {
    const span = event.context.span as Span
    const activeSpan = trace.getActiveSpan()
    const traceId = span.spanContext().traceId
    setResponseHeader(event, 'X-Opentelemetry-Trace', activeSpan?.spanContext().traceId ?? traceId)

    const context = getCloudflareContext(event)
    collectAccessLog(event, context)
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const span: Span = event.context.span
    if (!span) return

    span.setAttribute('status', event.node.res.statusCode)
    span.end()
  })

  const originalOnError = nitroApp.h3App.options.onError

  nitroApp.h3App.options.onError = async (error: H3Error, event: H3Event) => {
    const context = getCloudflareContext(event)

    collectAccessLog(event, context, error)

    if (originalOnError) {
      return originalOnError(error, event)
    }
  }
})

async function sendLogs(_batch = batch) {
  if (batch.length === 0 && typesenseBatch.length === 0) {
    return
  }

  const logs = [...batch, ...typesenseBatch]

  _batch.splice(0, _batch.length)

  try {
    await fetch('https://api.axiom.co/v1/datasets/customer_site_server/ingest', {
      signal: AbortSignal.timeout(5_000), // 5 seconds
      method: 'POST',
      body: logs.map((log) => JSON.stringify(log)).join('\n'),
      headers: {
        Authorization: `Bearer ${axiomToken}`,
        'Content-Type': 'application/x-ndjson',
        'User-Agent': `axiom-cloudflare/${VERSION}`,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

type MinimalContext = Pick<EventContext<any, any, any>, 'passThroughOnException' | 'waitUntil'> & { _isMock?: boolean }

async function collectApiLog({
  id,
  name,
  duration,
  operation,
  error,
}: {
  id: string
  name: string
  duration: number
  operation: { name: string; variables: string }
  error?: H3Error
}) {
  const log = {
    id,
    type: 'api' as const,
    item: {
      name,
      operation,
      response: {
        duration,
        status: 200,
      },
    },
    error,
  }
  return collectLog(log)
}

async function collectAccessLog(event: H3Event, context: MinimalContext, error?: H3Error) {
  const now = new Date()

  return collectLog({
    id: event.context.axiomTrace,
    type: 'access',
    item: {
      request: {
        url: event.node.req.url,
        method: event.node.req.method,
        started: event.context.axiomStart,
        ...splitHeaders(event.node.req.headers),
      },
      response: {
        duration: now.getTime() - event.context.axiomStart,
        headers: event.node.res.getHeaders(),
        status: event.node.res.statusCode,
      },
    },
    context,
    error,
  })
}

async function collectLog({
  id,
  type,
  item,
  context,
  error,
}: {
  id: string
  type: 'access' | 'api'
  item: Record<string, unknown>
  context?: MinimalContext
  error?: Error
}) {
  const now = new Date()
  const runtimeConfig = useRuntimeConfig()

  batch.push({
    ...item,
    _time: now.getTime(),
    id,
    type,
    status: error ? 'ERROR' : 'OK',
    error: error ? serializeError(error) : null,
    worker: {
      version: VERSION,
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
  })

  if (!context || context._isMock) {
    // don't actually send in mock
    return
  }

  return context.waitUntil(sendLogs())
}

const KNOWN_HEADERS = new Set([
  'accept-charset',
  'accept-encoding',
  'accept-language',
  'cache-control',
  'cf-connecting-ip',
  'cf-ipcountry',
  'cf-ray',
  'cf-rum-ctag',
  'cf-visitor',
  'cf-worker',
  'connection',
  'content-length',
  'content-type',
  'cookie',
  'dnt',
  'from',
  'host',
  'if-modified-since',
  'if-none-match',
  'origin',
  'pragma',
  'referer',
  'sec-ch-ua',
  'sec-ch-ua-mobile',
  'sec-ch-ua-platform',
  'sec-fetch-dest',
  'sec-fetch-mode',
  'sec-fetch-site',
  'sec-fetch-user',
  'sec-gpc',
  'upgrade-insecure-requests',
  'user-agent',
  'via',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-real-ip',
  'x-sp-bypass-cache',
  'x-sp-invalid-cache',
])

// only keep known header and move other header to key-value pair array, so we won't run out of axiom field limit
function splitHeaders(headers: Record<string, string | string[] | undefined>) {
  const result: Record<string, string> = {}
  const pairs: [string, string][] = []

  for (const [key, val] of Object.entries(headers)) {
    const value = Array.isArray(val) ? val.join(',') : val
    if (!value) {
      continue
    }
    if (KNOWN_HEADERS.has(key)) {
      result[key] = value
    } else {
      pairs.push([key, value])
    }
  }

  return {
    headers: result,
    customHeaders: pairs,
  }
}

function attachTrace(event: H3Event) {
  const traceId = event.context.axiomTrace
  setResponseHeader(event, 'X-Axiom-Trace', traceId)
}

function getCloudflareContext(event: H3Event): MinimalContext {
  const cloudflare = event.context.cloudflare as CloudflareContext
  if (!cloudflare) {
    return {
      _isMock: true,
      passThroughOnException: () => {},
      waitUntil: () => {},
    }
  }
  return cloudflare.context
}
