export default defineEventHandler(async () => {
  await $fetch('/api/_storipress/purge-cache')
  return $fetch('/api/_storipress/update-cache')
})
