import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { parse } from 'node-html-parser'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders front page contains default and front profile', async () => {
    const html = await $fetch('/')
    expect(html).toContain('##default##')
    expect(html).toContain('##front##')
    expect(html).not.toContain('##article##')
  })

  it('renders article page contains default and article profile', async () => {
    const html = await $fetch('/article')
    expect(html).toContain('##default##')
    expect(html).not.toContain('##front##')
    expect(html).toContain('##article##')
  })

  it('renders complex page contains real user script', async () => {
    const html = await $fetch('/complex')
    expect(html).toContain('https://cdn.consentmanager.net/delivery/autoblocking/ac7bdf80b1ac2.js')
    expect(html).toContain('d.delivery.consentmanager.net')

    const root = parse(html)
    const script = root.querySelector('script[data-cmp-ab="1"]')
    expect(script?.outerHTML).toMatchInlineSnapshot(
      '"<script type=\\"text/javascript\\" data-cmp-ab=\\"1\\" src=\\"https://cdn.consentmanager.net/delivery/autoblocking/ac7bdf80b1ac2.js\\" data-cmp-host=\\"d.delivery.consentmanager.net\\" data-cmp-cdn=\\"cdn.consentmanager.net\\" data-cmp-codesrc=\\"0\\"></script>"',
    )
  })
})
