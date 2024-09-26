<script setup lang="ts">
import { computed, useInjectHtmlProfile } from '#imports'

const props = defineProps<{
  profile: string
}>()

const { currentProfile, defaultProfile } = useInjectHtmlProfile(() => props.profile)

const html = computed(() => (defaultProfile?.html || '') + (currentProfile.value?.html || ''))
</script>

<template>
  <div v-html="html" />
</template>
