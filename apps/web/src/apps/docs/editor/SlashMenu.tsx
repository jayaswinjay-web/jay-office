import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './SlashMenu.module.css'

interface SlashMenuItem {
  label: string
  icon: string
  action: () => void
  keywords?: string[]
}

interface SlashMenuProps {
  items: SlashMenuItem[]
  onSelect: (item: SlashMenuItem) => void
  onClose: () => void
  position: { top: number; left: number }
}

export function SlashMenu({ items, onSelect, onClose, position }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % items.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onSelect(items[selectedIndex]!)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [items, selectedIndex, onSelect, onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={menuRef} className={styles.menu} style={{ top: position.top, left: position.left }}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.menuItem} ${index === selectedIndex ? styles.menuItemSelected : ''}`}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <span className={styles.menuIcon}>{item.icon}</span>
          <span className={styles.menuLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function getDefaultSlashItems(actions: {
  setHeading: (level: number) => void
  setParagraph: () => void
  toggleBulletList: () => void
  toggleOrderedList: () => void
}): SlashMenuItem[] {
  return [
    {
      label: 'Heading 1',
      icon: '𝐇₁',
      action: () => actions.setHeading(1),
      keywords: ['h1', 'heading'],
    },
    {
      label: 'Heading 2',
      icon: '𝐇₂',
      action: () => actions.setHeading(2),
      keywords: ['h2', 'heading'],
    },
    {
      label: 'Heading 3',
      icon: '𝐇₃',
      action: () => actions.setHeading(3),
      keywords: ['h3', 'heading'],
    },
    {
      label: 'Paragraph',
      icon: '¶',
      action: () => actions.setParagraph(),
      keywords: ['text', 'p'],
    },
    {
      label: 'Bullet List',
      icon: '•',
      action: () => actions.toggleBulletList(),
      keywords: ['ul', 'list'],
    },
    {
      label: 'Numbered List',
      icon: '1.',
      action: () => actions.toggleOrderedList(),
      keywords: ['ol', 'list'],
    },
    { label: 'Quote', icon: '❝', action: () => {}, keywords: ['blockquote'] },
    { label: 'Code Block', icon: '</>', action: () => {}, keywords: ['code'] },
    { label: 'Divider', icon: '—', action: () => {}, keywords: ['hr', 'line'] },
    { label: 'Image', icon: '🖼', action: () => {}, keywords: ['picture', 'photo'] },
    { label: 'Table', icon: '⊞', action: () => {}, keywords: ['grid'] },
  ]
}
