import { eq } from 'drizzle-orm'
import { db } from '../../lib/db'
import { shareLinks } from '@jay/schema'

export const shareService = {
  async create(resourceId: string, role: string, userId?: string) {
    const [link] = await db
      .insert(shareLinks)
      .values({ resourceId, role, resourceType: 'file', createdBy: userId })
      .returning()
    return link
  },

  async listByResource(resourceId: string) {
    return db.select().from(shareLinks).where(eq(shareLinks.resourceId, resourceId))
  },

  async delete(id: string) {
    await db.delete(shareLinks).where(eq(shareLinks.id, id))
  },

  async createLink(resourceId: string, role: string, expiresAt?: string, userId?: string) {
    const [link] = await db
      .insert(shareLinks)
      .values({
        resourceId,
        resourceType: 'file',
        role,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: userId,
      })
      .returning()
    return link
  },
}
