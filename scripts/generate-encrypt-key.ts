import crypto from 'node:crypto'
import { fs, path } from 'zx'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)

async function main() {
  await fs.writeJSON(path.resolve(__dirname, '../cli/encrypt-key.json'), {
    key: generateEncryptKey(),
  })
}

main()

// base64 encoded 32 byte key
function generateEncryptKey() {
  return crypto.randomBytes(32).toString('base64')
}
