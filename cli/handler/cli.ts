import { setupServer } from 'msw/node'
import * as Sentry from '@sentry/serverless'
import { argv } from 'zx'
import { _handler } from '.'

Sentry.init({
  dsn: 'https://f39b6c866a004b1084b5504f6cc0995b@o930441.ingest.sentry.io/4505464489967616',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

export async function cli() {
  let server
  if (!argv.token) {
    server = setupServer()
    server.listen()
  }
  const token = argv.token || 'token'
  const clientId = argv['client-id'] || 'client_id'
  try {
    await _handler({ token, client_id: clientId, release_id: '', upload_url: '' }, {} as any, () => {})
  } catch (error) {
    console.error(error)
  } finally {
    server?.close()
  }
}
cli()
