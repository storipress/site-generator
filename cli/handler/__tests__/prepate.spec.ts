import { resolve } from 'node:path'
import fs from 'node:fs'
import { createCommonJS } from 'mlly'
import { expect, it } from 'vitest'
import { YARN_BIN_PATH } from '../prepare'

const { __dirname } = createCommonJS(import.meta.url)
const projectRoot = resolve(__dirname, '../../..')

it('yarn bin path exist', () => {
  expect(fs.existsSync(resolve(projectRoot, YARN_BIN_PATH)), `\`${YARN_BIN_PATH}\` not exist`).toBe(true)
})
