import { Effect, FiberRef, Layer, pipe } from 'effect'
import { FileSystem } from '../services/FileSystem'
import { currentReport } from '../helpers'

export function createTestLayer() {
  const fileSystemActions: any[] = []

  const TestLayer = Layer.mergeAll(
    Layer.effectDiscard(FiberRef.update(currentReport, () => false)),
    Layer.succeed(
      FileSystem,
      FileSystem.of({
        mkdir: (path, options) =>
          Effect.succeed(fileSystemActions.push({ action: 'mkdir', path: splitPath(path), options })),
        copy: (from, to) =>
          Effect.succeed(fileSystemActions.push({ action: 'copy', from: splitPath(from), to: splitPath(to) })),
        exists: (path) =>
          pipe(Effect.succeed(fileSystemActions.push({ action: 'exists', path: splitPath(path) })), Effect.as(true)),
      }),
    ),
  )

  return {
    fileSystemActions,
    TestLayer,
  }
}

function splitPath(path: string) {
  return path.split('generated')[1] ?? '#unknown'
}
