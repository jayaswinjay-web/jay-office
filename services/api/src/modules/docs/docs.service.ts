import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../lib/db'
import { documents } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const docsService = {
  async list(userId: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    const rows = await db
      .select()
      .from(documents)
      .where(and(eq(documents.workspaceId, workspaceId), eq(documents.ownerId, userId)))
      .orderBy(desc(documents.updatedAt))
    return rows
  },

  async get(id: string) {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id))
    return doc ?? null
  },

  async create(userId: string, title?: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [doc] = await db
      .insert(documents)
      .values({
        title: title && typeof title === 'string' ? title : 'Untitled Document',
        workspaceId,
        ownerId: userId,
      })
      .returning()
    return doc
  },

  async update(id: string, updates: { title?: string; content?: string | null }) {
    const setData: Record<string, unknown> = { updatedAt: new Date() }
    if (updates.title !== undefined) {
      setData.title = updates.title
      setData.version = sql`version + 1`
    }
    if (updates.content !== undefined) {
      setData.content = updates.content
      setData.version = sql`version + 1`
    }
    const [doc] = await db.update(documents).set(setData).where(eq(documents.id, id)).returning()
    return doc ?? null
  },

  async delete(id: string) {
    await db.delete(documents).where(eq(documents.id, id))
  },
}
