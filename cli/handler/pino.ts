import createPino from 'pino'
import { lambdaRequestTracker, pinoLambdaDestination } from 'pino-lambda'
import type { Event } from './definitions'

// custom destination formatter
const destination = pinoLambdaDestination({})
export const logger = createPino(destination)
export const withRequest = lambdaRequestTracker({
  requestMixin(evt) {
    const event = evt as Event

    return {
      client_id: event.client_id,
      release_id: event.release_id,
      token: event.token,
    }
  },
})
