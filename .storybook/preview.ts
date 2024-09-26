import type { Preview } from '@storybook/vue3'
import '../assets/css/tailwind.css'
import 'uno.css'
import { vueRouter } from 'storybook-vue3-router'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
  decorators: [vueRouter()],
}

export default preview
