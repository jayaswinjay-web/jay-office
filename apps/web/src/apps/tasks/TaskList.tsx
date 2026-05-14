import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, User, ChevronDown, ChevronRight } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority } from './tasks.service'
import styles from './TaskList.module.css'

interface TaskListProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onUpdateTask: (id: string, data: Partial<Task>) => void
}

const priorityColors: Record<TaskPriority, string> = {
  P1: '#ef4444',
  P2: '#f97316',
  P3: '#3b82f6',
  P4: '#6b7280',
}

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
}

export function TaskList({ tasks, onSelectTask, onUpdateTask }: TaskListProps) {
  const grouped = groupByStatus(tasks)
  const [expandedGroups, setExpandedGroups] = useState<Set<TaskStatus>>(
    new Set(['todo', 'in-progress']),
  )

  const toggleGroup = (status: TaskStatus) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thStatus}>Status</th>
            <th className={styles.thTitle}>Title</th>
            <th className={styles.thPriority}>Priority</th>
            <th className={styles.thAssignee}>Assignee</th>
            <th className={styles.thDue}>Due Date</th>
            <th className={styles.thTags}>Tags</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([status, groupTasks]) => {
            const isExpanded = expandedGroups.has(status)
            return (
              <tr key={status} className={styles.groupHeader}>
                <td colSpan={6} className={styles.groupHeaderCell}>
                  <button className={styles.groupToggle} onClick={() => toggleGroup(status)}>
                    {isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    <span className={styles.groupLabel}>{statusLabels[status]}</span>
                    <span className={styles.groupCount}>{groupTasks.length}</span>
                  </button>
                </td>
              </tr>
            )
          })}
          {grouped.flatMap(([status, groupTasks]) => {
            const isExpanded = expandedGroups.has(status)
            return groupTasks.map((task) => (
              <tr
                key={task.id}
                className={`${styles.taskRow} ${!isExpanded ? styles.taskRowHidden : ''}`}
                onClick={() => onSelectTask(task)}
              >
                <td className={styles.td}>
                  <select
                    className={styles.statusSelect}
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTask(task.id, { status: e.target.value as TaskStatus })
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </td>
                <td className={`${styles.td} ${styles.tdTitle}`}>{task.title}</td>
                <td className={styles.td}>
                  <span
                    className={styles.priorityBadge}
                    style={{
                      backgroundColor: priorityColors[task.priority] + '20',
                      color: priorityColors[task.priority],
                    }}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className={styles.td}>
                  {task.assignee ? (
                    <span className={styles.assignee}>
                      <User size={12} />
                      {task.assignee}
                    </span>
                  ) : (
                    <span className={styles.unassigned}>Unassigned</span>
                  )}
                </td>
                <td className={styles.td}>
                  {task.dueDate ? (
                    <span className={styles.dueDate}>
                      <Calendar size={12} />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  ) : (
                    <span className={styles.noDate}>—</span>
                  )}
                </td>
                <td className={styles.td}>
                  <div className={styles.tagList}>
                    {task.tags &&
                      task.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    {task.tags && task.tags.length > 3 && (
                      <span className={styles.moreTags}>+{task.tags.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          })}
        </tbody>
      </table>
    </div>
  )
}

function groupByStatus(tasks: Task[]): [TaskStatus, Task[]][] {
  const statuses: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'done']
  return statuses.map((status) => [status, tasks.filter((t) => t.status === status)])
}
