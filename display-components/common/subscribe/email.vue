<script lang="ts" setup>
const storipress = useStoripress()
const name = computed(() => storipress.mail?.fieldName || 'email')
</script>

<template>
  <input type="email" :name="name" v-bind="$attrs" />
</template>
