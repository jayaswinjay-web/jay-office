import type { Block as BlockType } from './block.types'
import { Block } from './Block'

interface BlockListProps {
  blocks: BlockType[]
  onChange: (blocks: BlockType[]) => void
}

export function BlockList({ blocks, onChange }: BlockListProps) {
  const generateId = () => Math.random().toString(36).substring(2, 9)

  const updateBlock = (id: string, updates: Partial<BlockType>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    const idx = blocks.findIndex((b) => b.id === id)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const newBlock: BlockType = { id: generateId(), type: 'paragraph', content: '' }
      const newBlocks = [...blocks]
      newBlocks.splice(idx + 1, 0, newBlock)
      onChange(newBlocks)
    } else if (e.key === 'Backspace') {
      const block = blocks[idx]!
      if (block.content === '' && blocks.length > 1) {
        e.preventDefault()
        deleteBlock(id)
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey && idx > 0) {
        const newBlocks = [...blocks]
        const [moved] = newBlocks.splice(idx, 1)
        newBlocks.splice(idx - 1, 0, moved!)
        onChange(newBlocks)
      } else if (!e.shiftKey && idx < blocks.length - 1) {
        const newBlocks = [...blocks]
        const [moved] = newBlocks.splice(idx, 1)
        newBlocks.splice(idx + 1, 0, moved!)
        onChange(newBlocks)
      }
    }
  }

  return (
    <div className="space-y-1">
      {blocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          onChange={updateBlock}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  )
}
