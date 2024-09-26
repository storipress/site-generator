import fs from 'node:fs/promises'
import path from 'node:path'
import { decompress } from './compress'

export const OUTPUT_BASE = '/tmp/snapshot-output'
export const OUTPUT_PATH = '/tmp/snapshot-output/dist'

export async function extract(projectRoot: string) {
  const snapshotPath = path.resolve(projectRoot, 'cli/snapshot/snapshot.tar.br')
  await fs.rm(OUTPUT_BASE, { recursive: true, force: true })
  await fs.mkdir(OUTPUT_PATH, { recursive: true })
  await decompress(snapshotPath, OUTPUT_PATH)
}
