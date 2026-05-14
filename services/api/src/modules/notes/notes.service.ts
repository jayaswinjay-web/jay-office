import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../lib/db'
import { notes } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const notesService = {
  async list(userId: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    return db.select().from(notes).where(and(eq(notes.workspaceId, workspaceId), eq(notes.ownerId, userId))).orderBy(desc(notes.updatedAt))
  },

  async get(id: string) {
    const [note] = await db.select().from(notes).where(eq(notes.id, id))
    return note ?? null
  },

  async create(userId: string, title?: string, parentId?: string | null) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [note] = await db
      .insert(notes)
      .values({
        title: title && typeof title === 'string' ? title : 'Untitled Note',
        workspaceId,
        ownerId: userId,
        parentId: parentId ?? null,
      })
      .returning()
    return note
  },

  async update(id: string, updates: { title?: string; content?: string | null }) {
    const setData: Record<string, unknown> = { updatedAt: new Date() }
    if (updates.title !== undefined) setData.title = updates.title
    if (updates.content !== undefined) setData.content = updates.content
    const [note] = await db.update(notes).set(setData).where(eq(notes.id, id)).returning()
    return note ?? null
  },

  async delete(id: string) {
    await db.delete(notes).where(eq(notes.id, id))
  },
}
