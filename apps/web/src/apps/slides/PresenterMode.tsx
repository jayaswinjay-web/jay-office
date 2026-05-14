import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './PresenterMode.module.css'
import { ChevronRight, ChevronLeft, Clock, Eye, EyeOff } from 'lucide-react'

interface Slide {
  id: string
  content: React.ReactNode
  notes?: string
}

interface PresenterModeProps {
  slides: Slide[]
  initialSlideIndex?: number
  onExit: () => void
}

export const PresenterMode: React.FC<PresenterModeProps> = ({
  slides,
  initialSlideIndex = 0,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialSlideIndex)
  const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(true)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [_isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  const currentSlide: Slide | undefined = slides[currentIndex]
  const nextSlide: Slide | undefined = slides[currentIndex + 1]

  useEffect(() => {
    const enterFullscreen = async (): Promise<void> => {
      try {
        if (containerRef.current && !document.fullscreenElement) {
          await containerRef.current.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (error) {
        console.error('Failed to enter fullscreen:', error)
      }
    }
    enterFullscreen()
  }, [])

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement) {
        onExit()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [onExit])

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [])

  const formatTime = (totalSeconds: number): string => {
    const minutes: number = Math.floor(totalSeconds / 60)
    const seconds: number = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const goToNext = useCallback((): void => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, slides.length])

  const goToPrevious = useCallback((): void => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const exitPresenterMode = useCallback(async (): Promise<void> => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
    onExit()
  }, [onExit])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          goToNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'Escape':
          e.preventDefault()
          exitPresenterMode()
          break
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setIsNotesExpanded((prev) => !prev)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goToNext, goToPrevious, exitPresenterMode])

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest(`.${styles.currentSlide}`)
    ) {
      goToNext()
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.presenterContainer}
      onClick={handleContainerClick}
      role="presentation"
    >
      <div className={styles.slideCounter}>
        {currentIndex + 1} / {slides.length}
      </div>

      <button className={styles.exitButton} onClick={exitPresenterMode}>
        <Eye size={14} />
        Exit Presenter
      </button>

      <div className={styles.timer}>
        <Clock size={20} />
        {formatTime(elapsedSeconds)}
      </div>

      <div className={styles.currentSlide}>
        <div className={styles.slideContent}>{currentSlide?.content}</div>
      </div>

      {nextSlide && (
        <div className={styles.nextSlidePreview}>
          <span className={styles.previewLabel}>Next</span>
          <div>{nextSlide.content}</div>
        </div>
      )}

      <div className={isNotesExpanded ? styles.speakerNotesExpanded : styles.speakerNotesCollapsed}>
        <div className={styles.notesHeader} onClick={() => setIsNotesExpanded((prev) => !prev)}>
          <div className={styles.notesTitle}>
            {isNotesExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
            Speaker Notes
          </div>
          {isNotesExpanded ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </div>
        {isNotesExpanded && (
          <div className={styles.notesContent}>
            {currentSlide?.notes || 'No notes for this slide.'}
          </div>
        )}
      </div>

      <div className={styles.navHint}>
        <span className={styles.navHintItem}>
          <ChevronLeft size={12} /> <ChevronRight size={12} /> Navigate
        </span>
        <span className={styles.navHintItem}>ESC Exit</span>
        <span className={styles.navHintItem}>Ctrl+↓ Toggle Notes</span>
      </div>
    </div>
  )
}

export default PresenterMode
