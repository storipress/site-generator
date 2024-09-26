<script lang="ts" setup>
import SiteInfo from './site-info.vue'
</script>

<template>
  <SiteInfo v-slot="{ desks }">
    <slot :desks="desks" />
  </SiteInfo>
</template>
