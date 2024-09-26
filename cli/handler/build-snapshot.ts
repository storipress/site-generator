import { Effect } from 'effect'
import { collectFiles, toCompressedBuffer } from './compress'
import { patchOutput } from './patch'
import { getSiteInfo$ } from './site-info'
import { OUTPUT_BASE, OUTPUT_PATH, extract } from './snapshot'
import { logger } from './pino'

interface BuildSnapshotInput {
  projectRoot: string
  clientId: string
  token: string
}

export async function buildSnapshot(input: BuildSnapshotInput) {
  return Effect.runPromise(buildSnapshot$(input))
}

function buildSnapshot$({ projectRoot, clientId, token }: BuildSnapshotInput) {
  return Effect.gen(function* ($) {
    const siteInfo = yield* $(getSiteInfo$(clientId, token))
    logger.info('extract snapshot')
    yield* $(Effect.promise(() => extract(projectRoot)))
    logger.info('execute patch')
    yield* $(Effect.promise(() => patchOutput(OUTPUT_PATH, siteInfo)))
    logger.info('collecting outputs')
    const fileList = yield* $(Effect.promise(() => collectFiles(OUTPUT_BASE)))
    logger.info('compressing')
    const buffer = yield* $(Effect.promise(() => toCompressedBuffer(OUTPUT_BASE, fileList)))
    return buffer
  })
}
