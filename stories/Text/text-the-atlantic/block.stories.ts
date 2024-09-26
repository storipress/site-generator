import type { Meta, StoryObj } from '@storybook/vue3'

import Block from '#builder-blocks/Text/text-the-atlantic/block/my-block.vue'

const meta = {
  title: 'Text/text-the-atlantic',
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
