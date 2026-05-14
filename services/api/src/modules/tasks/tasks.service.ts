import { eq, and, desc, like, sql } from 'drizzle-orm'
import { db } from '../../lib/db'
import { tasks } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const tasksService = {
  async list(userId: string, params: { status?: string; priority?: string; search?: string }) {
    const workspaceId = await resolveUserWorkspace(userId)
    const conditions = [eq(tasks.workspaceId, workspaceId), eq(tasks.creatorId, userId)]

    if (params.status) conditions.push(eq(tasks.status, params.status))
    if (params.priority) conditions.push(eq(tasks.priority, params.priority))
    if (params.search) {
      const q = `%${params.search.toLowerCase()}%`
      conditions.push(like(sql`LOWER(${tasks.title})`, q))
    }

    const rows = await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt))
    return rows
  },

  async get(id: string) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id))
    return task ?? null
  },

  async create(userId: string, data: {
    title: string
    description?: string | null
    status?: string
    priority?: string
    assigneeId?: string | null
    dueDate?: string | null
  }) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [task] = await db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description ?? null,
        workspaceId,
        creatorId: userId,
        assigneeId: data.assigneeId ?? null,
        status: data.status ?? 'todo',
        priority: data.priority ?? 'p3',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      })
      .returning()
    return task
  },

  async update(id: string, updates: {
    title?: string
    description?: string | null
    status?: string
    priority?: string
    assigneeId?: string | null
    dueDate?: string | null
  }) {
    const setData: Record<string, unknown> = { updatedAt: new Date() }
    if (updates.title !== undefined) setData.title = updates.title
    if (updates.description !== undefined) setData.description = updates.description
    if (updates.status !== undefined) setData.status = updates.status
    if (updates.priority !== undefined) setData.priority = updates.priority
    if (updates.assigneeId !== undefined) setData.assigneeId = updates.assigneeId
    if (updates.dueDate !== undefined) setData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null
    const [task] = await db.update(tasks).set(setData).where(eq(tasks.id, id)).returning()
    return task ?? null
  },

  async delete(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id))
  },
}
