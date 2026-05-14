import { api } from '@/platform/api'

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee: string | null
  dueDate: string | null
  startDate: string | null
  tags: string[]
  order: number
}

export interface TasksResponse {
  tasks: Task[]
  total: number
}

export interface TaskResponse {
  task: Task
}

export async function listTasks(params?: {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
}): Promise<TasksResponse> {
  const qs = params
    ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''
  return api.get<TasksResponse>(`/tasks${qs ? `?${qs}` : ''}`)
}

export async function getTask(id: string): Promise<TaskResponse> {
  return api.get<TaskResponse>(`/tasks/${id}`)
}

export async function createTask(data: Omit<Task, 'id'>): Promise<TaskResponse> {
  return api.post<TaskResponse>('/tasks', data)
}

export async function updateTask(id: string, data: Partial<Task>): Promise<TaskResponse> {
  return api.patch<TaskResponse>(`/tasks/${id}`, data)
}

export async function deleteTask(id: string): Promise<void> {
  return api.delete<void>(`/tasks/${id}`)
}

export async function reorderTasks(updates: { id: string; order: number }[]): Promise<void> {
  return api.post<void>('/tasks/reorder', { updates })
}
