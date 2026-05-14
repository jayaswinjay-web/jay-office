import { useRef, useEffect, useCallback } from 'react'
import type { SheetData } from '../engine/cell'
import { evaluateFormula } from '../engine/formula'

type ChartType = 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut' | 'scatter'

interface ChartRendererProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>
  data: SheetData
  chartType: ChartType
  dataRange: string
  title?: string
  xAxisTitle?: string
  yAxisTitle?: string
  showLegend?: boolean
  width?: number
  height?: number
}

export function ChartRenderer({
  canvasRef: externalRef,
  data,
  chartType,
  dataRange,
  title = 'Chart',
  xAxisTitle = 'X Axis',
  yAxisTitle = 'Y Axis',
  showLegend: _showLegend = true,
  width = 400,
  height = 300,
}: ChartRendererProps) {
  const internalRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = externalRef || internalRef

  const getCellValue = useCallback(
    (col: number, row: number): number => {
      const key = `${col},${row}`
      const cell = data.get(key)
      if (!cell) return 0
      const val = cell.formula
        ? evaluateFormula(cell.formula, (c, r) => data.get(`${c},${r}`)?.value ?? 0)
        : cell.value
      return typeof val === 'number' ? val : parseFloat(String(val)) || 0
    },
    [data],
  )

  const parseRange = useCallback(
    (
      range: string,
    ): { startCol: number; startRow: number; endCol: number; endRow: number } | null => {
      const parts = range.split(':')
      if (parts.length !== 2) return null
       const start = parseCellRef(parts[0]!)
       const end = parseCellRef(parts[1]!)
      if (!start || !end) return null
      return { startCol: start.col, startRow: start.row, endCol: end.col, endRow: end.row }
    },
    [],
  )

  const parseCellRef = (ref: string): { col: number; row: number } | null => {
    const match = ref.match(/^([A-Z]+)(\d+)$/)
    if (!match) return null
     const colStr = match[1]!
     let col = 0
     for (const char of colStr) {
      col = col * 26 + (char.charCodeAt(0) - 64)
    }
     return { col: col - 1, row: parseInt(match[2]!) - 1 }
  }

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, width, height)

    const range = parseRange(dataRange)
    if (!range) return

    const values: number[] = []
    const labels: string[] = []
    for (let col = range.startCol; col <= range.endCol; col++) {
      for (let row = range.startRow; row <= range.endRow; row++) {
        values.push(getCellValue(col, row))
        labels.push(String.fromCharCode(65 + col) + (row + 1))
      }
    }

    const padding = { top: 40, right: 20, bottom: 50, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    ctx.fillStyle = '#000'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, width / 2, 20)

    if (chartType === 'bar' || chartType === 'column') {
      const maxVal = Math.max(...values, 1)
      const barWidth = (chartWidth / values.length) * 0.8
      const gap = (chartWidth / values.length) * 0.2

      ctx.fillStyle = '#4285f4'
      values.forEach((val, i) => {
        const barHeight = (val / maxVal) * chartHeight
        const x = padding.left + i * (barWidth + gap)
        const y = padding.top + chartHeight - barHeight
        ctx.fillRect(x, y, barWidth, barHeight)
      })
    } else if (chartType === 'line' || chartType === 'area') {
      const maxVal = Math.max(...values, 1)
      ctx.beginPath()
      ctx.strokeStyle = '#4285f4'
      ctx.lineWidth = 2
      values.forEach((val, i) => {
        const x = padding.left + (i / (values.length - 1)) * chartWidth
        const y = padding.top + chartHeight - (val / maxVal) * chartHeight
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      if (chartType === 'area') {
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
        ctx.lineTo(padding.left, padding.top + chartHeight)
        ctx.closePath()
        ctx.fillStyle = 'rgba(66, 133, 244, 0.2)'
        ctx.fill()
      }
      ctx.stroke()
    } else if (chartType === 'pie' || chartType === 'donut') {
      const total = values.reduce((a, b) => a + b, 0)
      let startAngle = 0
      const centerX = width / 2
      const centerY = (height + padding.top - padding.bottom) / 2
      const radius = Math.min(chartWidth, chartHeight) / 2

      values.forEach((val, i) => {
        const sliceAngle = (val / total) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = `hsl(${(i * 360) / values.length}, 70%, 50%)`
        ctx.fill()
        startAngle += sliceAngle
      })
    } else if (chartType === 'scatter') {
      const maxVal = Math.max(...values, 1)
      ctx.fillStyle = '#4285f4'
      values.forEach((val, i) => {
        const x = padding.left + (i / values.length) * chartWidth
        const y = padding.top + chartHeight - (val / maxVal) * chartHeight
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(xAxisTitle, width / 2, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(yAxisTitle, 0, 0)
    ctx.restore()
  }, [chartType, dataRange, title, xAxisTitle, yAxisTitle, width, height, getCellValue, parseRange])

  useEffect(() => {
    drawChart()
  }, [drawChart])

  if (externalRef) return null
  return <canvas ref={canvasRef} style={{ width, height }} />
}
