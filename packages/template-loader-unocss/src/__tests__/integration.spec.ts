import { describe, expect, it } from 'vitest'
import { html } from 'proper-tags'
import { createTransformBuild } from '../test-helper'
import { createAttributeOverride } from '../attribute-override'

describe('block', () => {
  it.each([
    [
      'basic',
      html`
        <template>
          <TextElement
            component="h2"
            kind="featured-article-title"
            blockType="Featured Article Title"
            :fontSize="{ lg: 42, md: 31, xs: 31 }"
            fontFamily="Charis SIL"
            color="191919"
            hoverColor="FF0000"
            class="mt-8 leading-tight duration-200 md:mt-0 hover:text-red-500 transition-color"
            >foo</TextElement
          >
        </template>
      `,
    ],
    [
      'block with background',
      html`
        <template>
          <Block backgroundColor="ff0000" />
        </template>
      `,
    ],
    [
      'hero block with background',
      html`
        <template>
          <HeroBlock backgroundColor="ff0000" />
        </template>
      `,
    ],
    [
      'hero block with spacing',
      html`
        <template>
          <HeroBlock>
            <SpacingProvider width="100%" max="100%" />
          </HeroBlock>
        </template>
      `,
    ],
    [
      'navbar',
      html`
        <template>
          <Navigation>
            <TextInput kind="title" blockType="Title" bold />
          </Navigation>
        </template>
      `,
    ],
    [
      'width',
      html`
        <template>
          <div style="width: 10%;"></div>
        </template>
      `,
    ],
  ])('able to process `%s` fixture', async (_name: string, code: string) => {
    const { vue } = await createTransformBuild({
      code,
    })
    expect(vue).toMatchSnapshot()
  })
})

describe('article', () => {
  it.each([
    [
      'basic',
      html`
        <template>
          <ArticleBlock>
            <HeaderBlock>
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
          </ArticleBlock>
        </template>
      `,
    ],
    [
      'background',
      html`
        <template>
          <ArticleBlock backgroundColor="000">
            <HeaderBlock>
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
          </ArticleBlock>
        </template>
      `,
    ],
    [
      'header background',
      html`
        <template>
          <ArticleBlock backgroundColor="000">
            <HeaderBlock backgroundColor="f00">
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
          </ArticleBlock>
        </template>
      `,
    ],
    [
      'content',
      html`
        <template>
          <ArticleBlock backgroundColor="000">
            <HeaderBlock backgroundColor="f00">
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
            <content>
              <Paragraph bold />
            </content>
          </ArticleBlock>
        </template>
      `,
    ],
  ])('able to process block `%s` fixture', async (_name: string, code: string) => {
    const { vue } = await createTransformBuild({
      code,
    })
    expect(vue).toMatchSnapshot()
  })
})

describe('article: with override enable', () => {
  it.each([
    [
      'basic',
      html`
        <template>
          <ArticleBlock>
            <HeaderBlock>
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
          </ArticleBlock>
        </template>
      `,
    ],
    [
      'background',
      html`
        <template>
          <ArticleBlock backgroundColor="000">
            <HeaderBlock>
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
          </ArticleBlock>
        </template>
      `,
    ],
    [
      'header background',
      html`
        <template>
          <ArticleBlock backgroundColor="000">
            <HeaderBlock backgroundColor="f00">
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
          </ArticleBlock>
        </template>
      `,
    ],
    [
      'content',
      html`
        <template>
          <ArticleBlock backgroundColor="000">
            <HeaderBlock backgroundColor="f00">
              <TitleElement bold />
              <Description bold />
            </HeaderBlock>
            <content>
              <Paragraph bold />
            </content>
          </ArticleBlock>
        </template>
      `,
    ],
  ])('able to process block `%s` fixture', async (_name: string, code: string) => {
    const { vue } = await createTransformBuild({
      code,
      pathPrefix: '/blocks/article',
      hooks: {
        'transformer:attribute': createAttributeOverride({
          root: '/blocks',
          map: {},
        }),
      },
    })
    expect(vue).toMatchSnapshot()
  })

  it.each([
    [
      'basic',
      html`
        <template>
          <ArticleBlock>
            <TitleElement color="fff" />
          </ArticleBlock>
        </template>
      `,
    ],
    [
      'with kind',
      html`
        <template>
          <ArticleBlock>
            <TitleElement kind="hero-title" color="fff" />
          </ArticleBlock>
        </template>
      `,
    ],
  ])('able to process article `%s` fixture', async (_name: string, code: string) => {
    const { vue } = await createTransformBuild({
      code,
    })
    expect(vue).toMatchSnapshot()
  })
})

describe('extractTemplateStaticConfig', () => {
  it.each([
    [
      'static keyed element',
      html`
        <template>
          <div key="foo" />
        </template>
      `,
    ],
    [
      'block with background',
      html`
        <template>
          <Block backgroundColor="ff0000" />
        </template>
      `,
    ],
    [
      'hero block with background',
      html`
        <template>
          <HeroBlock backgroundColor="ff0000" />
        </template>
      `,
    ],
    [
      'block with background and content',
      html`
        <template>
          <Block backgroundColor="ff0000">
            <TextElement kind="foo" color="ff0000" />
          </Block>
        </template>
      `,
    ],
    [
      'complex hero block',
      html`
        <template>
          <HeroBlock :block="block" backgroundColor="000">
            <NavBar class="z-20" />
            <!-- nav-spacer -->
            <div class="md:h-20 h-12"></div>
            <DeskSection v-slot="{ desk }">
              <ArticleBlock class="mb-14 lg:flex-row inset-x-0 flex flex-col w-full mx-auto my-0" v-slot="{ article }">
                <div
                  class="
                    lg:order-2
                    border-opacity-20
                    lg:flex-1
                    md:px-10
                    flex flex-col
                    justify-center
                    px-5
                    py-10
                    border-t border-white border-solid
                  "
                >
                  <TextElement
                    component="p"
                    kind="desk-title"
                    color="fff"
                    :font-size="{ xs: 13, md: 16 }"
                    underline
                    font-family="Standard"
                    >{{ desk }}</TextElement
                  >
                </div>
              </ArticleBlock>
            </DeskSection>
          </HeroBlock>
        </template>
      `,
    ],
    [
      'hero block with spacing and min/max',
      html`
        <template>
          <HeroBlock :block="block" backgroundColor="000">
            <SpacingProvider width="80%" :max="{lg: '1280px'}" />
          </HeroBlock>
        </template>
      `,
    ],
    [
      'block with null color',
      html`
        <template>
          <Block :block="block" :backgroundColor="{ lg: '000', xs: null }" />
        </template>
      `,
    ],
    [
      'complex hero block with spacing',
      html`
        <template>
          <HeroBlock :block="block" backgroundColor="000">
            <NavBar class="z-20" />
            <!-- nav-spacer -->
            <div class="md:h-20 h-12"></div>
            <DeskSection v-slot="{ desk }">
              <ArticleBlock class="mb-14 lg:flex-row inset-x-0 flex flex-col w-full mx-auto my-0" v-slot="{ article }">
                <div
                  class="
                    lg:order-2
                    border-opacity-20
                    lg:flex-1
                    md:px-10
                    flex flex-col
                    justify-center
                    px-5
                    py-10
                    border-t border-white border-solid
                  "
                >
                  <TextElement
                    component="p"
                    kind="desk-title"
                    color="fff"
                    :font-size="{ xs: 13, md: 16 }"
                    underline
                    font-family="Standard"
                    >{{ desk }}</TextElement
                  >
                </div>
              </ArticleBlock>
            </DeskSection>
            <SpacingProvider width="80%" />
          </HeroBlock>
        </template>
      `,
    ],
    [
      'full component',
      html`
        <template>
          <HeroBlock :block="block" backgroundColor="000">
            <NavBar class="z-20" />
            <!-- nav-spacer -->
            <div class="md:h-20 h-12"></div>
            <DeskSection v-slot="{ desk }">
              <ArticleBlock class="mb-14 lg:flex-row inset-x-0 flex flex-col w-full mx-auto my-0" v-slot="{ article }">
                <div
                  class="
                    lg:order-2
                    border-opacity-20
                    lg:flex-1
                    md:px-10
                    flex flex-col
                    justify-center
                    px-5
                    py-10
                    border-t border-white border-solid
                  "
                >
                  <TextElement
                    component="p"
                    kind="desk-title"
                    color="fff"
                    :font-size="{ xs: 13, md: 16 }"
                    underline
                    font-family="Standard"
                    >{{ desk }}</TextElement
                  >
                </div>
              </ArticleBlock>
            </DeskSection>
            <SpacingProvider width="80%" />
          </HeroBlock>
        </template>

        <style>
          .foo {
            color: red;
          }
        </style>
      `,
    ],
  ])('able to process `%s` fixture', async (_name: string, code: string) => {
    const { vue } = await createTransformBuild({
      code,
    })
    expect(vue).toMatchSnapshot()
  })

  it('extract from other page', async () => {
    const { vue } = await createTransformBuild({
      code: html`
        <template>
          <ArticleBlock>
            <TitleElement color="fff" />
          </ArticleBlock>
        </template>
      `,
    })
    expect(vue).toMatchSnapshot()
  })
})
