import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from './tasks.service'
import styles from './KanbanBoard.module.css'

interface KanbanBoardProps {
  tasks: Task[]
  onDragTask: (taskId: string, newStatus: TaskStatus) => void
  onSelectTask: (task: Task) => void
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'review', label: 'Review' },
  { status: 'done', label: 'Done' },
]

export function KanbanBoard({ tasks, onDragTask, onSelectTask }: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dropTargetStatus, setDropTargetStatus] = useState<TaskStatus | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    setDropTargetStatus(status)
  }

  const handleDragLeave = () => {
    setDropTargetStatus(null)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    if (draggedTaskId) {
      onDragTask(draggedTaskId, status)
    }
    setDraggedTaskId(null)
    setDropTargetStatus(null)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDropTargetStatus(null)
  }

  return (
    <div className={styles.board}>
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status)
        const isDropTarget = dropTargetStatus === column.status

        return (
          <div
            key={column.status}
            className={`${styles.column} ${isDropTarget ? styles.columnDropTarget : ''}`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{column.label}</span>
              <span className={styles.columnCount}>{columnTasks.length}</span>
            </div>
            <div className={styles.columnBody}>
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDragging={draggedTaskId === task.id}
                  onSelect={onSelectTask}
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
              <button className={styles.addColumnButton}>
                <Plus size={16} />
                Add Task
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
