import type { Meta, StoryObj } from '@storybook/vue3'

import Block from '#builder-blocks/TwoRow/2r-nyt-mag/block/my-block.vue'

const meta = {
  title: 'TwoRow/2r-nyt-mag',
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
