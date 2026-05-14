import { useState, useCallback, useMemo } from 'react'
import { Input } from '@/design-system'
import type { SheetData } from './engine/cell'
import styles from './FormulaBar.module.css'

interface FormulaBarProps {
  activeCell: { col: number; row: number } | null
  sheetData: SheetData
  onCellChange: (col: number, row: number, value: string) => void
}

function colToLetter(col: number): string {
  let letter = ''
  let c = col
  while (c >= 0) {
    letter = String.fromCharCode(65 + (c % 26)) + letter
    c = Math.floor(c / 26) - 1
  }
  return letter
}

export function FormulaBar({ activeCell, sheetData, onCellChange }: FormulaBarProps) {
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const cellRef = useMemo(() => {
    if (!activeCell) return ''
    return `${colToLetter(activeCell.col)}${activeCell.row + 1}`
  }, [activeCell])

  const cellValue = useMemo(() => {
    if (!activeCell) return ''
    const key = `${activeCell.col},${activeCell.row}`
    const cell = sheetData.get(key)
    return cell?.formula || cell?.value || ''
  }, [activeCell, sheetData])

  const handleFocus = useCallback(() => {
    setIsEditing(true)
    setInputValue(cellValue)
  }, [cellValue])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (activeCell) {
          onCellChange(activeCell.col, activeCell.row, inputValue)
        }
        setIsEditing(false)
      } else if (e.key === 'Escape') {
        setIsEditing(false)
        setInputValue('')
      }
    },
    [activeCell, inputValue, onCellChange],
  )

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (activeCell && inputValue !== cellValue) {
      onCellChange(activeCell.col, activeCell.row, inputValue)
    }
  }, [activeCell, inputValue, cellValue, onCellChange])

  return (
    <div className={styles.container}>
      <div className={styles.cellRef}>{cellRef}</div>
      <Input
        value={isEditing ? inputValue : cellValue}
         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter value or formula (start with =)"
        className={styles.input}
      />
    </div>
  )
}
