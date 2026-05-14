import { useState, useCallback, useEffect } from 'react'
import { Button, Modal } from '@/design-system'
import { Plus, Monitor } from 'lucide-react'
import { SlideCanvas } from './SlideCanvas'
import { ElementToolbar } from './ElementToolbar'
import { PropertiesPanel } from './PropertiesPanel'
import { SlideTabs } from './SlideTabs'
import { createSlide, deleteSlide, duplicateSlide, updateSlide, listSlides } from './slides.service'
import type { SlideItem, CanvasElementType } from './slides.service'
import styles from './SlidesPage.module.css'

export function SlidesPage() {
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const [showTransitionModal, setShowTransitionModal] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const [presentIndex, setPresentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadSlides = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listSlides()
      setSlides(result.slides)
      if (result.slides.length > 0 && !activeSlideId) {
        setActiveSlideId(result.slides[0]!.id)
      }
    } catch (error) {
      console.error('Failed to load slides:', error)
    } finally {
      setLoading(false)
    }
  }, [activeSlideId])

  useEffect(() => {
    loadSlides()
  }, [loadSlides])

  const handleAddSlide = async () => {
    try {
      const result = await createSlide(`Slide ${slides.length + 1}`)
      setSlides((prev) => [...prev, result.slide])
      setActiveSlideId(result.slide.id)
    } catch (error) {
      console.error('Failed to create slide:', error)
    }
  }

  const handleDuplicateSlide = async (id: string) => {
    try {
      const result = await duplicateSlide(id)
      const idx = slides.findIndex((s) => s.id === id)
      const updated = [...slides]
      updated.splice(idx + 1, 0, result.slide)
      setSlides(updated)
    } catch (error) {
      console.error('Failed to duplicate slide:', error)
    }
  }

  const handleDeleteSlide = async (id: string) => {
    if (slides.length <= 1) return
    try {
      await deleteSlide(id)
      const updated = slides.filter((s) => s.id !== id)
      setSlides(updated)
      if (activeSlideId === id) {
        setActiveSlideId(updated[0]!.id)
      }
    } catch (error) {
      console.error('Failed to delete slide:', error)
    }
  }

  const handleMoveSlide = (id: string, direction: 'up' | 'down') => {
    const idx = slides.findIndex((s) => s.id === id)
    if (idx < 0) return
    const newIdx = direction === 'up' ? Math.max(0, idx - 1) : Math.min(slides.length - 1, idx + 1)
    if (newIdx === idx) return
    const updated = [...slides]
    const [item] = updated.splice(idx, 1)
    updated.splice(newIdx, 0, item!)
    setSlides(updated)
  }

  const handleUpdateSlide = async (id: string, updates: Partial<SlideItem>) => {
    try {
      const result = await updateSlide(id, updates)
      setSlides((prev) => prev.map((s) => (s.id === id ? result.slide! : s)))
    } catch (error) {
      console.error('Failed to update slide:', error)
    }
  }

  const handleAddElement = (type: CanvasElementType) => {
    if (!activeSlideId) return
    const activeSlide = slides.find((s) => s.id === activeSlideId)
    if (!activeSlide) return

    const newElementId = `el_${Date.now()}`
    handleUpdateSlide(activeSlideId, {
      elements: [...activeSlide.elements, { id: newElementId, type, properties: {} }],
    })
  }

  const activeSlide = slides.find((s) => s.id === activeSlideId) ?? null

  if (isPresenting && activeSlide) {
    const presentSlide = slides[presentIndex] ?? activeSlide
    return (
      <div className={styles.presenterOverlay}>
        <div className={styles.presenterContainer}>
          <div className={styles.presenterSlide}>
            <SlideCanvas
              slide={presentSlide}
              selectedElementId={null}
              onSelectElement={() => {}}
              readOnly
            />
          </div>
          <div className={styles.presenterControls}>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setPresentIndex((i) => Math.max(0, i - 1))}
              disabled={presentIndex === 0}
            >
              Previous
            </Button>
            <span className={styles.presenterCounter}>
              {presentIndex + 1} / {slides.length}
            </span>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setPresentIndex((i) => Math.min(slides.length - 1, i + 1))}
              disabled={presentIndex >= slides.length - 1}
            >
              Next
            </Button>
            <Button variant="ghost" size="small" onClick={() => setIsPresenting(false)}>
              Exit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Slides</span>
          <Button size="small" onClick={handleAddSlide}>
            <Plus size={16} />
          </Button>
        </div>
        {loading ? (
          <div className={styles.sidebarLoading}>Loading slides...</div>
        ) : (
          <SlideTabs
            slides={slides}
            activeSlideId={activeSlideId}
            onSelectSlide={setActiveSlideId}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
          />
        )}
      </div>

      <div className={styles.main}>
        <div className={styles.toolbar}>
          <span className={styles.slideTitle}>{activeSlide?.title ?? 'No slide selected'}</span>
          <div className={styles.toolbarActions}>
            <Button size="small" variant="ghost" onClick={() => setShowTransitionModal(true)}>
              Transitions
            </Button>
            <Button
              size="small"
              onClick={() => {
                setPresentIndex(slides.findIndex((s) => s.id === activeSlideId))
                setIsPresenting(true)
              }}
              disabled={!activeSlide}
            >
              <Monitor size={16} />
              Present
            </Button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.canvasArea}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : activeSlide ? (
              <SlideCanvas
                slide={activeSlide!}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
              />
            ) : (
              <div className={styles.emptyState}>
                <p>Add a slide to get started</p>
                <Button onClick={handleAddSlide}>
                  <Plus size={16} />
                  Add Slide
                </Button>
              </div>
            )}
          </div>

          <div className={styles.propertiesSidebar}>
            <ElementToolbar onAddElement={handleAddElement} />
            <PropertiesPanel
              selectedElementId={selectedElementId}
              onUpdateElement={(updates) => {
                if (!activeSlide || !selectedElementId) return
                const updatedElements = activeSlide!.elements.map((el) =>
                  el.id === selectedElementId
                    ? { ...el, properties: { ...el.properties, ...updates } }
                    : el,
                )
                handleUpdateSlide(activeSlideId!, { elements: updatedElements })
              }}
            />
          </div>
        </div>

        <div className={styles.notesPanel}>
          <div className={styles.notesHeader}>
            <span className={styles.notesTitle}>Speaker Notes</span>
            <button className={styles.notesToggle} onClick={() => setShowNotes(!showNotes)}>
              {showNotes ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {showNotes && (
            <textarea
              className={styles.notesTextarea}
              placeholder="Add speaker notes..."
              value={activeSlide?.notes ?? ''}
              onChange={(e) =>
                activeSlide && handleUpdateSlide(activeSlide.id, { notes: e.target.value })
              }
            />
          )}
        </div>
      </div>

      {showTransitionModal && activeSlide && (
        <Modal
          open={showTransitionModal}
          onClose={() => setShowTransitionModal(false)}
          title="Slide Transitions"
        >
          <div className={styles.transitionModal}>
            <div className={styles.transitionGrid}>
              {['None', 'Fade', 'Slide', 'Zoom', 'Flip', 'Dissolve'].map((t) => (
                <button
                  key={t}
                  className={`${styles.transitionOption} ${activeSlide.transition === t ? styles.transitionOptionActive : ''}`}
                  onClick={() => handleUpdateSlide(activeSlide.id, { transition: t })}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className={styles.transitionDuration}>
              <label htmlFor="duration">Duration (ms)</label>
              <input
                id="duration"
                type="number"
                min={100}
                max={3000}
                step={100}
                value={activeSlide.transitionDuration}
                onChange={(e) =>
                  handleUpdateSlide(activeSlide.id, {
                    transitionDuration: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
