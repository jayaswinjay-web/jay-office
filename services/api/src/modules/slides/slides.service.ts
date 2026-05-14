import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../lib/db'
import { slides } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const slidesService = {
  async list(userId: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    return db.select().from(slides).where(and(eq(slides.workspaceId, workspaceId), eq(slides.ownerId, userId))).orderBy(desc(slides.updatedAt))
  },

  async get(id: string) {
    const [slide] = await db.select().from(slides).where(eq(slides.id, id))
    return slide ?? null
  },

  async create(userId: string, title: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [slide] = await db
      .insert(slides)
      .values({ title, workspaceId, ownerId: userId })
      .returning()
    return slide
  },

  async update(id: string, updates: { title?: string; content?: string | null }) {
    const setData: Record<string, unknown> = { updatedAt: new Date() }
    if (updates.title !== undefined) setData.title = updates.title
    if (updates.content !== undefined) setData.content = updates.content
    const [slide] = await db.update(slides).set(setData).where(eq(slides.id, id)).returning()
    return slide ?? null
  },

  async delete(id: string) {
    await db.delete(slides).where(eq(slides.id, id))
  },

  async duplicate(userId: string, id: string) {
    const source = await this.get(id)
    if (!source) return null
    const workspaceId = await resolveUserWorkspace(userId)
    const [slide] = await db
      .insert(slides)
      .values({
        title: `${source.title} (Copy)`,
        content: source.content,
        workspaceId,
        ownerId: userId,
      })
      .returning()
    return slide
  },
}
