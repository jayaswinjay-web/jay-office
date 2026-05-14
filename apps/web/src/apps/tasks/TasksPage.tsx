import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Tabs, TabsList, TabsTrigger } from '@/design-system'
import { Plus, Search } from 'lucide-react'
import { KanbanBoard } from './KanbanBoard'
import { TaskList } from './TaskList'
import { GanttChart } from './GanttChart'
import { TaskDetail } from './TaskDetail'
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from './tasks.service'
import styles from './TasksPage.module.css'

type TaskView = 'list' | 'kanban' | 'gantt'

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<TaskView>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listTasks({
        status: filterStatus === 'all' ? undefined : filterStatus,
        priority: filterPriority === 'all' ? undefined : filterPriority,
        search: searchQuery || undefined,
      })
      setTasks(result.tasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterPriority, searchQuery])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleCreateTask = async (data: Omit<Task, 'id'>) => {
    try {
      const result = await createTask(data)
      setTasks((prev) => [...prev, result.task])
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (id: string, data: Partial<Task>) => {
    try {
      const result = await updateTask(id, data)
      setTasks((prev) => prev.map((t) => (t.id === id ? result.task : t)))
      if (selectedTask?.id === id) {
        setSelectedTask(result.task)
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      if (selectedTask?.id === id) setSelectedTask(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleDragTask = async (taskId: string, newStatus: TaskStatus) => {
    await handleUpdateTask(taskId, { status: newStatus })
  }

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q)
    }
    return true
  })

  const viewTabs = [
    { id: 'list', label: 'List' },
    { id: 'kanban', label: 'Kanban' },
    { id: 'gantt', label: 'Gantt' },
  ]

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Tasks</h1>
           <Tabs value={view} onValueChange={(id: string) => setView(id as TaskView)}>
             <TabsList>
               {viewTabs.map((t) => (
                 <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
               ))}
             </TabsList>
           </Tabs>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">All Priority</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} />
            New Task
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <p>Loading tasks...</p>
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            onDragTask={handleDragTask}
            onSelectTask={setSelectedTask}
          />
        ) : view === 'list' ? (
          <TaskList
            tasks={filteredTasks}
            onSelectTask={setSelectedTask}
            onUpdateTask={handleUpdateTask}
          />
        ) : (
          <GanttChart tasks={filteredTasks} onSelectTask={setSelectedTask} />
        )}
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {showCreateDialog && (
        <CreateTaskDialog onClose={() => setShowCreateDialog(false)} onCreate={handleCreateTask} />
      )}
    </div>
  )
}

interface CreateTaskDialogProps {
  onClose: () => void
  onCreate: (data: Omit<Task, 'id'>) => void
}

function CreateTaskDialog({ onClose, onCreate }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('P3')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({
      title,
      description: description || null,
      status,
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null,
      startDate: new Date().toISOString().split('T')[0] ?? null,
      tags: tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      order: 0,
    })
  }

  return (
    <div
      className={styles.dialogOverlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className={styles.dialog} onSubmit={handleSubmit}>
        <h2 className={styles.dialogTitle}>Create New Task</h2>
        <div className={styles.dialogField}>
          <label htmlFor="task-title">Title</label>
          <Input
            id="task-title"
            value={title}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Task title"
          />
        </div>
        <div className={styles.dialogField}>
          <label htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task..."
            className={styles.dialogTextarea}
            rows={3}
          />
        </div>
        <div className={styles.dialogRow}>
          <div className={styles.dialogField}>
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={styles.dialogSelect}
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className={styles.dialogField}>
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className={styles.dialogSelect}
            >
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>
        </div>
        <div className={styles.dialogRow}>
          <div className={styles.dialogField}>
            <label htmlFor="task-assignee">Assignee</label>
            <Input
              id="task-assignee"
              value={assignee}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignee(e.target.value)}
              placeholder="Assignee name"
            />
          </div>
          <div className={styles.dialogField}>
            <label htmlFor="task-due">Due Date</label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={styles.dialogDateInput}
            />
          </div>
        </div>
        <div className={styles.dialogField}>
          <label htmlFor="task-tags">Tags (comma-separated)</label>
          <Input
            id="task-tags"
            value={tags}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            placeholder="frontend, bug, urgent"
          />
        </div>
        <div className={styles.dialogActions}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </div>
  )
}
