import { upperCase } from 'lodash'

function createVirtualDesk(siteName: string, name: string) {
  const displayName = upperCase(name)
  return {
    id: `@@${name}`,
    name: displayName,
    slug: name,
    url: `/${name}`,
    seo: {
      slug: name,
      meta: {
        title: `${displayName} - ${siteName}`,
        description: '',
      },
      og: {
        title: `${displayName} - ${siteName}`,
        description: '',
      },
      ogImage: '',
      inject: { header: '', footer: '' },
    },
  }
}

export const createLatestDesk = (siteName: string) => createVirtualDesk(siteName, 'latest')
export const createFeaturedDesk = (siteName: string) => createVirtualDesk(siteName, 'featured')
