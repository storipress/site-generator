import { build } from 'vite'
import type { OutputAsset, RollupOutput } from 'rollup'
import { html } from 'proper-tags'
import vue from '@vitejs/plugin-vue'
import { expect, it } from 'vitest'
import { keyedComponent } from '../keyed-component'

it('work with simple case', async () => {
  const code = html`
    <template>
      <ArticleBlock v-slot="{article}">
        <h1>{{article.title}}</h1>
        <p>{{article.body}}</p>
        <template v-for="i of 3" :key="i">{{i}}</template>
      </ArticleBlock>
    </template>
  `

  const { vue } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <ArticleBlock auto-key=\\"$ak$uihs43npny\\"  v-slot=\\"{article}\\">
        <h1>{{article.title}}</h1>
        <p>{{article.body}}</p>
        <LoopKeyed as=\\"template\\"  :auto-key=\\"\`$ak$chv5iBGGk3--\${i}\`\\"  v-for=\\"i of 3\\" :key=\\"i\\">{{i}}</LoopKeyed>
      </ArticleBlock>
    </template>
    "
  `)
})

it('work with non self close', async () => {
  const code = html`
    <template>
      <ArticleBlock></ArticleBlock>
    </template>
  `

  const { vue } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <ArticleBlock auto-key=\\"$ak$uihs43npny\\" ></ArticleBlock>
    </template>
    "
  `)
})

it('work with v-for', async () => {
  const code = html`
    <template>
      <ArticleBlock v-for="i of 3" :key="i"></ArticleBlock>
    </template>
  `

  const { vue, code: res } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <ArticleBlock :auto-key=\\"\`$ak$uihs43npny--\${i}\`\\"  v-for=\\"i of 3\\" :key=\\"i\\"></ArticleBlock>
    </template>
    "
  `)
  expect(res).toMatchSnapshot()
})

it('work with multiple component', async () => {
  const code = html`
    <template>
      <ArticleBlock v-for="i of 3" :key="i"></ArticleBlock>
      <ArticleBlock v-for="i of 3" :key="i"></ArticleBlock>
      <ArticleBlock v-for="i of 3" :key="i"></ArticleBlock>
      <ArticleBlock v-for="i of 3" :key="i"></ArticleBlock>
    </template>
  `

  const { vue, code: res } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <ArticleBlock :auto-key=\\"\`$ak$uihs43npny--\${i}\`\\"  v-for=\\"i of 3\\" :key=\\"i\\"></ArticleBlock>
      <ArticleBlock :auto-key=\\"\`$ak$chv5iBGGk3--\${i}\`\\"  v-for=\\"i of 3\\" :key=\\"i\\"></ArticleBlock>
      <ArticleBlock :auto-key=\\"\`$ak$D0ASxrO3qi--\${i}\`\\"  v-for=\\"i of 3\\" :key=\\"i\\"></ArticleBlock>
      <ArticleBlock :auto-key=\\"\`$ak$KlWdH8wBzw--\${i}\`\\"  v-for=\\"i of 3\\" :key=\\"i\\"></ArticleBlock>
    </template>
    "
  `)
  expect(res).toMatchSnapshot()
})

it('work with v-for variable', async () => {
  const code = html`
    <template>
      <ArticleBlock v-for="i of [1, 2, 3]" :key="i"></ArticleBlock>
    </template>
  `

  const { vue, code: res } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <ArticleBlock :auto-key=\\"\`$ak$uihs43npny--\${i}\`\\"  v-for=\\"i of [1, 2, 3]\\" :key=\\"i\\"></ArticleBlock>
    </template>
    "
  `)
  expect(res).toMatchSnapshot()
})

it('auto key v-for context', async () => {
  const code = html`
    <template>
      <div v-for="i in 3" :key="i">
        <ArticleBlock />
      </div>
    </template>
  `

  const { vue } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <LoopKeyed as=\\"div\\"  :auto-key=\\"\`$ak$uihs43npny--\${i}\`\\"  v-for=\\"i in 3\\" :key=\\"i\\">
        <ArticleBlock auto-key=\\"$ak$chv5iBGGk3\\"  />
      </LoopKeyed>
    </template>
    "
  `)
})

it('work with real world example', async () => {
  const code = html`
    <template>
      <ArticleBlock
        class="article-wrapper grid grid-cols-2"
        v-for="articleIndex in 3"
        v-slot="{ article }"
        :key="articleIndex"
      >
        <LinkElement :href="article.url"
          ><ResponsiveImage
            class="article-img col-span-1"
            sizes="(max-width: 768px) 45vw, (max-width: 1060px) 25vw, 15vw"
            :src="article.headline"
            :alt="article.headlineAlt"
        /></LinkElement>

        <div class="col-span-1 px-3">
          <LinkElement :href="article.url">
            <TextElement
              component="h3"
              kind="article-title--sm"
              color="0A0A0A"
              :fontSize="15"
              fontFamily="HK Grotesk"
              bold
              class="mb-1 cursor-pointer"
              :lineHeight="1.2"
            >
              {{ article.title }}
            </TextElement>
          </LinkElement>
          <TextElement component="p" kind="article-authors"
            ><div class="inline-block" v-for="(author, index) in article.authors" :key="index + author.name">
              <LinkElement class="author-link" :key="index" :href="author.url">{{ author.name }}</LinkElement
              ><span v-if="index < article.authors.length - 2">,&nbsp;</span>
              <span v-if="index === article.authors.length - 2">&amp;&nbsp;</span>
            </div></TextElement
          >
        </div>
      </ArticleBlock>
    </template>
  `

  const { vue } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <ArticleBlock :auto-key=\\"\`$ak$uihs43npny--\${articleIndex}\`\\" 
        class=\\"article-wrapper grid grid-cols-2\\"
        v-for=\\"articleIndex in 3\\"
        v-slot=\\"{ article }\\"
        :key=\\"articleIndex\\"
      >
        <LinkElement :href=\\"article.url\\"
          ><ResponsiveImage
            class=\\"article-img col-span-1\\"
            sizes=\\"(max-width: 768px) 45vw, (max-width: 1060px) 25vw, 15vw\\"
            :src=\\"article.headline\\"
            :alt=\\"article.headlineAlt\\"
        /></LinkElement>

        <div class=\\"col-span-1 px-3\\">
          <LinkElement :href=\\"article.url\\">
            <TextElement
              component=\\"h3\\"
              kind=\\"article-title--sm\\"
              color=\\"0A0A0A\\"
              :fontSize=\\"15\\"
              fontFamily=\\"HK Grotesk\\"
              bold
              class=\\"mb-1 cursor-pointer\\"
              :lineHeight=\\"1.2\\"
            >
              {{ article.title }}
            </TextElement>
          </LinkElement>
          <TextElement component=\\"p\\" kind=\\"article-authors\\"
            ><LoopKeyed as=\\"div\\"  :auto-key=\\"\`$ak$chv5iBGGk3--\${index + author.name}\`\\"  class=\\"inline-block\\" v-for=\\"(author, index) in article.authors\\" :key=\\"index + author.name\\">
              <LinkElement class=\\"author-link\\" :key=\\"index\\" :href=\\"author.url\\">{{ author.name }}</LinkElement
              ><span v-if=\\"index < article.authors.length - 2\\">,&nbsp;</span>
              <span v-if=\\"index === article.authors.length - 2\\">&amp;&nbsp;</span>
            </LoopKeyed></TextElement
          >
        </div>
      </ArticleBlock>
    </template>
    "
  `)
})

it('allow manually request key', async () => {
  const code = html`
    <template>
      <ArticleTile data-keyed />
      <ArticleTile data-keyed />
      <ArticleTile data-keyed />
    </template>
  `

  const { vue } = await createBuild({ code })

  expect(vue).toMatchInlineSnapshot(`
    "<template>
      <LoopKeyed :as=\\"resolveComponent('ArticleTile')\\"  auto-key=\\"$ak$uihs43npny\\"  data-keyed />
      <LoopKeyed :as=\\"resolveComponent('ArticleTile')\\"  auto-key=\\"$ak$chv5iBGGk3\\"  data-keyed />
      <LoopKeyed :as=\\"resolveComponent('ArticleTile')\\"  auto-key=\\"$ak$D0ASxrO3qi\\"  data-keyed />
    </template>
    "
  `)
})

interface CreateTransformBuildInput {
  code: string
  pathPrefix?: string
}

export async function createBuild({ code, pathPrefix }: CreateTransformBuildInput) {
  let vueCode = ''
  const res = await build({
    logLevel: 'error',
    configFile: false,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id.endsWith('entry')) {
            return id
          }
          if (id.endsWith('entry.vue')) {
            return id
          }
        },
        load(id) {
          if (id.endsWith('entry')) {
            return `
              export {default} from '${pathPrefix ?? ''}/entry.vue'
            `
          }
          if (id.endsWith('entry.vue')) {
            return code
          }
        },
      },
      keyedComponent({
        components: ['ArticleBlock'],
        include: [/\.vue$/],
      }),
      {
        name: 'inspect',
        transform(code, id) {
          if (id.endsWith('entry.vue')) {
            vueCode = code
          }
          return code
        },
      },
      vue({}),
    ],
    build: {
      lib: {
        entry: 'entry',
        formats: ['es'],
      },
      rollupOptions: {
        output: undefined,
        external: ['vue'],
      },
    },
  })

  const out = res as RollupOutput[]

  return {
    code: out[0].output[0].code,
    vue: vueCode,
    css: (out[0].output[1] as OutputAsset)?.source || '',
  }
}
