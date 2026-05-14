import { Copy, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import type { SlideItem } from './slides.service'
import styles from './SlideTabs.module.css'

interface SlideTabsProps {
  slides: SlideItem[]
  activeSlideId: string | null
  onSelectSlide: (id: string) => void
  onDuplicateSlide: (id: string) => void
  onDeleteSlide: (id: string) => void
  onMoveSlide: (id: string, direction: 'up' | 'down') => void
}

export function SlideTabs({
  slides,
  activeSlideId,
  onSelectSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
}: SlideTabsProps) {
  return (
    <div className={styles.list}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.tab} ${activeSlideId === slide.id ? styles.tabActive : ''}`}
          onClick={() => onSelectSlide(slide.id)}
        >
          <div className={styles.tabNumber}>{index + 1}</div>
          <div className={styles.tabThumbnail}>
            {slide.thumbnail ? (
              <img src={slide.thumbnail} alt={slide.title} className={styles.thumbnailImage} />
            ) : (
              <span className={styles.placeholderText}>{slide.title}</span>
            )}
          </div>
          <div className={styles.tabActions}>
            <button
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation()
                onMoveSlide(slide.id, 'up')
              }}
              disabled={index === 0}
              title="Move Up"
            >
              <ChevronUp size={12} />
            </button>
            <button
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation()
                onMoveSlide(slide.id, 'down')
              }}
              disabled={index === slides.length - 1}
              title="Move Down"
            >
              <ChevronDown size={12} />
            </button>
            <button
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation()
                onDuplicateSlide(slide.id)
              }}
              title="Duplicate"
            >
              <Copy size={12} />
            </button>
            <button
              className={`${styles.actionButton} ${styles.actionDanger}`}
              onClick={(e) => {
                e.stopPropagation()
                onDeleteSlide(slide.id)
              }}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
            <div className={styles.dragHandle} title="Drag to reorder">
              <GripVertical size={12} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
