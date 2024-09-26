import { defineConfig, e, presetTypography, presetUno } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'
import { h } from '@unocss/preset-mini/utils'

const baseStyles = `
  position: relative;
  padding-bottom: calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%);
`

const childStyles = `
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

export const baseUnocssConfig = defineConfig({
  presets: [presetUno({}), presetTypography()],
  preflights: [
    {
      getCSS: () => `
          * {
            --tw-translate-x: 0;
            --tw-translate-y: 0;
            --tw-rotate: 0;
            --tw-skew-x: 0;
            --tw-skew-y: 0;
            --tw-scale-x: 1;
            --tw-scale-y: 1;
          }
        `,
    },
  ],
  extendTheme: [
    (theme) => {
      ;(theme as any).breakpoints.lg = '1070px'
    },
  ],
  rules: [
    [/^ff-(.+)$/, ([, family]) => ({ 'font-family': `"${h.bracket(family)}"` })],
    [
      'aspect-none',
      (_match, { rawSelector }) => {
        const selector = e(rawSelector)
        // return a string instead of an object
        return `
              .${selector} {
                position: static;
                padding-bottom: 0;
              }
              .${selector} > * {
                position: static;
                height: auto;
                width: auto;
                top: auto;
                right: auto;
                bottom: auto;
                left: auto;
              }
            `
      },
    ],
    [
      /aspect-w-(\d+)/,
      ([, value], { rawSelector }) => {
        const selector = e(rawSelector)
        // return a string instead of an object
        return `
                .${selector} {
                  ${baseStyles}
                  --tw-aspect-w: ${value};
                }
                .${selector} > * {
                  ${childStyles}
                }`
      },
    ],
    [
      /aspect-h-(\d+)/,
      ([, value]) => ({
        '--tw-aspect-h': value,
      }),
    ],
  ],
  transformers: [transformerDirectives()],
})
