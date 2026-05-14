import { useState, useEffect } from 'react'
import { Button } from '@/design-system'
import {
  Palette,
  Square,
  Droplets,
  RotateCw,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
} from 'lucide-react'
import styles from './PropertiesPanel.module.css'

interface ElementProperties {
  fill: string
  borderColor: string
  borderWidth: number
  opacity: number
  shadowBlur: number
  shadowColor: string
  rotation: number
  x: number
  y: number
  width: number
  height: number
  locked: boolean
}

const DEFAULT_PROPERTIES: ElementProperties = {
  fill: '#3b82f6',
  borderColor: '#111827',
  borderWidth: 1,
  opacity: 1,
  shadowBlur: 0,
  shadowColor: '#000000',
  rotation: 0,
  x: 0,
  y: 0,
  width: 150,
  height: 100,
  locked: false,
}

interface PropertiesPanelProps {
  selectedElementId: string | null
  onUpdateElement: (updates: Partial<ElementProperties>) => void
}

export function PropertiesPanel({ selectedElementId, onUpdateElement }: PropertiesPanelProps) {
  const [props, setProps] = useState<ElementProperties>(DEFAULT_PROPERTIES)

  useEffect(() => {
    if (selectedElementId) {
      setProps(DEFAULT_PROPERTIES)
    }
  }, [selectedElementId])

  const handleChange = (field: keyof ElementProperties, value: string | number | boolean) => {
    const updated = { ...props, [field]: value }
    setProps(updated)
    onUpdateElement({ [field]: value })
  }

  if (!selectedElementId) {
    return (
      <div className={styles.emptyState}>
        <p>Select an element to view properties</p>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <Palette size={12} />
          FILL
        </div>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={props.fill}
            onChange={(e) => handleChange('fill', e.target.value)}
            className={styles.colorInput}
          />
          <input
            type="text"
            value={props.fill}
            onChange={(e) => handleChange('fill', e.target.value)}
            className={styles.textInput}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <Square size={12} />
          BORDER
        </div>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={props.borderColor}
            onChange={(e) => handleChange('borderColor', e.target.value)}
            className={styles.colorInput}
          />
          <input
            type="number"
            value={props.borderWidth}
            min={0}
            max={20}
            onChange={(e) => handleChange('borderWidth', Number(e.target.value))}
            className={styles.numberInput}
            placeholder="Width"
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>OPACITY</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={props.opacity}
          onChange={(e) => handleChange('opacity', Number(e.target.value))}
          className={styles.rangeInput}
        />
        <span className={styles.rangeValue}>{Math.round(props.opacity * 100)}%</span>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <Droplets size={12} />
          SHADOW
        </div>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={props.shadowColor}
            onChange={(e) => handleChange('shadowColor', e.target.value)}
            className={styles.colorInput}
          />
          <input
            type="number"
            value={props.shadowBlur}
            min={0}
            max={50}
            onChange={(e) => handleChange('shadowBlur', Number(e.target.value))}
            className={styles.numberInput}
            placeholder="Blur"
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>POSITION & SIZE</div>
        <div className={styles.positionGrid}>
          <div className={styles.field}>
            <label>X</label>
            <input
              type="number"
              value={props.x}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className={styles.smallInput}
            />
          </div>
          <div className={styles.field}>
            <label>Y</label>
            <input
              type="number"
              value={props.y}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className={styles.smallInput}
            />
          </div>
          <div className={styles.field}>
            <label>W</label>
            <input
              type="number"
              value={props.width}
              min={10}
              onChange={(e) => handleChange('width', Number(e.target.value))}
              className={styles.smallInput}
            />
          </div>
          <div className={styles.field}>
            <label>H</label>
            <input
              type="number"
              value={props.height}
              min={10}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              className={styles.smallInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <RotateCw size={12} />
          ROTATION
        </div>
        <div className={styles.rotationRow}>
          <input
            type="number"
            value={props.rotation}
            min={0}
            max={360}
            onChange={(e) => handleChange('rotation', Number(e.target.value))}
            className={styles.textInput}
          />
          <span className={styles.degreeSymbol}>°</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>ARRANGE</div>
        <div className={styles.arrangeRow}>
          <Button variant="ghost" size="small" title="Bring Forward">
            <ChevronUp size={16} />
          </Button>
          <Button variant="ghost" size="small" title="Send Backward">
            <ChevronDown size={16} />
          </Button>
          <Button variant="ghost" size="small" title="Align Left">
            <AlignLeft size={16} />
          </Button>
          <Button variant="ghost" size="small" title="Align Center">
            <AlignCenter size={16} />
          </Button>
          <Button variant="ghost" size="small" title="Align Right">
            <AlignRight size={16} />
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <Button
          variant="ghost"
          size="small"
          className={styles.fullWidth}
          onClick={() => handleChange('locked', !props.locked)}
        >
          {props.locked ? <Lock size={16} /> : <Unlock size={16} />}
          {props.locked ? 'Unlock Element' : 'Lock Element'}
        </Button>
      </div>
    </div>
  )
}
