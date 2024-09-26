import path from 'node:path'

const KNOWN_TYPE = new Set(['front', 'article'])

// Block ID is directory name of the block
export function extractBlockId(id: string, root: string): { type: 'front' | 'article'; blockId: string } | null {
  if (!id.startsWith(root)) return null
  const relativePath = path.relative(root, id)
  const [type, blockId] = relativePath.split(path.sep)
  if (KNOWN_TYPE.has(type)) {
    return {
      type: type as 'front' | 'article',
      blockId: type === 'front' ? `b-${blockId}` : blockId,
    }
  }

  return null
}
