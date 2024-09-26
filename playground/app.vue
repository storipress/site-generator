<script lang="ts" setup>
const { $paywall } = useNuxtApp()

const {
  public: { spGtag },
} = useRuntimeConfig()
const { integrations } = useStoripress()
const { id: publicationID } = integrations.ga

const gtagIds = [spGtag.id, publicationID].filter(Boolean)

useServerHead({
  script: [
    ...gtagIds.map((id) => ({
      type: 'text/partytown',
      src: `https://www.googletagmanager.com/gtag/js?id=${id}&l=dataLayer`,
    })),
    {
      type: 'text/partytown',
      innerHTML: `
       dataLayer = window.dataLayer || [];
       window.gtag = function () {
        dataLayer.push(arguments);
       };

      window.gtag('js', new Date());
      `,
    },
  ],
})

onMounted(() => {
  $paywall.mount()
  $paywall.checkQuery()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <div id="paywall" />
  </NuxtLayout>
</template>
