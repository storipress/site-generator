import { addComponent, addImportsDir, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type {} from '@nuxt/schema'
import { mergeParsedHTML, parseToInjectHTML } from './helpers/parse-to-head'

export interface Profile {
  header?: string
  footer?: string
}

export interface ModuleOptions {
  profiles: Record<string, Profile>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'inject-html',
    version: '0.0.1',
    configKey: 'injectHtml',
  },
  defaults: {
    profiles: {},
  },
  setup({ profiles }) {
    const resolver = createResolver(import.meta.url)
    const parsedProfiles = Object.fromEntries(
      Object.entries(profiles).map(([name, profile]) => {
        return [
          name,
          mergeParsedHTML([
            parseToInjectHTML(profile.header || ''),
            parseToInjectHTML(profile.footer || '', 'bodyClose'),
          ]),
        ]
      }),
    )
    addImportsDir(resolver.resolve('./runtime/composables'))
    addComponent({
      name: 'FooterHtml',
      filePath: resolver.resolve('./runtime/components/FooterHtml.vue'),
    })
    addTemplate({
      filename: 'inject-html-profile.mjs',
      getContents: () => `
      export default ${JSON.stringify(parsedProfiles)}
      `,
    })
  },
})
