import { useState } from 'react'
import { Button } from '@/design-system'
import { X, Calendar, Flag, User, Tag, Trash2 } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority } from './tasks.service'
import styles from './TaskDetail.module.css'

const priorityColors: Record<TaskPriority, string> = {
  P1: '#ef4444',
  P2: '#f97316',
  P3: '#3b82f6',
  P4: '#6b7280',
}

interface TaskDetailProps {
  task: Task
  onClose: () => void
  onUpdate: (id: string, data: Partial<Task>) => void
  onDelete: (id: string) => void
}

export function TaskDetail({ task, onClose, onUpdate, onDelete }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [assignee, setAssignee] = useState(task.assignee ?? '')
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')

  const handleSave = () => {
    onUpdate(task.id, {
      title,
      description: description || null,
      status,
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setStatus(task.status)
    setPriority(task.priority)
    setAssignee(task.assignee ?? '')
    setDueDate(task.dueDate ?? '')
    setIsEditing(false)
  }

  const statusSteps: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'done']
  const currentStep = statusSteps.indexOf(task.status)

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Task Details</h2>
          <Button variant="ghost" size="small" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className={styles.panelBody}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.field}>
                <label htmlFor="detail-title">Title</label>
                <input
                  id="detail-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.fieldInput}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="detail-desc">Description</label>
                <textarea
                  id="detail-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.fieldTextarea}
                  rows={4}
                />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="detail-status">Status</label>
                  <select
                    id="detail-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className={styles.fieldSelect}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="detail-priority">Priority</label>
                  <select
                    id="detail-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className={styles.fieldSelect}
                  >
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P4">P4 - Low</option>
                  </select>
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="detail-assignee">Assignee</label>
                  <input
                    id="detail-assignee"
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className={styles.fieldInput}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="detail-due">Due Date</label>
                  <input
                    id="detail-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={styles.fieldInput}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <Button variant="ghost" size="small" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="small" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.viewMode}>
              <div className={styles.statusProgress}>
                {statusSteps.map((step, i) => (
                  <div
                    key={step}
                    className={`${styles.statusStep} ${i <= currentStep ? styles.statusStepComplete : ''}`}
                  >
                    <div className={styles.statusDot} />
                    <span className={styles.statusLabel}>
                      {step.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`${styles.statusLine} ${i < currentStep ? styles.statusLineComplete : ''}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <h3 className={styles.taskTitle}>{task.title}</h3>

              {task.description && <p className={styles.taskDescription}>{task.description}</p>}

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <Flag size={16} style={{ color: priorityColors[task.priority] }} />
                  <div>
                    <span className={styles.metaLabel}>Priority</span>
                    <span className={styles.metaValue}>{task.priority}</span>
                  </div>
                </div>
                {task.assignee && (
                  <div className={styles.metaItem}>
                    <User size={16} />
                    <div>
                      <span className={styles.metaLabel}>Assignee</span>
                      <span className={styles.metaValue}>{task.assignee}</span>
                    </div>
                  </div>
                )}
                {task.dueDate && (
                  <div className={styles.metaItem}>
                    <Calendar size={16} />
                    <div>
                      <span className={styles.metaLabel}>Due</span>
                      <span className={styles.metaValue}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className={styles.metaItem}>
                    <Tag size={16} />
                    <div>
                      <span className={styles.metaLabel}>Tags</span>
                      <div className={styles.tagList}>
                        {task.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.panelFooter}>
          {!isEditing && (
            <>
              <Button variant="ghost" size="small" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" size="small" onClick={() => onDelete(task.id)}>
                <Trash2 size={16} />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
