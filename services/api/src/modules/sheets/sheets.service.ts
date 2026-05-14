import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../lib/db'
import { sheets } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const sheetsService = {
  async list(userId: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    return db.select().from(sheets).where(and(eq(sheets.workspaceId, workspaceId), eq(sheets.ownerId, userId))).orderBy(desc(sheets.updatedAt))
  },

  async get(id: string) {
    const [sheet] = await db.select().from(sheets).where(eq(sheets.id, id))
    return sheet ?? null
  },

  async create(userId: string, title?: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [sheet] = await db
      .insert(sheets)
      .values({
        title: title && typeof title === 'string' ? title : 'Untitled Spreadsheet',
        workspaceId,
        ownerId: userId,
      })
      .returning()
    return sheet
  },

  async update(id: string, title?: string) {
    const [sheet] = await db.update(sheets).set({ title, updatedAt: new Date() }).where(eq(sheets.id, id)).returning()
    return sheet ?? null
  },

  async delete(id: string) {
    await db.delete(sheets).where(eq(sheets.id, id))
  },
}
