import { createBrotliCompress, createBrotliDecompress } from 'node:zlib'
import path from 'node:path'
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { buffer } from 'node:stream/consumers'
import fs from 'node:fs/promises'
import { globby } from 'globby'
import tar from 'tar'
import { exclude } from 'tsafe'

const OUTPUT_PATH = '.output/public'

export async function collectFiles(buildRoot: string) {
  const hasDist = await checkHasDist(buildRoot)
  const fileList = await globby(
    ['functions/**/*', hasDist && 'dist/**/*', path.join(OUTPUT_PATH, '**/*')].filter(exclude([false])),
    {
      cwd: buildRoot,
    },
  )
  return fileList
}

export function toCompressedBuffer(buildRoot: string, fileList: string[]) {
  const stream = createBrotliCompress()
  tar.create({ cwd: buildRoot }, fileList).pipe(stream)

  return buffer(stream)
}

export async function decompress(source: string, extractPath: string) {
  const decompressStream = createBrotliDecompress()

  await pipeline(
    createReadStream(source),
    decompressStream,
    tar.extract({
      cwd: extractPath,
    }),
  )
}

async function checkHasDist(root: string): Promise<boolean> {
  try {
    const stat = await fs.lstat(path.join(root, 'dist'))
    return stat.isDirectory() && !stat.isSymbolicLink()
  } catch {
    return false
  }
}
