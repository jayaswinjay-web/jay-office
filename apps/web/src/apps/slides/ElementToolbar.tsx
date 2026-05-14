
import {
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
  ArrowRight,
  Image,
  Table2,
  BarChart3,
  Smile,
} from 'lucide-react'
import type { CanvasElementType } from './slides.service'
import styles from './ElementToolbar.module.css'

interface ElementToolbarProps {
  onAddElement: (type: CanvasElementType) => void
}

interface ElementDef {
  type: CanvasElementType
  label: string
  icon: React.ReactNode
}

const ELEMENTS: ElementDef[] = [
  { type: 'text', label: 'Text', icon: <Type size={16} /> },
  { type: 'rect', label: 'Rectangle', icon: <Square size={16} /> },
  { type: 'circle', label: 'Circle', icon: <Circle size={16} /> },
  { type: 'triangle', label: 'Triangle', icon: <Triangle size={16} /> },
  { type: 'line', label: 'Line', icon: <Minus size={16} /> },
  { type: 'arrow', label: 'Arrow', icon: <ArrowRight size={16} /> },
  { type: 'image', label: 'Image', icon: <Image size={16} /> },
  { type: 'table', label: 'Table', icon: <Table2 size={16} /> },
  { type: 'chart', label: 'Chart', icon: <BarChart3 size={16} /> },
  { type: 'icon', label: 'Icon', icon: <Smile size={16} /> },
]

export function ElementToolbar({ onAddElement }: ElementToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.sectionLabel}>ELEMENTS</div>
      <div className={styles.grid}>
        {ELEMENTS.map((el) => (
          <button
            key={el.type}
            className={styles.elementButton}
            onClick={() => onAddElement(el.type)}
            title={el.label}
          >
            {el.icon}
            <span className={styles.elementLabel}>{el.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
