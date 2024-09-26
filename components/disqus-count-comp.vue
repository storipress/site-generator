<script lang="ts" setup>
defineProps({
  identifier: {
    type: String,
  },
})

const emit = defineEmits(['updateCount'])

const COMMENT_REGEX = /(\d+)/

const count = ref()

const storipress = useStoripress()
const shortname = storipress.disqus

onMounted(() => {
  emit('updateCount', 0)

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      let node = mutation.target
      while (node.firstChild && node.firstChild.nodeType !== Node.TEXT_NODE) {
        node = node.firstChild
      }
      if (!node) {
        emit('updateCount', 0)
        return
      }
      const text = node.textContent || ''
      const match = text.match(COMMENT_REGEX)
      if (!match) {
        emit('updateCount', 0)
        return
      }
      const maybeNumber = Number.parseInt(match[1] !== text ? match[1] : text, 10) || 0
      node.textContent = maybeNumber.toString()
      emit('updateCount', maybeNumber)
    }
  })

  observer.observe(count.value, { subtree: true, childList: true })

  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <span ref="count" class="comment-box relative pointer-events-none select-none">
    <i class="icon-comment comment-icon absolute inset-0" aria-hidden="true" />
    <DisqusCount class="absolute inset-0 text-center" :shortname="shortname" :identifier="identifier" />
  </span>
</template>

<style lang="scss" scoped>
.comment-box {
  width: 1.875rem;
  height: 1.875rem;
}

.comment-icon {
  font-size: 1.875rem;
  color: #f0f0f0;
}
</style>
