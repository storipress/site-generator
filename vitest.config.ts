import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['Builder-Blocks', 'node_modules'],
    setupFiles: ['./vitest-setup.ts'],
  },
})
