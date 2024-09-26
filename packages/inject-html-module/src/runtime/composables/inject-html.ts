import type { Ref } from 'vue'
import type { Head } from 'zhead'
import type { MaybeRefOrGetter } from '@vueuse/shared'

import { toValue } from '@vueuse/shared'

// @ts-expect-error no type
import profiles from '#build/inject-html-profile'
import { computed, useHead } from '#imports'

export interface InjectHtmlProfile {
  head: Partial<Head>
  html: string
}

export interface UseInjectHtmlProfileReturn {
  defaultProfile: InjectHtmlProfile | null
  currentProfile: Ref<InjectHtmlProfile | null>
}

export function useInjectHtmlProfile(profile: MaybeRefOrGetter<string | null | undefined>): UseInjectHtmlProfileReturn {
  return {
    defaultProfile: profiles.default,
    currentProfile: computed(() => {
      const profileName = toValue(profile)
      if (!profileName || profileName === 'default') {
        return null
      }

      return profiles[profileName]
    }),
  }
}

export function useInjectHtml(profile: Ref<string | null | undefined>) {
  const { defaultProfile, currentProfile } = useInjectHtmlProfile(profile)
  if (defaultProfile) {
    useHead(defaultProfile.head)
  }

  useHead(() => {
    return currentProfile.value?.head ?? {}
  })
}
