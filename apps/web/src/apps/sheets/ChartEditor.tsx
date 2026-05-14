import { useState, useCallback } from 'react'
import { Button, Input, Select } from '@/design-system'
import { SheetData } from './engine/cell'

type ChartType = 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut' | 'scatter'

interface ChartEditorProps {
  sheetData: SheetData
  onClose: () => void
}

const CHART_TYPES: { label: string; value: ChartType }[] = [
  { label: 'Bar', value: 'bar' },
  { label: 'Column', value: 'column' },
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' },
  { label: 'Pie', value: 'pie' },
  { label: 'Donut', value: 'donut' },
  { label: 'Scatter', value: 'scatter' },
]

export function ChartEditor({ onClose }: ChartEditorProps) {
  const [chartType, setChartType] = useState<ChartType>('column')
  const [dataRange, setDataRange] = useState('A1:B10')
  const [title, setTitle] = useState('Chart Title')
  const [xAxisTitle, setXAxisTitle] = useState('X Axis')
  const [yAxisTitle, setYAxisTitle] = useState('Y Axis')
  const [showLegend, setShowLegend] = useState(true)

  const handleCreateChart = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chart Editor</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Chart Type</label>
        <Select
          value={chartType}
           onValueChange={(v: string) => setChartType(v as ChartType)}
          options={CHART_TYPES}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Data Range</label>
        <Input
          value={dataRange}
           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataRange(e.target.value)}
          placeholder="e.g., A1:B10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Chart Title</label>
        <Input value={title}            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">X Axis Title</label>
        <Input value={xAxisTitle}            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXAxisTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Y Axis Title</label>
        <Input value={yAxisTitle}            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYAxisTitle(e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showLegend"
          checked={showLegend}
          onChange={(e) => setShowLegend(e.target.checked)}
        />
        <label htmlFor="showLegend" className="text-sm">
          Show Legend
        </label>
      </div>

      <Button onClick={handleCreateChart} className="w-full">
        Insert Chart
      </Button>
    </div>
  )
}
