import 'dotenv/config'
import process from 'node:process'
import { defineConfig } from 'tsup'
import { load } from 'js-yaml'
import { fs } from 'zx'
import { sentryEsbuildPlugin } from '@sentry/esbuild-plugin'

export default defineConfig({
  entry: ['./cli/handler/index.ts'],
  sourcemap: true,
  target: 'node16',
  format: 'esm',
  noExternal: [/.*/],
  platform: 'node',
  esbuildPlugins: [
    sentryEsbuildPlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.SENTRY_RELEASE_NAME,
      },
      sourcemaps: {
        assets: ['dist/*.js', 'dist/*.js.map'],
        filesToDeleteAfterUpload: ['dist/*.js.map'],
      },
    }),
  ],
  banner: {
    // ESBuild can't rewrite require to esm
    // Ref: https://github.com/evanw/esbuild/issues/1921
    // TODO try remove this when this merge https://github.com/evanw/esbuild/pull/2067
    js: `
import { createRequire as ___createRequire } from 'module';
const require = ___createRequire(import.meta.url);
`,
  },
  async onSuccess() {
    const { yarnPath }: any = load(await fs.readFile('./.yarnrc.yml', 'utf-8'))
    await fs.copyFile(yarnPath, 'dist/yarn.cjs')
  },
})
