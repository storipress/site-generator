<script lang="ts" setup>
const root = ref<HTMLFormElement>()
const message = ref('')
const result = ref('')
const raw = ref({})

const $paywall = usePaywall()
const $storipress = useStoripress()

function clear() {
  result.value = ''
  message.value = ''
  raw.value = {}
}

function submit(event: Event) {
  event.preventDefault()
  clear()
  try {
    const form = new FormData(root.value as HTMLFormElement)
    const formParams = Object.fromEntries(form.entries())
    const fieldName = $storipress.mail?.fieldName || 'email'
    const email = formParams[fieldName] || formParams.EMAIL || formParams.email
    if (!email) {
      result.value = 'ERROR'
      message.value = 'Please enter your email address'
      return
    }
    $paywall.signUp(email as string)
    result.value = ''
  } catch {}
}
</script>

<template>
  <form ref="root" @submit="submit">
    <slot :result="result" :message="message" :raw="raw" :clear="clear" />
  </form>
</template>
