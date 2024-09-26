import path from 'node:path'
import fs from 'fs-extra'
import { execa } from 'execa'
import yaml from 'js-yaml'
import invariant from 'tiny-invariant'
import { globby } from 'globby'

import { SITE_BASE } from './definitions'

const ROOT_PATH = fs.existsSync('/var/task') ? '/var/task' : process.cwd()
export const YARN_BIN_PATH = '.yarn/releases/yarn-4.1.1.cjs'
const YARN_PATH = path.join(SITE_BASE, YARN_BIN_PATH)

export async function extractSite(base: string, zipPath: string, cleanup = true) {
  invariant(fs.pathExistsSync(base), `${base} not found`)
  if (cleanup) {
    await fs.remove(zipPath)
  }
}
export async function prepareSiteBase() {
  // ensure no previous file in the SITE_BASE
  await fs.emptyDir(SITE_BASE)
  await fs.mkdirs(SITE_BASE)
}

export async function copyProject() {
  const projectPath = SITE_BASE
  const files = await globby(['*', '!tmp', '!node_modules', '!*.tar.br'], {
    cwd: ROOT_PATH,
    absolute: true,
    dot: true,
    onlyFiles: false,
  })
  const promises = files.map((file) => fs.copy(file, path.join(projectPath, path.basename(file))))
  await Promise.all(promises)
}

export async function setupProject() {
  await configYarn()
  await execYarn({ args: ['install'] })
}

const YARN_CONFIG_PATH = path.join(SITE_BASE, '.yarnrc.yml')

async function configYarn() {
  const config = await loadYarnConfig()

  // use node-modules for compatible
  config.nodeLinker = 'node-modules'

  // make yarn only touch files under /tmp
  config.enableGlobalCache = false
  config.cacheFolder = '/tmp/home/.yarn-cache'

  // remove custom yarn and plugins
  Reflect.deleteProperty(config, 'yarnPath')
  Reflect.deleteProperty(config, 'plugins')

  await fs.writeFile(YARN_CONFIG_PATH, yaml.dump(config))
}

async function loadYarnConfig(): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile(YARN_CONFIG_PATH, 'utf-8')
    const config = yaml.load(content) || ({} as Record<string, unknown>)
    invariant(config !== null && typeof config === 'object', 'YAML config invalid')
    return config as unknown as Record<string, unknown>
  } catch {
    return {}
  }
}

export async function execYarn({
  args,
  stdio = 'ignore',
  env,
  cwd = SITE_BASE,
}: {
  args: string[]
  stdio?: 'ignore' | 'inherit'
  env?: Record<string, string>
  cwd?: string
}) {
  await execa(YARN_PATH, args, {
    cwd,
    env: {
      HOME: '/tmp/home',
      XDG_DATA_HOME: '/tmp/home/.local/share',
      XDG_CACHE_HOME: '/tmp/home/.cache',
      PATH: process.env.PATH,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      ...env,
    },
    extendEnv: false,
    stdio,
  })
}
