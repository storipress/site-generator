<script lang="ts">
import { useEventBus } from '@vueuse/core'
import { Disqus } from 'vue-disqus'
import DisqusCountComp from './disqus-count-comp.vue'
import TransitionRoot from './transition-root.vue'
import TransitionChild from './transition-child.vue'

export default defineComponent({
  components: { DisqusCountComp, Disqus, TransitionChild, TransitionRoot },

  setup() {
    const { on } = useEventBus('disqus-bus')
    const { emit } = useEventBus('disqus-count-bus')
    const open = ref(false)
    const route = useRoute()
    const storipress = useStoripress()
    const shortname = storipress.disqus
    const show = computed(() => {
      return shortname && route.name === 'article'
    })

    if (!shortname) {
      emit(false)
    }

    on((val) => {
      if (val == null) {
        open.value = !open.value
      } else {
        open.value = !!val
      }
    })

    watch(open, (open) => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    })

    return {
      show,
      open,
      shortname,
      identifier: computed(() => route.params._slug as string),
      updateCount(count: number) {
        emit(count)
      },
    }
  },
})
</script>

<template>
  <div
    v-if="show"
    class="flex items-center justify-center"
    role="button"
    aria-label="Disqus"
    @click.self="open = !open"
  >
    <!-- make it hidden, but we still need it as there is no API to get count directly -->
    <ClientOnly>
      <DisqusCountComp
        v-if="shortname"
        :key="identifier"
        class="hidden"
        :identifier="identifier"
        @update-count="updateCount"
      />
    </ClientOnly>
    <TransitionRoot
      class="inset-0 overflow-hidden"
      :appear="open"
      enter-from="fixed"
      enter="fixed"
      leave-to="hidden"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 overflow-hidden" @click="open = false">
        <!-- Background overlay, show/hide based on slide-over state. -->
        <div class="absolute inset-0" aria-hidden="true">
          <div class="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10" @click.stop>
            <!--
          Slide-over panel, show/hide based on slide-over state.

          Entering: "transform transition ease-in-out duration-500 sm:duration-700"
            From: "translate-x-full"
            To: "translate-x-0"
          Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
            From: "translate-x-0"
            To: "translate-x-full"
        -->
            <TransitionChild
              class="sm:duration-300 relative w-screen max-w-md transition duration-200 ease-in-out transform"
              enter-from="translate-x-full"
              enter="translate-x-0"
              leave="translate-x-full"
            >
              <div class="flex flex-col h-full py-6 overflow-y-scroll bg-white shadow-xl" @click.stop>
                <div class="sm:px-6 px-4">
                  <div class="flex items-start justify-between">
                    <h2 id="slide-over-title" class="text-lg font-medium text-gray-900">Comments</h2>
                    <div class="h-7 flex items-center ml-3">
                      <button
                        type="button"
                        class="hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-gray-400 bg-white rounded-md"
                        @click="open = false"
                      >
                        <span class="sr-only">Close panel</span>
                        <!-- Heroicon name: outline/x -->
                        <svg
                          class="w-6 h-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="sm:px-6 relative flex-1 px-4 mt-6">
                  <!-- Replace with your content -->
                  <ClientOnly>
                    <Disqus v-if="shortname" :key="identifier" :shortname="shortname" :page-config="{ identifier }" />
                  </ClientOnly>
                  <!-- /End replace -->
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </div>
    </TransitionRoot>
  </div>
</template>
