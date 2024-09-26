// Override nitro handler to wrap within OpenTelemetry trace
// see: https://github.com/unjs/nitro/blob/7aec22ccb6f6fd388a51bf612527ceed7d916347/src/presets/cloudflare-pages.ts
// see: https://github.com/unjs/nitro/blob/7aec22ccb6f6fd388a51bf612527ceed7d916347/src/runtime/entries/cloudflare-pages.ts
import type { ResolveConfigFn } from '@microlabs/otel-cf-workers'
import { instrument } from '@microlabs/otel-cf-workers'

// Original handler
import handler from '#internal/nitro/entries/cloudflare-pages'

const config: ResolveConfigFn = () => {
  return {
    exporter: {
      url: 'https://api.axiom.co/v1/traces',
      headers: {
        Authorization: 'Bearer xaat-e048c648-6eab-47ff-bf01-2b7d1af47842',
        'x-axiom-dataset': 'storipress_services',
      },
    },
    service: {
      name: 'cf-worker',
    },
  }
}

// Wrap the handler to have request instrument
export default instrument(handler, config)
