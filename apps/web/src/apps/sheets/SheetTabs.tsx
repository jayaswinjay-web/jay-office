import { useState, useCallback, useRef } from 'react'
import { Tabs, Button } from '@/design-system'
import type { SheetData } from './engine/cell'
import styles from './SheetTabs.module.css'

interface SheetTabItem {
  id: string
  title: string
  data: SheetData
}

interface SheetTabsProps {
  sheets: SheetTabItem[]
  activeSheet: number
  onSheetChange: (index: number) => void
  onSheetsChange: (sheets: SheetTabItem[]) => void
}

export function SheetTabs({ sheets, activeSheet, onSheetChange, onSheetsChange }: SheetTabsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddSheet = useCallback(() => {
    const newSheets = [
      ...sheets,
      {
        id: String(Date.now()),
        title: `Sheet${sheets.length + 1}`,
        data: new Map(),
      },
    ]
    onSheetsChange(newSheets)
    onSheetChange(newSheets.length - 1)
  }, [sheets, onSheetsChange, onSheetChange])

  const handleRename = useCallback(
    (index: number) => {
      setEditingIndex(index)
      setEditValue(sheets[index]!.title ?? '')
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    [sheets],
  )

  const handleRenameConfirm = useCallback(() => {
    if (editingIndex !== null && editValue.trim()) {
      const newSheets = [...sheets]
      newSheets[editingIndex] = { ...newSheets[editingIndex]!, title: editValue.trim() }
      onSheetsChange(newSheets)
    }
    setEditingIndex(null)
    setEditValue('')
  }, [editingIndex, editValue, sheets, onSheetsChange])

  const handleDelete = useCallback(
    (index: number) => {
      if (sheets.length <= 1) return
      const newSheets = sheets.filter((_, i) => i !== index)
      onSheetsChange(newSheets)
      if (activeSheet >= newSheets.length) {
        onSheetChange(newSheets.length - 1)
      }
    },
    [sheets, activeSheet, onSheetsChange, onSheetChange],
  )

  const tabItems = sheets.map((sheet, index) => ({
    id: String(index),
    label: (
      <span className={styles.tabLabel}>
        {editingIndex === index ? (
          <input
            ref={inputRef}
            value={editValue}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value!)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameConfirm()
              if (e.key === 'Escape') setEditingIndex(null)
            }}
            onBlur={handleRenameConfirm}
            className={styles.renameInput}
          />
        ) : (
          <span onDoubleClick={() => handleRename(index)} className={styles.tabTitle}>
            {sheet.title}
          </span>
        )}
        {sheets.length > 1 && (
          <Button
            variant="ghost"
            size="small"
            className={styles.deleteButton}
             onClick={(e: React.MouseEvent) => {
               e.stopPropagation()
               handleDelete(index)
             }}
          >
            \u00D7
          </Button>
        )}
      </span>
    ),
  }))

  return (
    <div className={styles.container}>
      <Tabs
        items={tabItems}
        activeId={String(activeSheet)}
         onChange={(v: string) => onSheetChange(parseInt(v))}
      />
      <Button variant="ghost" size="small" onClick={handleAddSheet} className={styles.addButton}>
        +
      </Button>
    </div>
  )
}
