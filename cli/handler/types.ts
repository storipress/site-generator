import { stubArray } from 'lodash'
import { z } from 'zod'

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export enum DebugType {
  Article = 'article',
  Routes = 'routes',
}

const ArticleDebug = z.object({
  type: z.literal(DebugType.Article),
  id: z.string(),
})

const RoutesDebug = z.object({
  type: z.literal(DebugType.Routes),
})

const IDArray = z
  .array(z.union([z.string(), z.number()]).transform((value) => value.toString()))
  .nonempty('expected at least one id')
  .or(z.object({}).strict())
  .optional()
  .default(stubArray)
  .transform((x) => (Array.isArray(x) ? x : []))

const ChangedChangeSet = z.object({
  articles: IDArray.optional(),
  desks: IDArray.optional(),
  layouts: IDArray.optional(),
  pages: IDArray.optional(),
  designs: IDArray.optional(),
  tags: IDArray.optional(),
  users: IDArray.optional(),
})

const RemovedChangeSet = z.object({
  articles: IDArray.optional(),
  desks: IDArray.optional(),
  layouts: IDArray.optional(),
  pages: IDArray.optional(),
  tags: IDArray.optional(),
  users: IDArray.optional(),
})

const DebugFeatureType = z.union([ArticleDebug, RoutesDebug])

export type DebugFeature = z.infer<typeof DebugFeatureType>

export const InputParams = z.object({
  client_id: z.string(),
  page_id: z.string().optional(),
  environment: z.nativeEnum(Environment),
  release_id: z
    .string()
    .or(z.number())
    .transform((releaseId) => releaseId.toString()),
  // TODO: change to required when backend deprecated universal token
  token: z.string().optional(),
  sp_debug: DebugFeatureType.optional(),
  creates: z
    .object({
      pages: IDArray.optional(),
    })
    .or(z.array(z.any()).length(0))
    .transform((x) => (Array.isArray(x) ? {} : x))
    .optional(),
  changes: ChangedChangeSet.or(z.array(z.any()).length(0))
    .transform((x) => (Array.isArray(x) ? {} : x))
    .optional(),
  deletes: RemovedChangeSet.or(z.array(z.any()).length(0))
    .transform((x) => (Array.isArray(x) ? {} : x))
    .optional(),

  timestamp: z.string().optional(),
})
