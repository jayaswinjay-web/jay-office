import { useRef, useEffect, useCallback, useState } from 'react'
import type { SheetData } from './engine/cell'
import { evaluateFormula } from './engine/formula'
import styles from './GridCanvas.module.css'

interface GridCanvasProps {
  data: SheetData
  activeCell: { col: number; row: number } | null
  onCellSelect: (col: number, row: number) => void
}

const COL_WIDTH = 100
const ROW_HEIGHT = 25
const HEADER_WIDTH = 50
const HEADER_HEIGHT = 25
const TOTAL_ROWS = 100
const TOTAL_COLS = 26

export function GridCanvas({ data, activeCell, onCellSelect }: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [_selection, setSelection] = useState<{
    start: { col: number; row: number }
    end: { col: number; row: number }
  } | null>(null)
  const [scrollOffset, _setScrollOffset] = useState({ x: 0, y: 0 })
  const [editingCell, setEditingCell] = useState<{ col: number; row: number } | null>(null)
  const [editValue, setEditValue] = useState('')
  const animFrameRef = useRef<number>(0)

  const getCellValue = useCallback(
    (col: number, row: number): string | number => {
      const key = `${col},${row}`
      const cell = data.get(key)
      if (!cell) return ''
      if (cell.formula) return evaluateFormula(cell.formula, getCellValue)
      return cell.value
    },
    [data],
  )

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const startCol = Math.floor(scrollOffset.x / COL_WIDTH)
    const startRow = Math.floor(scrollOffset.y / ROW_HEIGHT)
    const endCol = Math.min(startCol + Math.ceil(width / COL_WIDTH) + 1, TOTAL_COLS)
    const endRow = Math.min(startRow + Math.ceil(height / ROW_HEIGHT) + 1, TOTAL_ROWS)

    ctx.font = '12px sans-serif'
    ctx.textBaseline = 'middle'

    for (let col = startCol; col < endCol; col++) {
      for (let row = startRow; row < endRow; row++) {
        const x = HEADER_WIDTH + (col - startCol) * COL_WIDTH - (scrollOffset.x % COL_WIDTH)
        const y = HEADER_HEIGHT + (row - startRow) * ROW_HEIGHT - (scrollOffset.y % ROW_HEIGHT)

        const key = `${col},${row}`
        const cell = data.get(key)
        const value = cell ? (cell.formula ? getCellValue(col, row) : cell.value) : ''

        ctx.strokeStyle = '#e0e0e0'
        ctx.strokeRect(x, y, COL_WIDTH, ROW_HEIGHT)

        if (value !== '') {
          ctx.fillStyle = '#000'
          ctx.textAlign = 'right'
          ctx.fillText(String(value), x + COL_WIDTH - 5, y + ROW_HEIGHT / 2)
        }

        if (activeCell && activeCell.col === col && activeCell.row === row) {
          ctx.strokeStyle = '#1a73e8'
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, COL_WIDTH, ROW_HEIGHT)
          ctx.lineWidth = 1
        }
      }
    }

    for (let col = startCol; col < endCol; col++) {
      const x = HEADER_WIDTH + (col - startCol) * COL_WIDTH - (scrollOffset.x % COL_WIDTH)
      const colLabel = String.fromCharCode(65 + col)
      ctx.fillStyle = '#666'
      ctx.textAlign = 'center'
      ctx.fillText(colLabel, x + COL_WIDTH / 2, HEADER_HEIGHT / 2)
    }

    for (let row = startRow; row < endRow; row++) {
      const y = HEADER_HEIGHT + (row - startRow) * ROW_HEIGHT - (scrollOffset.y % ROW_HEIGHT)
      ctx.fillStyle = '#666'
      ctx.textAlign = 'center'
      ctx.fillText(String(row + 1), HEADER_WIDTH / 2, y + ROW_HEIGHT / 2)
    }

    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, HEADER_WIDTH, HEADER_HEIGHT)
    ctx.strokeRect(0, 0, HEADER_WIDTH, HEADER_HEIGHT)
  }, [data, activeCell, scrollOffset, getCellValue])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      drawGrid()
    })
    resizeObserver.observe(canvas)

    const animate = () => {
      drawGrid()
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [drawGrid])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left + scrollOffset.x
      const y = e.clientY - rect.top + scrollOffset.y
      const col = Math.floor((x - HEADER_WIDTH) / COL_WIDTH)
      const row = Math.floor((y - HEADER_HEIGHT) / ROW_HEIGHT)
      if (col >= 0 && row >= 0) {
        onCellSelect(col, row)
        setSelection({ start: { col, row }, end: { col, row } })
      }
    },
    [scrollOffset, onCellSelect],
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left + scrollOffset.x
      const y = e.clientY - rect.top + scrollOffset.y
      const col = Math.floor((x - HEADER_WIDTH) / COL_WIDTH)
      const row = Math.floor((y - HEADER_HEIGHT) / ROW_HEIGHT)
      if (col >= 0 && row >= 0) {
        setEditingCell({ col, row })
        const key = `${col},${row}`
        const cell = data.get(key)
        setEditValue(cell?.formula || cell?.value || '')
      }
    },
    [scrollOffset, data],
  )

  const editInputStyle = editingCell
    ? {
        left: HEADER_WIDTH + editingCell.col * COL_WIDTH - scrollOffset.x,
        top: HEADER_HEIGHT + editingCell.row * ROW_HEIGHT - scrollOffset.y,
        width: COL_WIDTH,
        height: ROW_HEIGHT,
      }
    : undefined

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      />
      {editingCell && (
        <input
          className={styles.editInput}
          style={editInputStyle}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditingCell(null)
              setEditValue('')
            } else if (e.key === 'Escape') {
              setEditingCell(null)
              setEditValue('')
            }
          }}
          autoFocus
        />
      )}
    </div>
  )
}
