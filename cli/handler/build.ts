import path from 'node:path'
import { P, match } from 'ts-pattern'
import { execa } from 'execa'
import { key as encryptKey } from '../encrypt-key.json'
import { execYarn } from './prepare'
import { logger } from './pino'
import { collectFiles, toCompressedBuffer } from './compress'
import { getAPIHost, getSiteInfo } from './site-info'

export async function buildProject(root: string, token: string, clientId: string, releaseId: string) {
  const { siteName, siteDescription, customerSiteDomain, cdnUrl, searchKey } = await getSiteInfo(clientId, token)
  const buildRoot = path.resolve(root, 'playground')

  const baseEnv = {
    NUXT_KARBON_CLIENT_ID: clientId,
    NUXT_KARBON_API_TOKEN: token,
    NUXT_KARBON_SEARCH_KEY: searchKey,
    NUXT_KARBON_RELEASE_ID: releaseId,
    ...getEnvironmentVariables(clientId),
  }

  logger.info({ env: baseEnv }, 'start build')

  await execYarn({ args: ['nuxi', 'prepare'], env: baseEnv, cwd: root })
  await execYarn({ args: ['nuxi', 'prepare', buildRoot], env: baseEnv, cwd: root })
  await execYarn({
    args: ['generate-templates'],
    stdio: 'inherit',
    env: baseEnv,
    cwd: root,
  })

  await execa('nuxt', ['build', buildRoot], {
    cwd: path.resolve(root),
    localDir: root,
    preferLocal: true,
    stdio: 'inherit',
    env: {
      NITRO_PRESET: 'cloudflare-pages',
      NODE_OPTIONS: '--max-old-space-size=8192',
      NUXT_PUBLIC_SITE_NAME: siteName,
      NUXT_PUBLIC_SITE_DESCRIPTION: siteDescription ?? undefined,
      NUXT_PUBLIC_SITE_URL: customerSiteDomain,
      NUXT_PUBLIC_CDN_URL: cdnUrl,
      NUXT_APP_CDN_URL: buildCdnUrl(clientId),
      ...baseEnv,
    },
  })

  const fileList = await collectFiles(buildRoot)

  return toCompressedBuffer(buildRoot, fileList)
}

/*
NUXT_KARBON_API_HOST=https://api.storipress.dev
NUXT_KARBON_SEARCH_DOMAIN=search.storipress.dev
NUXT_KARBON_ENCRYPT_KEY=
*/
function getEnvironmentVariables(clientID: string) {
  const apiHost = getAPIHost(clientID)

  return match(clientID)
    .with(
      P.when((id) => id.startsWith('D')),
      () => ({
        NUXT_KARBON_API_HOST: apiHost,
        NUXT_KARBON_SEARCH_DOMAIN: 'search.storipress.dev',
        NUXT_KARBON_ENCRYPT_KEY: encryptKey,
      }),
    )
    .with(
      P.when((id) => id.startsWith('S')),
      () => ({
        NUXT_KARBON_API_HOST: apiHost,
        NUXT_KARBON_SEARCH_DOMAIN: 'search.storipress.pro',
        NUXT_KARBON_ENCRYPT_KEY: encryptKey,
      }),
    )
    .otherwise(() => ({
      NUXT_KARBON_API_HOST: apiHost,
      NUXT_KARBON_SEARCH_DOMAIN: 'search.stori.press',
      NUXT_KARBON_ENCRYPT_KEY: encryptKey,
    }))
}

function buildCdnUrl(clientID: string) {
  return `https://static.stori.press/${clientID}/`
}
