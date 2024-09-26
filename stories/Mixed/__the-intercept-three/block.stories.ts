import type { Meta, StoryObj } from '@storybook/vue3'

import Block from '#builder-blocks/Mixed/__the-intercept-three/block/my-block.vue'

const meta = {
  title: 'Mixed/__the-intercept-three',
  component: Block,
} satisfies Meta<typeof Block>

export default meta
type Story = StoryObj<typeof meta>

export const Template: Story = {
  args: {
    block: {
      id: blockObj.blockId,
    },
  },
}
