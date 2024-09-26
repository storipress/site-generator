import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { defineNitroPreset as _defineNitroPreset } from 'nitropack'
import { cloudflare } from 'unenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// HACK: nitro will use alias to rewrite `nitropack` to `nitropack/config` which cause `defineNitroPreset` is not a function error
const defineNitroPreset: typeof _defineNitroPreset = (preset) => preset

export default defineNitroPreset({
  extends: 'cloudflare-pages',
  // override entry point to init OpenTelemetry SDK
  entry: path.resolve(__dirname, 'nitro-entry.ts'),
  // ! to use OpenTelemetry, we need to enable nodejs_compat
  unenv: cloudflare,
})
