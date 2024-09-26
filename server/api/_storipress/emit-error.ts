export default defineEventHandler(async () => {
  throw new Error('Emit error called')
})
