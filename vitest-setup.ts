import { expect } from 'vitest'

expect.addSnapshotSerializer({
  test(item) {
    return Boolean(typeof item === 'string' && item.match(/data-v-\w{8}/))
  },
  serialize(val: string, config, indentation, depth, refs, printer) {
    return printer(val.replaceAll(/data-v-\w{8}/g, 'data-v-scopeid'), config, indentation, depth, refs)
  },
})
