import path from 'node:path'
import { id } from 'proper-tags'
import { createCommonJS } from 'mlly'
import type { TypeOf, ZodTypeAny } from 'zod'
import { destr } from 'destr'
import { Effect, FiberRef, GlobalValue, pipe } from 'effect'
import { captureException } from '@sentry/serverless'

const { __dirname } = createCommonJS(import.meta.url)

export const generatedPath = createGeneratedPath(__dirname)

export const currentReport = GlobalValue.globalValue(Symbol.for('@app/helper/currentReport'), () =>
  FiberRef.unsafeMake(true),
)

export function createGeneratedPath(base: string, useJoin = false) {
  function resolveGeneratedPath(p: string = '') {
    if (useJoin) {
      return path.join(base, '../playground/generated', p)
    }
    return path.resolve(base, '../playground/generated', p)
  }
  const generatedPath = id((arr: TemplateStringsArray, ...args: unknown[]) => {
    const p = id(arr, ...args)
    return resolveGeneratedPath(p)
  })

  return generatedPath
}

/**
 * parse maybe json with specific schema, this function will never throw error to interrupt program flow
 * @param schema
 * @param data
 * @returns parsed data
 */
export function parseSchemaJson<Schema extends ZodTypeAny>(
  schema: Schema,
  data: unknown,
): Effect.Effect<TypeOf<Schema>> {
  return Effect.gen(function* ($) {
    if (!data) {
      return data
    }

    return yield* $(
      Effect.try(() => schema.parse(destr(data))),
      Effect.catchAll((error) => {
        return pipe(
          FiberRef.get(currentReport),
          Effect.flatMap((shouldReport) => {
            return Effect.gen(function* ($) {
              if (shouldReport) {
                yield* $(Effect.logError(error))
                captureException(error)
              }
              return destr(data) as TypeOf<Schema>
            })
          }),
        )
      }),
    )
  })
}
