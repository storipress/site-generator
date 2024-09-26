import { argv, fs, path } from 'zx'
import invariant from 'tiny-invariant'
import { createCommonJS } from 'mlly'
import { buildSnapshot } from './build-snapshot'

const { __dirname } = createCommonJS(import.meta.url)

export async function cli() {
  const token = argv.token
  const clientId = argv['client-id']
  invariant(token, 'token is required')
  invariant(clientId, 'client-id is required')
  const projectRoot = path.resolve(__dirname, '../..')
  const buffer = await buildSnapshot({ projectRoot, clientId, token })
  await fs.writeFile('file.tar.br', buffer)
}

cli()
