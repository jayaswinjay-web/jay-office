import { useMemo, useState } from 'react'
import { format, addDays, differenceInDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/design-system'
import type { Task } from './tasks.service'
import styles from './GanttChart.module.css'

const priorityColors: Record<string, string> = {
  P1: '#ef4444',
  P2: '#f97316',
  P3: '#3b82f6',
  P4: '#6b7280',
}

interface GanttChartProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
}

export function GanttChart({ tasks, onSelectTask }: GanttChartProps) {
  const [viewStart, setViewStart] = useState(new Date())
  const viewDays = 30

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : Date.now()
      const bDate = b.startDate ? new Date(b.startDate).getTime() : Date.now()
      return aDate - bDate
    })
  }, [tasks])

  const days = Array.from({ length: viewDays }, (_, i) => addDays(viewStart, i))

  const handlePrev = () => {
    setViewStart((d) => addDays(d, -viewDays))
  }

  const handleNext = () => {
    setViewStart((d) => addDays(d, viewDays))
  }

  const handleToday = () => {
    setViewStart(new Date())
  }

  const getTaskBar = (task: Task): { left: string; width: string } | null => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date()
    const endDate = task.dueDate ? new Date(task.dueDate) : addDays(startDate, 7)

    const startDiff = differenceInDays(startDate, viewStart)
    const duration = differenceInDays(endDate, startDate) + 1

    if (startDiff + duration < 0 || startDiff > viewDays) return null

    const left = Math.max(0, startDiff) * 40
    const width = Math.min(duration, viewDays - startDiff) * 40

    return {
      left: `${left}px`,
      width: `${Math.max(width, 20)}px`,
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button variant="ghost" size="small" onClick={handlePrev}>
          <ChevronLeft size={16} />
        </Button>
        <Button variant="ghost" size="small" onClick={handleToday}>
          Today
        </Button>
        <Button variant="ghost" size="small" onClick={handleNext}>
          <ChevronRight size={16} />
        </Button>
        <span className={styles.dateRange}>
          {format(viewStart, 'MMM d, yyyy')} -{' '}
          {format(addDays(viewStart, viewDays - 1), 'MMM d, yyyy')}
        </span>
      </div>

      <div className={styles.chart}>
        <div className={styles.taskLabels}>
          <div className={styles.taskLabelHeader}>Task</div>
          {sortedTasks.map((task) => (
            <div key={task.id} className={styles.taskLabel} onClick={() => onSelectTask(task)}>
              <span
                className={styles.priorityDot}
                style={{ backgroundColor: priorityColors[task.priority] }}
              />
              <span className={styles.taskLabelText}>{task.title}</span>
            </div>
          ))}
        </div>

        <div className={styles.timeline}>
          <div className={styles.dayHeaders}>
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6
              const isToday =
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear()
              return (
                <div
                  key={i}
                  className={`${styles.dayHeader} ${isWeekend ? styles.dayHeaderWeekend : ''} ${isToday ? styles.dayHeaderToday : ''}`}
                >
                  <span className={styles.dayName}>{format(day, 'EEE').charAt(0)}</span>
                  <span className={styles.dayNum}>{format(day, 'd')}</span>
                </div>
              )
            })}
          </div>

          <div className={styles.gridRows}>
            {sortedTasks.map((task) => {
              const bar = getTaskBar(task)
              const isWeekend = (day: Date) => day.getDay() === 0 || day.getDay() === 6
              return (
                <div key={task.id} className={styles.gridRow}>
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`${styles.gridCell} ${isWeekend(day) ? styles.gridCellWeekend : ''}`}
                    />
                  ))}
                  {bar && (
                    <div
                      className={styles.taskBar}
                      style={{
                        left: bar.left,
                        width: bar.width,
                        backgroundColor: priorityColors[task.priority] + 'cc',
                      }}
                      onClick={() => onSelectTask(task)}
                    >
                      <span className={styles.taskBarLabel}>{task.title}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
