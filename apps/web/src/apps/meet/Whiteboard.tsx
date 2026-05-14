import React, { useRef, useState, useEffect, useCallback } from 'react'
import { X, Pen, Eraser, Minus, Square, Circle, Type, Undo2, Redo2, Trash2 } from 'lucide-react'
import styles from './Whiteboard.module.css'

interface Participant {
  userId: string
  name: string
}

type Tool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text'

interface DrawPoint {
  x: number
  y: number
}

interface DrawStroke {
  tool: Tool
  color: string
  width: number
  points: DrawPoint[]
  startX?: number
  startY?: number
  endX?: number
  endY?: number
  text?: string
}

interface WhiteboardProps {
  onClose: () => void
  participants: Participant[]
}

const COLORS = [
  '#000000',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ffffff',
]

const STROKE_WIDTHS = [2, 4, 6, 8, 12]

export function Whiteboard({ onClose, participants }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<DrawStroke[]>([])
  const [redoStack, setRedoStack] = useState<DrawStroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<DrawStroke | null>(null)
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null)
  const [textValue, setTextValue] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      redraw()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  useEffect(() => {
    try {
      const socket = new WebSocket('ws://localhost:8080/whiteboard')
      socket.onopen = () => setWs(socket)
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'stroke') {
            setStrokes((prev) => [...prev, data.stroke])
            redraw()
          } else if (data.type === 'clear') {
            setStrokes([])
            redraw()
          }
        } catch {
          // Invalid message
        }
      }
      socket.onclose = () => setWs(null)
      return () => socket.close()
    } catch {
      // WebSocket not available
      return undefined
    }
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes

    allStrokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color
      ctx.lineWidth = stroke.tool === 'eraser' ? stroke.width * 3 : stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
        if (stroke.points.length < 2) return
        ctx.beginPath()
        ctx.moveTo(stroke.points[0]!.x, stroke.points[0]!.y)
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i]!.x, stroke.points[i]!.y)
        }
        ctx.stroke()
      } else if (stroke.tool === 'line') {
        if (stroke.startX === undefined || stroke.startY === undefined) return
        if (stroke.endX === undefined || stroke.endY === undefined) return
        ctx.beginPath()
        ctx.moveTo(stroke.startX, stroke.startY)
        ctx.lineTo(stroke.endX, stroke.endY)
        ctx.stroke()
      } else if (stroke.tool === 'rectangle') {
        if (stroke.startX === undefined || stroke.startY === undefined) return
        if (stroke.endX === undefined || stroke.endY === undefined) return
        ctx.beginPath()
        ctx.strokeRect(
          stroke.startX,
          stroke.startY,
          stroke.endX - stroke.startX,
          stroke.endY - stroke.startY,
        )
      } else if (stroke.tool === 'circle') {
        if (stroke.startX === undefined || stroke.startY === undefined) return
        if (stroke.endX === undefined || stroke.endY === undefined) return
        const radiusX = Math.abs(stroke.endX - stroke.startX) / 2
        const radiusY = Math.abs(stroke.endY - stroke.startY) / 2
        const centerX = (stroke.startX + stroke.endX) / 2
        const centerY = (stroke.startY + stroke.endY) / 2
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else if (stroke.tool === 'text' && stroke.text) {
        if (stroke.startX === undefined || stroke.startY === undefined) return
        ctx.fillStyle = stroke.color
        ctx.font = `${stroke.width * 4}px sans-serif`
        ctx.fillText(stroke.text, stroke.startX, stroke.startY)
      }
    })
  }, [strokes, currentStroke])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e)

    if (tool === 'text') {
      setTextInput(coords)
      return
    }

    setIsDrawing(true)

    const newStroke: DrawStroke = {
      tool,
      color,
      width: strokeWidth,
      points: [coords],
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y,
    }

    setCurrentStroke(newStroke)
    setRedoStack([])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return
    const coords = getCanvasCoords(e)

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, coords],
      })
    } else {
      setCurrentStroke({
        ...currentStroke,
        endX: coords.x,
        endY: coords.y,
      })
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke) return
    setIsDrawing(false)

    const completedStroke = currentStroke
    setStrokes((prev) => [...prev, completedStroke])
    setCurrentStroke(null)

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'stroke',
          stroke: completedStroke,
        }),
      )
    }
  }

  const handleTextSubmit = () => {
    if (textInput && textValue.trim()) {
      const textStroke: DrawStroke = {
        tool: 'text',
        color,
        width: strokeWidth,
        points: [],
        startX: textInput.x,
        startY: textInput.y,
        text: textValue,
      }
      setStrokes((prev) => [...prev, textStroke])
      setCurrentStroke(null)

      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'stroke',
            stroke: textStroke,
          }),
        )
      }
    }
    setTextInput(null)
    setTextValue('')
  }

  const handleUndo = () => {
    if (strokes.length === 0) return
    const last = strokes[strokes.length - 1]!
    setStrokes((prev) => prev.slice(0, -1))
    setRedoStack((prev) => [...prev, last])
    redraw()

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'undo' }))
    }
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const last = redoStack[redoStack.length - 1]!
    setRedoStack((prev) => prev.slice(0, -1))
    setStrokes((prev) => [...prev, last])
    redraw()
  }

  const handleClear = () => {
    setStrokes([])
    setRedoStack([])
    redraw()

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'clear' }))
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button
            className={`${styles.toolBtn} ${tool === 'pen' ? styles.active : ''}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            <Pen size={18} />
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'eraser' ? styles.active : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'line' ? styles.active : ''}`}
            onClick={() => setTool('line')}
            title="Line"
          >
            <Minus size={18} />
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'rectangle' ? styles.active : ''}`}
            onClick={() => setTool('rectangle')}
            title="Rectangle"
          >
            <Square size={18} />
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'circle' ? styles.active : ''}`}
            onClick={() => setTool('circle')}
            title="Circle"
          >
            <Circle size={18} />
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'text' ? styles.active : ''}`}
            onClick={() => setTool('text')}
            title="Text"
          >
            <Type size={18} />
          </button>
        </div>

        <div className={styles.toolGroup}>
          <div className={styles.colorPicker}>
            {COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.colorBtn} ${color === c ? styles.colorActive : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className={styles.toolGroup}>
          <div className={styles.strokePicker}>
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w}
                className={`${styles.strokeBtn} ${strokeWidth === w ? styles.strokeActive : ''}`}
                onClick={() => setStrokeWidth(w)}
              >
                <span className={styles.strokeDot} style={{ width: w, height: w }} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toolGroup}>
          <button className={styles.toolBtn} onClick={handleUndo} title="Undo">
            <Undo2 size={18} />
          </button>
          <button className={styles.toolBtn} onClick={handleRedo} title="Redo">
            <Redo2 size={18} />
          </button>
          <button className={styles.toolBtn} onClick={handleClear} title="Clear">
            <Trash2 size={18} />
          </button>
        </div>

        <div className={styles.participants}>
          {participants.map((p) => (
            <span key={p.userId} className={styles.participantBadge}>
              {p.name.charAt(0)}
            </span>
          ))}
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {textInput && (
          <div className={styles.textInput} style={{ left: textInput.x, top: textInput.y }}>
            <input
              type="text"
              className={styles.textInputField}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit()
                if (e.key === 'Escape') {
                  setTextInput(null)
                  setTextValue('')
                }
              }}
              autoFocus
              placeholder="Type text..."
            />
            <button className={styles.textSubmitBtn} onClick={handleTextSubmit}>
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
