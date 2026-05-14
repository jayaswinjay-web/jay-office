import { useState } from 'react'
import { Button } from '@/design-system'
import { Play } from 'lucide-react'
import styles from './SlideTransitions.module.css'

const transitions = ['None', 'Fade', 'Push', 'Wipe', 'Split', 'Zoom', 'Flip', 'Morph']

interface SlideTransitionData {
  id: string
  title: string
  transition: string
  transitionDuration: number
}

interface SlideTransitionsProps {
  slide: SlideTransitionData
  onUpdate: (updates: Partial<SlideTransitionData>) => void
}

export function SlideTransitions({ slide, onUpdate }: SlideTransitionsProps) {
  const [selectedTransition, setSelectedTransition] = useState(slide.transition ?? 'None')
  const [duration, setDuration] = useState(slide.transitionDuration ?? 200)

  const handleSelect = (transition: string) => {
    setSelectedTransition(transition)
    onUpdate({ transition, transitionDuration: duration })
  }

  const handleDurationChange = (value: number) => {
    setDuration(value)
    onUpdate({ transition: selectedTransition, transitionDuration: value })
  }

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.sectionLabel}>TRANSITION</label>
        <div className={styles.transitionGrid}>
          {transitions.map((t) => (
            <Button
              key={t}
              variant={selectedTransition === t ? 'default' : 'outline'}
              size="sm"
              className={styles.sectionLabel}
              onClick={() => handleSelect(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.durationHeader}>
          <label className={styles.sectionLabel}>DURATION</label>
          <span className={styles.durationValue}>{duration}ms</span>
        </div>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={duration}
          onChange={(e) => handleDurationChange(Number(e.target.value))}
          className={styles.durationSlider}
        />
        <div className={styles.durationLabels}>
          <span>100ms</span>
          <span>2000ms</span>
        </div>
      </div>

      <div className={styles.previewRow}>
        <Play
          className={styles.previewIcon}
          style={{ width: '1rem', height: '1rem', color: 'var(--color-text-tertiary, #9ca3af)' }}
        />
        <span className={styles.previewText}>Preview transition</span>
      </div>
    </div>
  )
}
