import type { MakeDirectoryOptions } from 'node:fs'
import { Context, Effect, Layer } from 'effect'
import fse from 'fs-extra'

interface FileSystemImpl {
  exists: (path: string) => Effect.Effect<boolean>
  copy: (from: string, to: string) => Effect.Effect<void>
  mkdir: (path: string, options?: MakeDirectoryOptions) => Effect.Effect<void>
}

export class FileSystem extends Context.Tag('@cli/FileSystem')<FileSystem, FileSystemImpl>() {
  static Live = Layer.succeed(
    this,
    this.of({
      mkdir: (path, options) => Effect.promise(() => fse.mkdir(path, options)),
      copy: (from, to) => Effect.promise(() => fse.copy(from, to)),
      exists: (path) => Effect.promise(() => fse.pathExists(path)),
    }),
  )
}
