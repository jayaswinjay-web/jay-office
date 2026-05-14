import { useState, useRef, useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import type { Block as BlockType } from './block.types'
import styles from './Block.module.css'

interface BlockProps {
  block: BlockType
  onChange: (id: string, updates: Partial<BlockType>) => void
  onKeyDown: (e: React.KeyboardEvent, id: string) => void
}

export function Block({ block, onChange, onKeyDown }: BlockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (ref.current && block.type !== 'divider') {
      ref.current.textContent = block.content
    }
  }, [])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(block.id, { content: e.currentTarget.textContent ?? '' })
  }

  const getContentClassName = (): string => {
    switch (block.type) {
      case 'paragraph':
        return styles.blockContent!
      case 'heading1':
        return `${styles.blockContent!} ${styles.heading1!}`
      case 'heading2':
        return `${styles.blockContent!} ${styles.heading2!}`
      case 'heading3':
        return `${styles.blockContent!} ${styles.heading3!}`
      case 'bullet':
        return `${styles.blockContent!} ${styles.bulletList!}`
      case 'number':
        return `${styles.blockContent!} ${styles.numberList!}`
      case 'quote':
        return styles.quoteBlock!
      case 'callout':
        return styles.calloutBlock!
      case 'code':
        return styles.codeBlock!
      default:
        return styles.blockContent!
    }
  }

  if (block.type === 'divider') {
    return (
      <div className={styles.blockWrapper}>
        <hr className={styles.dividerBlock} />
      </div>
    )
  }

  if (block.type === 'todo') {
    return (
      <div
        className={styles.blockWrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className={styles.dragHandle}>
            <GripVertical className={styles.dragIcon} />
          </div>
        )}
        <div className={styles.todoBlock}>
          <input
            type="checkbox"
            checked={block.checked ?? false}
            onChange={(e) => onChange(block.id, { checked: e.target.checked })}
            className={styles.todoCheckbox}
          />
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={(e) => onKeyDown(e, block.id)}
            className={styles.todoContent}
          />
        </div>
      </div>
    )
  }

  if (block.type === 'toggle') {
    return (
      <div
        className={styles.blockWrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className={styles.dragHandle}>
            <GripVertical className={styles.dragIcon} />
          </div>
        )}
        <div className={styles.toggleBlock}>
          <span onClick={() => onChange(block.id, { collapsed: !block.collapsed })}>
            {block.collapsed ? '▶' : '▼'}
          </span>
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={(e) => onKeyDown(e, block.id)}
            className={styles.toggleContent}
          />
        </div>
      </div>
    )
  }

  if (block.type === 'image') {
    return (
      <div
        className={styles.blockWrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className={styles.dragHandle}>
            <GripVertical className={styles.dragIcon} />
          </div>
        )}
        <div className={styles.imageBlock}>
          <img src={block.content} alt="Block" className={styles.image} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={styles.blockWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className={styles.dragHandle}>
          <GripVertical className={styles.dragIcon} />
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        className={getContentClassName()}
      />
    </div>
  )
}
