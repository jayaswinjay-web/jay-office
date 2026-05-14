import { useState, useEffect, useCallback } from 'react'
import { Button, Modal, Tabs, TabsList, TabsTrigger } from '@/design-system'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { EventDialog } from './EventDialog'
import { MiniCalendar } from './MiniCalendar'
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type CalendarEvent,
  type ViewMode,
} from './cal.service'
import styles from './CalPage.module.css'

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatWeekRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function CalPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const start = new Date(currentDate)
      const end = new Date(currentDate)

      if (viewMode === 'month') {
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
      } else if (viewMode === 'week') {
        const ws = getWeekStart(currentDate)
        start.setTime(ws.getTime())
        end.setTime(ws.getTime() + 7 * 24 * 60 * 60 * 1000)
      } else {
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
      }

      const result = await listEvents({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
      setEvents(result.events)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }, [currentDate, viewMode])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handlePrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1)
    else if (viewMode === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    setCurrentDate(d)
  }

  const handleNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1)
    else if (viewMode === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    setCurrentDate(d)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleSlotClick = (date: Date) => {
    setSelectedSlot(date)
    setEditingEvent(null)
    setShowEventDialog(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventDialog(true)
  }

  const handleSaveEvent = async (data: Omit<CalendarEvent, 'id'>) => {
    try {
      if (editingEvent) {
        const result = await updateEvent(editingEvent.id, data)
        setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? result.event : e)))
      } else {
        const result = await createEvent(data)
        setEvents((prev) => [...prev, result.event])
      }
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  const viewTabs = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ]

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <Button
          className={styles.newEventButton}
          onClick={() => {
            setSelectedSlot(new Date())
            setEditingEvent(null)
            setShowEventDialog(true)
          }}
        >
          <Plus size={16} />
          New Event
        </Button>
        <MiniCalendar currentDate={selectedDate} onSelectDate={handleDateSelect} events={events} />
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button variant="ghost" size="small" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="small" onClick={handlePrev}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" size="small" onClick={handleNext}>
              <ChevronRight size={16} />
            </Button>
            <h1 className={styles.headerTitle}>
              {viewMode === 'month'
                ? formatMonthYear(currentDate)
                : viewMode === 'week'
                  ? formatWeekRange(
                      getWeekStart(currentDate),
                      new Date(getWeekStart(currentDate).getTime() + 6 * 24 * 60 * 60 * 1000),
                    )
                  : currentDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <Tabs value={viewMode} onValueChange={(id: string) => setViewMode(id as ViewMode)}>
              <TabsList>
                {viewTabs.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </header>

        {loading ? (
          <div className={styles.loading}>
            <p>Loading events...</p>
          </div>
        ) : viewMode === 'month' ? (
          <MonthView
            currentDate={currentDate}
            events={events}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
          />
        ) : viewMode === 'week' ? (
          <WeekView
            currentDate={currentDate}
            events={events}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
          />
        ) : (
          <DayView
            currentDate={currentDate}
            events={events}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
          />
        )}
      </main>

      <Modal
        open={showEventDialog}
        onClose={() => {
          setShowEventDialog(false)
          setEditingEvent(null)
          setSelectedSlot(null)
        }}
        title={editingEvent ? 'Edit Event' : 'New Event'}
      >
        <EventDialog
          event={editingEvent}
          defaultDate={selectedSlot}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
        />
      </Modal>
    </div>
  )
}

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

function MonthView({ currentDate, events, onSlotClick, onEventClick }: MonthViewProps) {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(firstDay)
    d.setDate(d.getDate() - (startOffset - i))
    currentWeek.push(d)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    currentWeek.push(d)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const d = new Date(currentWeek[currentWeek.length - 1]!)
      d.setDate(d.getDate() + 1)
      currentWeek.push(d)
    }
    weeks.push(currentWeek)
  }

  const today = new Date()

  return (
    <div className={styles.monthGrid}>
      <div className={styles.weekdayHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className={styles.weekdayCell}>
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className={styles.weekRow}>
          {week.map((date, di) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            const dayEvents = events.filter((e) => {
              const eDate = new Date(e.startDate)
              return (
                eDate.getDate() === date.getDate() &&
                eDate.getMonth() === date.getMonth() &&
                eDate.getFullYear() === date.getFullYear()
              )
            })

            return (
              <div
                key={di}
                className={`${styles.dayCell} ${!isCurrentMonth ? styles.dayCellOtherMonth : ''} ${isToday ? styles.dayCellToday : ''}`}
                onClick={() => onSlotClick(date)}
              >
                <span className={styles.dayNumber}>{date.getDate()}</span>
                <div className={styles.dayEvents}>
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={styles.eventChip}
                      style={{ backgroundColor: event.color + '33', color: event.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <span className={styles.eventChipTitle}>{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className={styles.moreEvents}>+{dayEvents.length - 3} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

function WeekView({ currentDate, events, onSlotClick, onEventClick }: WeekViewProps) {
  const weekStart = getWeekStart(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const today = new Date()

  return (
    <div className={styles.weekContainer}>
      <div className={styles.weekHeader}>
        <div className={styles.timeColumnHeader} />
        {days.map((date, i) => {
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          return (
            <div
              key={i}
              className={`${styles.weekDayHeader} ${isToday ? styles.weekDayToday : ''}`}
            >
              <span className={styles.weekDayName}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span
                className={`${styles.weekDayNumber} ${isToday ? styles.weekDayNumberToday : ''}`}
              >
                {date.getDate()}
              </span>
            </div>
          )
        })}
      </div>
      <div className={styles.weekBody}>
        <div className={styles.timeColumn}>
          {hours.map((h) => (
            <div key={h} className={styles.timeLabel}>
              {h === 0 ? '' : `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`}
            </div>
          ))}
        </div>
        {days.map((date, di) => {
          const dayEvents = events.filter((e) => {
            const eDate = new Date(e.startDate)
            return (
              eDate.getDate() === date.getDate() &&
              eDate.getMonth() === date.getMonth() &&
              eDate.getFullYear() === date.getFullYear()
            )
          })
          return (
            <div key={di} className={styles.weekDayColumn}>
              {hours.map((h) => (
                <div
                  key={h}
                  className={styles.hourSlot}
                  onClick={() => {
                    const slotDate = new Date(date)
                    slotDate.setHours(h, 0, 0, 0)
                    onSlotClick(slotDate)
                  }}
                />
              ))}
              {dayEvents.map((event) => {
                const start = new Date(event.startDate)
                const end = new Date(event.endDate)
                const startMinutes = start.getHours() * 60 + start.getMinutes()
                const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
                return (
                  <div
                    key={event.id}
                    className={styles.weekEvent}
                    style={{
                      top: `${(startMinutes / 60) * 60}px`,
                      height: `${Math.max((durationMinutes / 60) * 60, 24)}px`,
                      backgroundColor: event.color + '33',
                      borderColor: event.color,
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <span className={styles.weekEventTitle}>{event.title}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

function DayView({ currentDate, events, onSlotClick, onEventClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayEvents = events.filter((e) => {
    const eDate = new Date(e.startDate)
    return (
      eDate.getDate() === currentDate.getDate() &&
      eDate.getMonth() === currentDate.getMonth() &&
      eDate.getFullYear() === currentDate.getFullYear()
    )
  })

  return (
    <div className={styles.dayContainer}>
      <div className={styles.dayHeader}>
        <div className={styles.timeColumnHeader} />
        <div className={styles.dayHeaderDate}>
          <span className={styles.dayHeaderName}>
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <span className={styles.dayHeaderNumber}>{currentDate.getDate()}</span>
        </div>
      </div>
      <div className={styles.dayBody}>
        <div className={styles.timeColumn}>
          {hours.map((h) => (
            <div key={h} className={styles.timeLabel}>
              {h === 0 ? '' : `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`}
            </div>
          ))}
        </div>
        <div className={styles.dayColumn}>
          {hours.map((h) => (
            <div
              key={h}
              className={styles.hourSlot}
              onClick={() => {
                const slotDate = new Date(currentDate)
                slotDate.setHours(h, 0, 0, 0)
                onSlotClick(slotDate)
              }}
            />
          ))}
          {dayEvents.map((event) => {
            const start = new Date(event.startDate)
            const end = new Date(event.endDate)
            const startMinutes = start.getHours() * 60 + start.getMinutes()
            const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
            return (
              <div
                key={event.id}
                className={styles.dayEvent}
                style={{
                  top: `${(startMinutes / 60) * 60}px`,
                  height: `${Math.max((durationMinutes / 60) * 60, 24)}px`,
                  backgroundColor: event.color + '33',
                  borderColor: event.color,
                }}
                onClick={() => onEventClick(event)}
              >
                <span className={styles.dayEventTitle}>{event.title}</span>
                <span className={styles.dayEventTime}>
                  {start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
