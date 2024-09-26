import type { CustomProjectConfig } from 'lost-pixel'

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
    mask: [{ selector: '.responsive-image' }, { selector: '.element' }],
  },
  generateOnly: true,
  failOnDifference: true,
  threshold: 0.05,
}
