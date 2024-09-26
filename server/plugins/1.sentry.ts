import { initSentry } from '@cloudflare/worker-sentry'
import type { H3Error, H3Event } from 'h3'
import type { NitroApp } from 'nitropack'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  // https://github.com/unjs/h3/blob/8af047416cf1e7c03d8a8ccc2cce137d4af50996/src/app.ts#L50
  const originalOnRequest = nitroApp.h3App.options.onRequest
  nitroApp.h3App.options.onRequest = (event: H3Event) => {
    // @ts-expect-error no type
    globalThis.SENTRY_DSN = 'https://98357201c81dd6d4a7619a9d7e3ae1db@o930441.ingest.sentry.io/4505707435524096'
    // @ts-expect-error no type
    globalThis.SENTRY_CLIENT_ID = ''
    // @ts-expect-error no type
    globalThis.SENTRY_CLIENT_SECRET = ''
    if (event.context.cloudflare) {
      event.context.sentry = initSentry(event)
    }
    if (originalOnRequest) {
      return originalOnRequest(event)
    }
  }

  const originalOnError = nitroApp.h3App.options.onError

  nitroApp.h3App.options.onError = (error: H3Error, event: H3Event) => {
    if (event.context?.sentry) {
      event.context.sentry.captureException(error)
    }
    if (originalOnError) {
      return originalOnError(error, event)
    }
  }
})
