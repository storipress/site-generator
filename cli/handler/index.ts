import fs from 'fs-extra'
import type { Handler } from 'aws-lambda'
import { request } from 'undici'
import * as Sentry from '@sentry/serverless'
import { createCommonJS } from 'mlly'
import { buildProject } from './build'
import type { Event } from './definitions'
import { SITE_BASE, eventSchema } from './definitions'
import { copyProject, prepareSiteBase, setupProject } from './prepare'
import { withRequest } from './pino'
import { buildSnapshot } from './build-snapshot'

Sentry.AWSLambda.init({
  dsn: 'https://f39b6c866a004b1084b5504f6cc0995b@o930441.ingest.sentry.io/4505464489967616',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

export const _handler: Handler<Event> = async (rawEvent, context) => {
  withRequest(rawEvent, context)
  const { client_id: clientId, upload_url, token, release_id } = eventSchema.parse(rawEvent)
  Sentry.setUser({ id: clientId })
  Sentry.setTag('clientId', clientId)
  const file = await build(token, clientId, release_id)
  if (!upload_url) {
    await fs.writeFile('file.tar.br', file)
  } else {
    await request(upload_url, {
      method: 'PUT',
      body: file,
    })
  }
}

export const handler = Sentry.AWSLambda.wrapHandler(_handler, {
  timeoutWarningLimit: 10 * 60 * 1000, // 10min
  captureTimeoutWarning: false,
})

async function build(token: string, clientId: string, release_id: string) {
  const { __dirname } = createCommonJS(import.meta.url)
  if (release_id === '1') {
    return buildSnapshot({
      projectRoot: __dirname,
      clientId,
      token,
    })
  }
  return normalBuild(token, clientId, release_id)
}

async function normalBuild(token: string, clientId: string, release_id: string) {
  await prepareSiteBase()
  await copyProject()
  await setupProject()
  const file = await buildProject(SITE_BASE, token, clientId, release_id)
  return file
}
