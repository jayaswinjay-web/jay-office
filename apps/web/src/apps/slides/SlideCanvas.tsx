import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/design-system'
import { ZoomIn, ZoomOut, Grid } from 'lucide-react'
import * as fabric from 'fabric'
import type { SlideItem } from './slides.service'
import styles from './SlideCanvas.module.css'

interface SlideCanvasProps {
  slide: SlideItem
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  readOnly?: boolean
}

export function SlideCanvas({
  slide,
  selectedElementId,
  onSelectElement,
  readOnly = false,
}: SlideCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const zoomRef = useRef(1)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const gridSize = 20

  const addElementToCanvas = useCallback(
    (el: { id: string; type: string; properties: Record<string, unknown> }) => {
      const canvas = fabricRef.current
      if (!canvas) return

      let fabricObj: fabric.Object | null = null

      switch (el.type) {
        case 'text': {
          const obj = new fabric.Textbox('Double-click to edit', {
            left: 100,
            top: 100,
            width: 200,
            fontSize: 20,
            fill: '#111827',
            editable: !readOnly,
          })
          obj.set('data', { id: el.id })
          fabricObj = obj
          break
        }
        case 'rect': {
          const obj = new fabric.Rect({
            left: 100,
            top: 100,
            width: 150,
            height: 100,
            fill: '#3b82f6',
          })
          obj.set('data', { id: el.id })
          fabricObj = obj
          break
        }
        case 'circle': {
          const obj = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: '#ef4444',
          })
          obj.set('data', { id: el.id })
          fabricObj = obj
          break
        }
        case 'triangle': {
          const obj = new fabric.Triangle({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: '#10b981',
          })
          obj.set('data', { id: el.id })
          fabricObj = obj
          break
        }
        case 'line': {
          const obj = new fabric.Line([50, 100, 200, 100], {
            stroke: '#111827',
            strokeWidth: 2,
          })
          obj.set('data', { id: el.id })
          fabricObj = obj
          break
        }
        case 'image': {
          const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 150,
            fill: '#e5e7eb',
            data: { id: el.id },
          })
          canvas.add(rect)
          canvas.renderAll()
          return
        }
        default:
          return
      }

      if (fabricObj) {
        if (readOnly) {
          fabricObj.selectable = false
          fabricObj.evented = false
        }
        fabricObj.set('data', { id: el.id })
        canvas.add(fabricObj)
        canvas.renderAll()
      }
    },
    [readOnly],
  )

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 960,
      height: 540,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: !readOnly,
    })

    fabricRef.current = canvas

    if (!readOnly) {
      canvas.on('object:moving', (e) => {
        const obj = e.target
        if (!obj) return
        const left = Math.round((obj.left ?? 0) / gridSize) * gridSize
        const top = Math.round((obj.top ?? 0) / gridSize) * gridSize
        obj.set({ left, top })
      })

      canvas.on('selection:created', (e) => {
        const selected = e.selected?.[0]
        if (selected) {
          const data = selected.get('data') as { id: string } | undefined
          if (data?.id) onSelectElement(data.id)
        }
      })

      canvas.on('selection:updated', (e) => {
        const selected = e.selected?.[0]
        if (selected) {
          const data = selected.get('data') as { id: string } | undefined
          if (data?.id) onSelectElement(data.id)
        }
      })

      canvas.on('selection:cleared', () => {
        onSelectElement(null)
      })

      canvas.on('object:modified', () => {
        canvas.renderAll()
      })
    }

    slide.elements.forEach((el) => addElementToCanvas(el))

    return () => {
      canvas.dispose()
    }
  }, [slide.id, slide.elements, addElementToCanvas, onSelectElement, readOnly])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !selectedElementId) return

    canvas.getObjects().forEach((obj) => {
      const data = obj.get('data') as { id: string } | undefined
      if (data?.id === selectedElementId) {
        canvas.setActiveObject(obj)
        canvas.renderAll()
      }
    })
  }, [selectedElementId])

  const handleZoomIn = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const newZoom = Math.min(zoomRef.current + 0.1, 3)
    zoomRef.current = newZoom
    canvas.setZoom(newZoom)
    setZoom(newZoom)
  }, [])

  const handleZoomOut = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const newZoom = Math.max(zoomRef.current - 0.1, 0.3)
    zoomRef.current = newZoom
    canvas.setZoom(newZoom)
    setZoom(newZoom)
  }, [])

  const handleResetZoom = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    zoomRef.current = 1
    canvas.setZoom(1)
    setZoom(1)
  }, [])

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowGrid(!showGrid)}
          className={showGrid ? styles.controlActive : ''}
        >
          <Grid size={16} />
        </Button>
        <Button variant="ghost" size="small" onClick={handleZoomOut}>
          <ZoomOut size={16} />
        </Button>
        <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="small" onClick={handleZoomIn}>
          <ZoomIn size={16} />
        </Button>
        <Button variant="ghost" size="small" onClick={handleResetZoom}>
          Reset
        </Button>
      </div>
    </div>
  )
}
