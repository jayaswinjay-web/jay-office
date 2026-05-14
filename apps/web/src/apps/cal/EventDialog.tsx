import { useState, useEffect } from 'react'
import { Button, Input, Textarea } from '@/design-system'
import { Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react'
import type { CalendarEvent } from './cal.service'
import styles from './EventDialog.module.css'

interface EventDialogProps {
  event: CalendarEvent | null
  defaultDate: Date | null
  onSave: (data: Omit<CalendarEvent, 'id'>) => void
  onDelete?: () => void
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTimeForInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function EventDialog({ event, defaultDate, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [isAllDay, setIsAllDay] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description ?? '')
      setStartDate(formatDateForInput(new Date(event.startDate)))
      setStartTime(formatTimeForInput(new Date(event.startDate)))
      setEndDate(formatDateForInput(new Date(event.endDate)))
      setEndTime(formatTimeForInput(new Date(event.endDate)))
      setLocation(event.location ?? '')
      setColor(event.color)
      setIsAllDay(event.isAllDay ?? false)
    } else if (defaultDate) {
      const end = new Date(defaultDate)
      end.setHours(end.getHours() + 1)
      setTitle('')
      setDescription('')
      setStartDate(formatDateForInput(defaultDate))
      setStartTime(formatTimeForInput(defaultDate))
      setEndDate(formatDateForInput(end))
      setEndTime(formatTimeForInput(end))
      setLocation('')
      setColor('#3b82f6')
      setIsAllDay(false)
    }
  }, [event, defaultDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${isAllDay ? '23:59' : endTime}`)

    onSave({
      title,
      description,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      location,
      color,
      isAllDay,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="event-title" className={styles.label}>
          Title
        </label>
        <Input
          id="event-title"
          value={title}
           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Event title"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="event-desc" className={styles.label}>
          Description
        </label>
        <Textarea
          id="event-desc"
          value={description}
           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          placeholder="Add description"
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={`${styles.field} ${styles.half}`}>
          <label htmlFor="start-date" className={styles.label}>
            <CalendarIcon size={12} />
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
        <div className={`${styles.field} ${styles.half}`}>
          <label htmlFor="start-time" className={styles.label}>
            <Clock size={12} />
            Start Time
          </label>
          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={styles.dateInput}
            disabled={isAllDay}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={`${styles.field} ${styles.half}`}>
          <label htmlFor="end-date" className={styles.label}>
            <CalendarIcon size={12} />
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
        <div className={`${styles.field} ${styles.half}`}>
          <label htmlFor="end-time" className={styles.label}>
            <Clock size={12} />
            End Time
          </label>
          <input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={styles.dateInput}
            disabled={isAllDay}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
          />
          All Day Event
        </label>
      </div>

      <div className={styles.field}>
        <label htmlFor="event-location" className={styles.label}>
          Location
        </label>
        <Input
          id="event-location"
          value={location}
           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
          placeholder="Add location"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <div className={styles.colorPicker}>
          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'].map(
            (c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorOption} ${color === c ? styles.colorOptionActive : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ),
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {onDelete && (
          <Button variant="danger" type="button" onClick={onDelete}>
            <Trash2 size={16} />
            Delete
          </Button>
        )}
        <div className={styles.actionsRight}>
          <Button
            variant="ghost"
            type="button"
            onClick={() =>
              onSave({
                title: '',
                description: '',
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                location: '',
                color: '#3b82f6',
                isAllDay: false,
              })
            }
          >
            Cancel
          </Button>
          <Button type="submit">{event ? 'Update' : 'Create'}</Button>
        </div>
      </div>
    </form>
  )
}
