import { eq, desc, and } from 'drizzle-orm'
import { db } from '../../lib/db'
import { notifications } from '@jay/schema'

export const notificationService = {
  async list(userId: string) {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
    const unreadCount = rows.filter((n) => !n.read).length
    return { notifications: rows, unreadCount }
  },

  async markRead(userId: string, id: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    return { success: true }
  },

  async markAllRead(userId: string) {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId))
    return { success: true }
  },
}
