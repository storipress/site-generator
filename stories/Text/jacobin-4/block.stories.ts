import type { Meta, StoryObj } from '@storybook/vue3'

import Block from '#builder-blocks/Text/jacobin-4/block/my-block.vue'

const meta = {
  title: 'Text/jacobin-4',
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
