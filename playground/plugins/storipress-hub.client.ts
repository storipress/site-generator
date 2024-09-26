import { useStorage } from '@vueuse/core'
import { createStorage } from '@storipress/hub'
import { withTimeout } from '~/utils/common'

const USER_TOKEN_NAME = 'storipress-token'
const HUB_URL = 'https://storipress-hub.pages.dev/'

type Env = 'production' | 'development' | 'staging'
const envMap: Record<string, Env> = {
  P: 'production',
  D: 'development',
  S: 'staging',
}

export default defineNuxtPlugin(async () => {
  const runtimeConfig = useRuntimeConfig()
  const clientID = runtimeConfig.public.storipress.clientId ?? ''
  const envKey = clientID.charAt(0).toUpperCase() ?? ''
  const env = envMap[envKey] ?? envMap.D
  const userToken = useStorage(USER_TOKEN_NAME, '')
  const { ready, getHubItem, setItem } = createStorage(HUB_URL, env)
  await withTimeout(ready())
  const hubToken = await withTimeout(getHubItem(USER_TOKEN_NAME))
  watch(
    userToken,
    async (token) => {
      if (!token && !hubToken) return
      if (!token && hubToken) {
        userToken.value = hubToken
        return
      }
      await withTimeout(setItem(USER_TOKEN_NAME, token))
    },
    { immediate: true },
  )
})
