<script lang="ts">
import { PortalBlockProvider } from '@/components'

export default defineComponent({
  components: { PortalBlockProvider, SearchDialog: defineAsyncComponent(() => import('./search-dialog.vue')) },

  data: () => ({
    isSearching: false,
  }),
  methods: {
    signalReceiver(value: boolean) {
      this.isSearching = value
    },
  },
})
</script>

<template>
  <div>
    <div role="button" @click="isSearching = !isSearching">
      <slot>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="#2c3e50"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M0 0h24v24H0z" stroke="none" />
          <circle cx="10" cy="10" r="7" />
          <path d="m21 21-6-6" />
        </svg>
      </slot>
      <Teleport v-if="isSearching" to="body">
        <PortalBlockProvider name="search">
          <transition name="dialog-motion">
            <SearchDialog @clicked="signalReceiver" />
          </transition>
        </PortalBlockProvider>
      </Teleport>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dialog-motion {
  &-enter-active {
    transition: top 0.3s ease;
  }

  &-enter {
    top: 100%;
  }

  &-leave-active {
    transition: opacity 0.5s ease-in-out;
  }

  &-leave-to {
    opacity: 0;
  }
}
</style>
