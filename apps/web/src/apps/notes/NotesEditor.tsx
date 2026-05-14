import { useState, useCallback } from 'react'
import type { Block as BlockType } from './blocks/block.types'
import { BlockList } from './blocks/BlockList'

interface NotesEditorProps {
  initialBlocks?: BlockType[]
  onChange?: (blocks: BlockType[]) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const defaultBlocks: BlockType[] = [{ id: generateId(), type: 'paragraph', content: '' }]

export function NotesEditor({ initialBlocks, onChange }: NotesEditorProps) {
  const [blocks, setBlocks] = useState<BlockType[]>(initialBlocks ?? defaultBlocks)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashPosition, _setSlashPosition] = useState({ top: 0, left: 0 })

  const handleBlocksChange = useCallback(
    (newBlocks: BlockType[]) => {
      setBlocks(newBlocks)
      onChange?.(newBlocks)
    },
    [onChange],
  )

  const blockTypes: { type: BlockType['type']; label: string; icon: string }[] = [
    { type: 'paragraph', label: 'Text', icon: 'T' },
    { type: 'heading1', label: 'Heading 1', icon: 'H1' },
    { type: 'heading2', label: 'Heading 2', icon: 'H2' },
    { type: 'heading3', label: 'Heading 3', icon: 'H3' },
    { type: 'bullet', label: 'Bullet list', icon: '•' },
    { type: 'number', label: 'Numbered list', icon: '1.' },
    { type: 'todo', label: 'To-do', icon: '☑' },
    { type: 'toggle', label: 'Toggle', icon: '▶' },
    { type: 'quote', label: 'Quote', icon: '"' },
    { type: 'callout', label: 'Callout', icon: '!' },
    { type: 'code', label: 'Code', icon: '</>' },
    { type: 'divider', label: 'Divider', icon: '—' },
    { type: 'image', label: 'Image', icon: '🖼' },
  ]

  return (
    <div className="relative max-w-3xl mx-auto py-8 px-4">
      <BlockList blocks={blocks} onChange={handleBlocksChange} />

      {showSlashMenu && (
        <div
          className="absolute bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[200px]"
          style={{ top: slashPosition.top, left: slashPosition.left }}
        >
          {blockTypes.map((bt) => (
            <button
              key={bt.type}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
              onClick={() => {
                setShowSlashMenu(false)
              }}
            >
              <span className="w-6 text-gray-500">{bt.icon}</span>
              {bt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
