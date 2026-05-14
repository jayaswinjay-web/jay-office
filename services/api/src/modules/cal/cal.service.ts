import { eq, and, desc, between } from 'drizzle-orm'
import { db } from '../../lib/db'
import { calEvents } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const calService = {
  async list(userId: string, startDate: string, endDate: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return db
      .select()
      .from(calEvents)
      .where(and(eq(calEvents.workspaceId, workspaceId), eq(calEvents.ownerId, userId), between(calEvents.startDate, start, end)))
      .orderBy(desc(calEvents.startDate))
  },

  async get(id: string) {
    const [event] = await db.select().from(calEvents).where(eq(calEvents.id, id))
    return event ?? null
  },

  async create(userId: string, data: { title: string; description?: string; startDate: string; endDate: string; location?: string; color?: string; isAllDay?: boolean }) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [event] = await db
      .insert(calEvents)
      .values({
        title: data.title,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location ?? null,
        color: data.color ?? '#3b82f6',
        isAllDay: data.isAllDay ?? false,
        workspaceId,
        ownerId: userId,
      })
      .returning()
    return event
  },

  async update(id: string, updates: { title?: string; description?: string | null; startDate?: string; endDate?: string; location?: string | null; color?: string; isAllDay?: boolean }) {
    const setData: Record<string, unknown> = { updatedAt: new Date() }
    if (updates.title !== undefined) setData.title = updates.title
    if (updates.description !== undefined) setData.description = updates.description
    if (updates.startDate !== undefined) setData.startDate = new Date(updates.startDate)
    if (updates.endDate !== undefined) setData.endDate = new Date(updates.endDate)
    if (updates.location !== undefined) setData.location = updates.location
    if (updates.color !== undefined) setData.color = updates.color
    if (updates.isAllDay !== undefined) setData.isAllDay = updates.isAllDay
    const [event] = await db.update(calEvents).set(setData).where(eq(calEvents.id, id)).returning()
    return event ?? null
  },

  async delete(id: string) {
    await db.delete(calEvents).where(eq(calEvents.id, id))
  },
}
