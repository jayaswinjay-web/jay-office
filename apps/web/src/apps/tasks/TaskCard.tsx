import { Calendar, User } from 'lucide-react'
import type { Task, TaskPriority } from './tasks.service'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  isDragging: boolean
  onSelect: (task: Task) => void
  onDragStart: () => void
  onDragEnd: () => void
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  P1: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
  P2: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  P3: { label: 'Medium', color: '#3b82f6', bg: '#eff6ff' },
  P4: { label: 'Low', color: '#6b7280', bg: '#f3f4f6' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TaskCard({ task, isDragging, onSelect, onDragStart, onDragEnd }: TaskCardProps) {
  const priority = priorityConfig[task.priority]
  const isOverdue = task.dueDate
    ? new Date(task.dueDate) < new Date() && task.status !== 'done'
    : false

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(task)}
    >
      <div className={styles.cardHeader}>
        <span
          className={styles.priorityBadge}
          style={{ backgroundColor: priority.bg, color: priority.color }}
        >
          {priority.label}
        </span>
        {isOverdue && <span className={styles.overdueBadge}>Overdue</span>}
      </div>
      <h3 className={styles.cardTitle}>{task.title}</h3>
      {task.description && (
        <p className={styles.cardDescription}>
          {task.description.length > 80
            ? `${task.description.substring(0, 80)}...`
            : task.description}
        </p>
      )}
      <div className={styles.cardFooter}>
        {task.assignee && (
          <span className={styles.assignee}>
            <User size={12} />
            {task.assignee}
          </span>
        )}
        {task.dueDate && (
          <span className={`${styles.dueDate} ${isOverdue ? styles.dueDateOverdue : ''}`}>
            <Calendar size={12} />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className={styles.tags}>
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
