import { useCallback, useRef, useEffect } from 'react'
import {
  Scissors,
  Copy,
  ClipboardPaste,
  Table2,
  Trash2,
  Eraser,
  Palette,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import type { SheetData } from './engine/cell'
import styles from './ContextMenu.module.css'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  sheetData: SheetData
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onPasteValues: () => void
  onInsertRowAbove: () => void
  onInsertRowBelow: () => void
  onInsertColumnLeft: () => void
  onInsertColumnRight: () => void
  onDeleteRow: () => void
  onDeleteColumn: () => void
  onClearContents: () => void
  onFormatCells: () => void
}

export function ContextMenu({
  x,
  y,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onPasteValues,
  onInsertRowAbove,
  onInsertRowBelow,
  onInsertColumnLeft,
  onInsertColumnRight,
  onDeleteRow,
  onDeleteColumn,
  onClearContents,
  onFormatCells,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleAction = useCallback(
    (action: () => void) => {
      action()
      onClose()
    },
    [onClose],
  )

  return (
    <div ref={menuRef} className={styles.menu} style={{ left: x, top: y }}>
      <button className={styles.menuItem} onClick={() => handleAction(onCut)}>
        <Scissors size={14} />
        <span>Cut</span>
      </button>
      <button className={styles.menuItem} onClick={() => handleAction(onCopy)}>
        <Copy size={14} />
        <span>Copy</span>
      </button>
      <button className={styles.menuItem} onClick={() => handleAction(onPaste)}>
        <ClipboardPaste size={14} />
        <span>Paste</span>
      </button>
      <button className={styles.menuItem} onClick={() => handleAction(onPasteValues)}>
        <Table2 size={14} />
        <span>Paste Values</span>
      </button>

      <div className={styles.separator} />

      <button className={styles.menuItem} onClick={() => handleAction(onInsertRowAbove)}>
        <ArrowUp size={14} />
        <span>Insert Row Above</span>
      </button>
      <button className={styles.menuItem} onClick={() => handleAction(onInsertRowBelow)}>
        <ArrowDown size={14} />
        <span>Insert Row Below</span>
      </button>
      <button className={styles.menuItem} onClick={() => handleAction(onInsertColumnLeft)}>
        <ArrowLeft size={14} />
        <span>Insert Column Left</span>
      </button>
      <button className={styles.menuItem} onClick={() => handleAction(onInsertColumnRight)}>
        <ArrowRight size={14} />
        <span>Insert Column Right</span>
      </button>

      <div className={styles.separator} />

      <button
        className={`${styles.menuItem} ${styles.dangerItem}`}
        onClick={() => handleAction(onDeleteRow)}
      >
        <Trash2 size={14} />
        <span>Delete Row</span>
      </button>
      <button
        className={`${styles.menuItem} ${styles.dangerItem}`}
        onClick={() => handleAction(onDeleteColumn)}
      >
        <Trash2 size={14} />
        <span>Delete Column</span>
      </button>

      <div className={styles.separator} />

      <button className={styles.menuItem} onClick={() => handleAction(onClearContents)}>
        <Eraser size={14} />
        <span>Clear Contents</span>
      </button>
      <button className={styles.menuItem} onClick={() => handleAction(onFormatCells)}>
        <Palette size={14} />
        <span>Format Cells</span>
      </button>
    </div>
  )
}
