import fs from 'node:fs'
import path from 'node:path'

const projectDir = 'Builder-Blocks'
const storiesDir = 'stories'
const targetDirectories = ['Hero', 'Footer', 'Mixed', 'OneRow', 'Single', 'SubscriptionBox', 'Text', 'TwoRow']

function generateStories(directory: string) {
  const componentPath = path.relative(projectDir, directory)

  const storyContent = `import type { Meta, StoryObj } from '@storybook/vue3'

import Block from '#builder-blocks/${componentPath}/block/my-block.vue'

const meta = {
  title: '${componentPath}',
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
`
  const storyDirPath = path.join(storiesDir, componentPath)
  const storyFilePath = path.join(storyDirPath, 'block.stories.ts')

  if (!fs.existsSync(storyDirPath)) {
    fs.mkdirSync(storyDirPath, { recursive: true })
  }

  fs.writeFileSync(storyFilePath, storyContent)
}

function traverseDirectory(directory: string) {
  const contents = fs.readdirSync(directory, { withFileTypes: true })
  contents.forEach((item) => {
    if (item.isDirectory()) {
      const itemPath = path.join(directory, item.name)
      if (fs.existsSync(path.join(itemPath, 'block', 'my-block.vue'))) {
        generateStories(itemPath)
      }
      traverseDirectory(itemPath)
    }
  })
}

targetDirectories.forEach((dir) => {
  const dirPath = path.join(projectDir, dir)
  if (fs.existsSync(dirPath)) {
    traverseDirectory(dirPath)
  }
})
