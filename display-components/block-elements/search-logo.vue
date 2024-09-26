<script lang="ts">
export default defineComponent({
  name: 'SearchLogo',
  setup() {
    const { logo } = useStoripressCompatInject()

    return {
      url: logo,
    }
  },
})
</script>

<template>
  <div class="placeholder">
    <div class="img-filter relative">
      <img class="w-full h-full" alt="Logo" :src="url" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.placeholder {
  @apply fixed bottom-8;
  @apply h-6 w-auto;

  left: 1.5rem;

  @screen md {
    left: 3.5rem;
  }
}

.img-filter {
  height: inherit;
  width: inherit;
  filter: grayscale(100%) brightness(2);
}
</style>
