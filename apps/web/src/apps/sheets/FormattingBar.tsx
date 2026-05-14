import { Toolbar, Button, Input, Select } from '@/design-system'
import type { CellFormat } from './engine/cell'
import styles from './FormattingBar.module.css'

interface FormattingBarProps {
  format: CellFormat
  onFormatChange: (format: Partial<CellFormat>) => void
}

const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana']
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36]
const NUMBER_FORMATS = ['general', 'currency', 'percent', 'date', 'number'] as const

export function FormattingBar({ format, onFormatChange }: FormattingBarProps) {
  return (
    <Toolbar className={styles.toolbar}>
      <Select
        value={format.fontFamily ?? 'Arial'}
        onValueChange={(v: string) => onFormatChange({ fontFamily: v })}
        options={FONT_FAMILIES.map((f) => ({ label: f, value: f }))}
        className={styles.selectFontFamily}
      />
      <Select
        value={String(format.fontSize ?? 11)}
        onValueChange={(v: string) => onFormatChange({ fontSize: parseInt(v) })}
        options={FONT_SIZES.map((s) => ({ label: String(s), value: String(s) }))}
        className={styles.selectFontSize}
      />

      <Button
        variant={format.bold ? 'primary' : 'ghost'}
        size="small"
        onClick={() => onFormatChange({ bold: !format.bold })}
      >
        <strong>B</strong>
      </Button>
      <Button
        variant={format.italic ? 'primary' : 'ghost'}
        size="small"
        onClick={() => onFormatChange({ italic: !format.italic })}
      >
        <em>I</em>
      </Button>
      <Button
        variant={format.underline ? 'primary' : 'ghost'}
        size="small"
        onClick={() => onFormatChange({ underline: !format.underline })}
      >
        <u>U</u>
      </Button>

      <Input
        type="color"
        value={format.textColor ?? '#000000'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormatChange({ textColor: e.target.value })}
        className={styles.colorInput}
      />
      <Input
        type="color"
        value={format.bgColor ?? '#ffffff'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormatChange({ bgColor: e.target.value })}
        className={styles.colorInput}
      />

      {(['left', 'center', 'right'] as const).map((align) => (
        <Button
          key={align}
          variant={format.align === align ? 'primary' : 'ghost'}
          size="small"
          onClick={() => onFormatChange({ align })}
        >
          {align === 'left' ? '\u27F5' : align === 'center' ? '\u2194' : '\u27F6'}
        </Button>
      ))}

      <Select
        value={format.numberFormat ?? 'general'}
        onValueChange={(v: string) => onFormatChange({ numberFormat: v as CellFormat['numberFormat'] })}
        options={NUMBER_FORMATS.map((f) => ({
          label: f.charAt(0).toUpperCase() + f.slice(1),
          value: f,
        }))}
        className={styles.selectNumberFormat}
      />
      <Button
        variant="ghost"
        size="small"
        onClick={() =>
          onFormatChange({ borders: { top: true, right: true, bottom: true, left: true } })
        }
      >
        Border
      </Button>
      <Button
        variant="ghost"
        size="small"
        onClick={() => onFormatChange({ merged: { rowSpan: 2, colSpan: 2 } })}
      >
        Merge
      </Button>
    </Toolbar>
  )
}
