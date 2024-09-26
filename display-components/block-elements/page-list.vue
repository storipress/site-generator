<script lang="ts" setup>
import SiteInfo from './site-info.vue'
</script>

<template>
  <SiteInfo v-slot="{ pages }">
    <slot :pages="pages" />
  </SiteInfo>
</template>
