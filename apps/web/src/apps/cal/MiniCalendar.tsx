import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from './cal.service'
import styles from './MiniCalendar.module.css'

interface MiniCalendarProps {
  currentDate: Date
  onSelectDate: (date: Date) => void
  events: CalendarEvent[]
}

export function MiniCalendar({ currentDate, onSelectDate, events }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(currentDate))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const today = new Date()

  const days: { date: Date; isCurrentMonth: boolean }[] = []

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, -(startOffset - 1 - i))
    days.push({ date: d, isCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    days.push({ date: d, isCurrentMonth: true })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, isCurrentMonth: false })
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const hasEventOnDate = (date: Date): boolean => {
    return events.some((e) => {
      const eDate = new Date(e.startDate)
      return (
        eDate.getDate() === date.getDate() &&
        eDate.getMonth() === date.getMonth() &&
        eDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navButton} onClick={handlePrevMonth}>
          <ChevronLeft size={16} />
        </button>
        <span className={styles.monthTitle}>
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button className={styles.navButton} onClick={handleNextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className={styles.weekdayRow}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className={styles.weekdayCell}>
            {d}
          </div>
        ))}
      </div>
      <div className={styles.daysGrid}>
        {days.map((day, i) => {
          const isToday =
            day.date.getDate() === today.getDate() &&
            day.date.getMonth() === today.getMonth() &&
            day.date.getFullYear() === today.getFullYear()
          const isSelected =
            day.date.getDate() === currentDate.getDate() &&
            day.date.getMonth() === currentDate.getMonth() &&
            day.date.getFullYear() === currentDate.getFullYear()
          const hasEvent = hasEventOnDate(day.date)

          return (
            <button
              key={i}
              className={`${styles.dayCell} ${!day.isCurrentMonth ? styles.dayCellOther : ''} ${isToday ? styles.dayCellToday : ''} ${isSelected ? styles.dayCellSelected : ''}`}
              onClick={() => {
                onSelectDate(day.date)
                setViewDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1))
              }}
            >
              <span>{day.date.getDate()}</span>
              {hasEvent && <div className={styles.eventDot} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
