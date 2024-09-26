import { fs, globby, path } from 'zx'
import { objectKeys } from 'tsafe'
import invariant from 'tiny-invariant'
import type { SiteInfo } from './site-info'
import { logger } from './pino'

const replacements = {
  '##_CDN_URL_##': 'cdnUrl',
  '##_SEARCH_DOMAIN_##': 'searchDomain',
  '##_SEARCH_KEY_##': 'searchKey',
  '##_SRRIPE_KEY_##': 'stripeKey',
  '##_API_HOST_##': 'apiHost',
  '##_API_TOKEN_##': 'apiToken',
  '##_CLIENT_ID_##': 'clientId',
  '##_SITE_NAME_##': 'siteName',
  '##_SITE_DESCRIPTION_##': 'siteDescription',
  '##_CUSTOMER_SITE_DOMAIN_##': 'customerSiteDomain',
  '##_CUSTOM_DOMAIN_##': 'customDomain',
  '##_TIMEZONE_##': 'timezone',
  '##_WORKSPACE_##': 'workspace',
  '##_PLAN_##': 'plan',
} as const

export async function patchOutput(buildPath: string, siteInfo: SiteInfo) {
  const workerPath = path.join(buildPath, '_worker.js')
  const workerStat = await fs.stat(workerPath)
  if (workerStat.isFile()) {
    logger.info(`patching worker file under ${workerPath}`)
    await patchFile(workerPath, siteInfo)
  } else {
    invariant(workerStat.isDirectory(), 'worker path is not a directory')
    logger.info(`patching worker directory under ${workerPath}/`)
    const files = await globby('**/*.{js,mjs}', { cwd: workerPath })
    for (const file of files) {
      await patchFile(path.join(workerPath, file), siteInfo)
    }
  }
}

async function patchFile(filePath: string, siteInfo: SiteInfo) {
  const data = await fs.readFile(filePath, 'utf-8')
  logger.info(`patch ${filePath}`)

  let result = data
  for (const key of objectKeys(replacements)) {
    const dataKey = replacements[key]
    result = result.replaceAll(key, siteInfo[dataKey] ?? 'null')
  }

  await fs.writeFile(filePath, result)
}
