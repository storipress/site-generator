import { createBrotliCompress, createBrotliDecompress } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { createCommonJS } from 'mlly'
import invariant from 'tiny-invariant'
import { $, argv, cd, echo, fs, path } from 'zx'
import { create, extract } from 'tar'
import { dedent } from 'ts-dedent'
import type encryptKeyType from '../cli/encrypt-key.json'

const { __dirname } = createCommonJS(import.meta.url)
const SNAPSHOT_BASE = path.resolve(__dirname, '../cli/snapshot')
const GENERATED_SNAPSHOT = path.resolve(__dirname, '../cli/snapshot/generated-snapshot.tar.br')
const GENERATED_DIRECTORY = path.resolve(__dirname, '../playground/generated')
const SITE_DIRECTORY = path.resolve(__dirname, '../playground')
const SITE_OUTPUT = path.resolve(__dirname, '../playground/dist')
const SNAPSHOT_PATH = path.resolve(__dirname, '../cli/snapshot/snapshot.tar.br')

const ENCRYPT_KEY_PATH = path.resolve(__dirname, '../cli/encrypt-key.json')

const OUTER_ENV_PATH = path.resolve(__dirname, '../.env')
const SITE_ENV_PATH = path.resolve(__dirname, '../playground/.env')

await fs.mkdirs(SNAPSHOT_BASE)
const clientId = argv._[0] ?? 'DZA28GT04'
if (argv._[0] || !(await fs.pathExists(GENERATED_SNAPSHOT))) {
  invariant(clientId, 'missing client id')
  await $`yarn select ${clientId}`
  // Use create function from tar to compress ../playground/generated to GENERATED_SNAPSHOT
  await compress(GENERATED_DIRECTORY, GENERATED_SNAPSHOT)
} else {
  echo('decompress snapshot')
  await fs.remove(GENERATED_DIRECTORY)
  await fs.mkdirs(GENERATED_DIRECTORY)
  // Decompress the generated snapshot
  await pipeline(
    fs.createReadStream(GENERATED_SNAPSHOT),
    createBrotliDecompress(),
    extract({ cwd: GENERATED_DIRECTORY }),
  )
}

cd(SITE_DIRECTORY)
await patchEnvFile()

await $`NITRO_PRESET=cloudflare-pages yarn build`
await compress(SITE_OUTPUT, SNAPSHOT_PATH)

async function patchEnvFile() {
  const encryptKey: typeof encryptKeyType = await fs.readJSON(ENCRYPT_KEY_PATH)
  let env
  try {
    env = await fs.readFile(SITE_ENV_PATH, 'utf-8')
  } catch {
    env = ''
  }

  env += '\n'

  env += dedent`
  NUXT_KARBON_CLIENT_ID=USE_MOCK
  NUXT_KARBON_RELEASE_ID=1
  NUXT_KARBON_ENCRYPT_KEY=${JSON.stringify(encryptKey.key)}
  NUXT_APP_CDN_URL='https://static.stori.press/##_CLIENT_ID_##/'`
  env += '\n'

  await fs.writeFile(SITE_ENV_PATH, env)
  await fs.writeFile(OUTER_ENV_PATH, env)
}

async function compress(source: string, dest: string) {
  await pipeline(create({ cwd: source, follow: true }, ['.']), createBrotliCompress(), fs.createWriteStream(dest))
}
