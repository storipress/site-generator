import type { Meta, StoryObj } from '@storybook/vue3'

import Block from '#builder-blocks/OneRow/new-republic-four/block/my-block.vue'

const meta = {
  title: 'OneRow/new-republic-four',
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
