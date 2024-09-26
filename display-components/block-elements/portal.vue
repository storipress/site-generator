<script lang="ts">
export default defineComponent({
  props: {
    open: {
      type: Boolean,
    },
    openClass: {
      type: String,
      default: 'block',
    },
  },
  setup() {
    provide('portal', 'menu')
  },
})
</script>

<template>
  <Teleport to="body">
    <div class="w-full h-full" :class="open ? openClass : 'hidden'">
      <slot />
    </div>
  </Teleport>
</template>
