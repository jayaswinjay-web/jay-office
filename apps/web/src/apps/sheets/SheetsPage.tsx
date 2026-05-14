import { useState, useCallback } from 'react'
import { Toolbar, Button } from '@/design-system'
import { GridCanvas } from './GridCanvas'
import { FormattingBar } from './FormattingBar'
import { FormulaBar } from './FormulaBar'
import { SheetTabs } from './SheetTabs'
import { ChartEditor } from './ChartEditor'
import type { CellFormat, SheetData } from './engine/cell'
import styles from './SheetsPage.module.css'

export function SheetsPage() {
  const [activeCell, setActiveCell] = useState<{ col: number; row: number } | null>(null)
  const [cellFormat, setCellFormat] = useState<CellFormat>({})
  const [sheets, setSheets] = useState<{ id: string; title: string; data: SheetData }[]>([
    { id: '1', title: 'Sheet1', data: new Map() },
  ])
  const [activeSheet, setActiveSheet] = useState(0)
  const [showChartEditor, setShowChartEditor] = useState(false)

  const handleCellSelect = useCallback((col: number, row: number) => {
    setActiveCell({ col, row })
  }, [])

  const handleFormatChange = useCallback((format: Partial<CellFormat>) => {
    setCellFormat((prev) => ({ ...prev, ...format }))
  }, [])

  return (
    <div className={styles.page}>
      <Toolbar>
        <Button variant="ghost" size="small" onClick={() => {}}>
          File
        </Button>
         <Button variant="ghost" size="small">
           Edit
         </Button>
         <Button variant="ghost" size="small">
           View
         </Button>
         <Button variant="ghost" size="small">
           Insert
         </Button>
         <Button variant="ghost" size="small">
           Format
         </Button>
         <Button variant="ghost" size="small">
           Data
         </Button>
       </Toolbar>

      <FormulaBar
        activeCell={activeCell}
        sheetData={sheets[activeSheet]?.data!}
        onCellChange={(col, row, value) => {
          const newSheets = [...sheets]
          const sheet = newSheets[activeSheet]!
          const key = `${col},${row}`
          const existing = sheet.data.get(key)
          sheet.data.set(key, {
            ...existing,
            value,
            formula: value.startsWith('=') ? value : undefined,
          })
          setSheets(newSheets)
        }}
      />

      <FormattingBar format={cellFormat} onFormatChange={handleFormatChange} />

      <div className={styles.main}>
        <div className={styles.gridArea}>
          <GridCanvas
            data={sheets[activeSheet]?.data ?? new Map()}
            activeCell={activeCell}
            onCellSelect={handleCellSelect}
          />
        </div>

        {showChartEditor && (
          <div className={styles.chartPanel}>
             <ChartEditor
               sheetData={sheets[activeSheet]?.data! as any}
               onClose={() => setShowChartEditor(false)}
             />
          </div>
        )}
      </div>

      <SheetTabs
        sheets={sheets}
        activeSheet={activeSheet}
        onSheetChange={setActiveSheet}
        onSheetsChange={setSheets}
      />
    </div>
  )
}
