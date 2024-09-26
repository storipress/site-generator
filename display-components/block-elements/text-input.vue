<script lang="ts" setup>
import { exclude } from 'tsafe'
import { useBlockChild } from './base-element'
import GenericLinkElement from './generic-link-element.vue'

const props = defineProps({
  component: String,
  kind: String,
  blockType: String,
  defaultValue: String,
  dataId: String,
})

const { blockId } = useBlockChild()

const genericElementProps = computed(() => {
  const { component, kind, dataId } = props

  const path = [`b-${blockId}`, kind].filter(exclude(undefined))

  return {
    component,
    path,
    dataId,
  }
})
</script>

<template>
  <GenericLinkElement v-bind="genericElementProps" />
</template>
