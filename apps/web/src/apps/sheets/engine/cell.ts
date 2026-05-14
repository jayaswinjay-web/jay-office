export interface CellData {
  value: string
  formula?: string
  format?: CellFormat
  computed?: string | number
}

export interface CellFormat {
  fontFamily?: string
  fontSize?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?: 'left' | 'center' | 'right'
  bgColor?: string
  textColor?: string
  numberFormat?: 'general' | 'currency' | 'percent' | 'date' | 'number'
  borders?: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean; color?: string }
  wrapText?: boolean
  merged?: { rowSpan: number; colSpan: number }
}

export type SheetData = Map<string, CellData>

export function cellKey(col: number, row: number): string {
  return `${col},${row}`
}
