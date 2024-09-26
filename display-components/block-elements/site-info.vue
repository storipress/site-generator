<script lang="ts">
import Site from '../common/site.vue'

export default defineComponent({
  components: { Site },

  setup() {
    const { frontData } = useStoripressCompatInject()

    return {
      desks: frontData.desks,
      pages: frontData.pages,
    }
  },
})
</script>

<template>
  <Site v-slot="{ site }">
    <slot :site="site" :desks="desks" :pages="pages" />
  </Site>
</template>
