import { z } from 'zod'

export const eventSchema = z.object({
  $schema: z.string().optional(),

  upload_url: z.string(),
  token: z.string(),
  client_id: z.string(),
  release_id: z.string(),
})

export type Event = z.infer<typeof eventSchema>

export const SITE_BASE = '/tmp/site'
