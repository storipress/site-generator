import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async () => {
  const runtimeConfig = useRuntimeConfig()
  const storage = useStorage()
  const clientID = runtimeConfig.storipress.clientId
  await storage.clear(`nitro:${clientID}`)
  return { ok: true, clientID }
})
