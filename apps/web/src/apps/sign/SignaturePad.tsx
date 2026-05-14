import React, { useRef, useState, useEffect, useCallback } from 'react'
import { X, Check, RotateCcw, Trash2 } from 'lucide-react'
import styles from './SignaturePad.module.css'

interface SignaturePadProps {
  onConfirm: (dataUrl: string) => void
  onCancel: () => void
  isInitials?: boolean
}

interface DrawPoint {
  x: number
  y: number
}

export function SignaturePad({ onConfirm, onCancel, isInitials = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [strokes, setStrokes] = useState<DrawPoint[][]>([])
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([])
  const [hasContent, setHasContent] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    redraw()
  }, [])

  useEffect(() => {
    redraw()
  }, [strokes, currentStroke, color])

  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ): DrawPoint => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX: number
    let clientY: number

    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? 0
      clientY = e.touches[0]?.clientY ?? 0
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const allStrokes = [...strokes]
    if (currentStroke.length > 0) {
      allStrokes.push(currentStroke)
    }

    allStrokes.forEach((stroke) => {
      if (stroke.length < 2) return

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      ctx.moveTo(stroke[0]!.x, stroke[0]!.y)

      for (let i = 1; i < stroke.length; i++) {
        const prev = stroke[i - 1]!
        const curr = stroke[i]!
        const midX = (prev.x + curr.x) / 2
        const midY = (prev.y + curr.y) / 2
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
      }

      ctx.stroke()
    })

    setHasContent(allStrokes.length > 0 && allStrokes.some((s) => s.length > 0))
  }, [strokes, currentStroke, color])

  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault()
    const point = getCanvasCoords(e)
    setIsDrawing(true)
    setCurrentStroke([point])
  }

  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault()
    if (!isDrawing) return
    const point = getCanvasCoords(e)
    setCurrentStroke((prev) => [...prev, point])
  }

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)

    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, currentStroke])
    }
    setCurrentStroke([])
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleEnd(e)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.changedTouches.length > 0) {
      handleEnd(e as unknown as React.MouseEvent)
    }
  }

  const handleUndo = () => {
    if (strokes.length === 0) return
    setStrokes((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setStrokes([])
    setCurrentStroke([])
  }

  const handleConfirm = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    onConfirm(dataUrl)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{isInitials ? 'Add Your Initials' : 'Add Your Signature'}</h3>
        <button className={styles.closeBtn} onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <div className={styles.tools}>
        <div className={styles.colorPicker}>
          <button
            className={`${styles.colorBtn} ${color === '#000000' ? styles.colorActive : ''}`}
            style={{ backgroundColor: '#000000' }}
            onClick={() => setColor('#000000')}
          />
          <button
            className={`${styles.colorBtn} ${color === '#0000ff' ? styles.colorActive : ''}`}
            style={{ backgroundColor: '#0000ff' }}
            onClick={() => setColor('#0000ff')}
          />
        </div>

        <div className={styles.toolActions}>
          <button
            className={styles.toolBtn}
            onClick={handleUndo}
            disabled={strokes.length === 0}
            title="Undo"
          >
            <RotateCcw size={18} />
          </button>
          <button
            className={styles.toolBtn}
            onClick={handleClear}
            disabled={!hasContent}
            title="Clear"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleTouchEnd}
        />
        {!hasContent && (
          <span className={styles.placeholder}>
            Draw your {isInitials ? 'initials' : 'signature'} here
          </span>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`${styles.confirmBtn} ${!hasContent ? styles.confirmDisabled : ''}`}
          onClick={handleConfirm}
          disabled={!hasContent}
        >
          <Check size={18} />
          Apply
        </button>
      </div>
    </div>
  )
}
