export default defineEventHandler(() => {
  const { storipress } = useRuntimeConfig()

  return {
    rid: storipress.rid,
    generator: storipress.generatorId,
    client_id: storipress.clientId,
  }
})
