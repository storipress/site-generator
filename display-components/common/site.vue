<script lang="ts">
export default defineComponent({
  setup() {
    const { site } = useStoripress()
    return {
      site,
    }
  },
})
</script>

<template>
  <div>
    <slot :site="site" />
  </div>
</template>
