import { describe, expect, it, vi } from 'vitest'
import { extractDesign } from '../extract-routes'

vi.mock('../default-front.json', () => ({
  default: {
    texts: { 'b-example': 'default' },
    images: { 'b-example': 'default' },
    blocks: ['b-example'],
    blockStates: {
      'b-example': { type: 'example-block' },
    },
  },
}))

describe('extractDesign', () => {
  it('should extract design', () => {
    expect(extractDesign({})).toMatchInlineSnapshot(`
      {
        "blockStates": {
          "b-example": {
            "type": "example-block",
          },
        },
        "blocks": [
          "b-example",
        ],
        "images": {
          "b-example": "default",
        },
        "texts": {
          "b-example": "default",
        },
      }
    `)

    expect(
      extractDesign({
        home: {
          current: JSON.stringify({
            texts: { 'b-user': 'default' },
            images: { 'b-user': 'default' },
            blocks: ['b-user'],
            blockStates: {
              'b-user': { type: 'example-block' },
            },
          }),
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockStates": {
          "b-user": {
            "type": "example-block",
          },
        },
        "blocks": [
          "b-user",
        ],
        "images": {
          "b-user": "default",
        },
        "texts": {
          "b-user": "default",
        },
      }
    `)
  })
})
