import { eq, and, desc, lt } from 'drizzle-orm'
import { db } from '../../lib/db'
import { chatChannels, chatMessages, users } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const chatService = {
  async listChannels(userId: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    return db.select().from(chatChannels).where(eq(chatChannels.workspaceId, workspaceId))
  },

  async createChannel(userId: string, name: string, description?: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '')
    const [channel] = await db
      .insert(chatChannels)
      .values({ name: sanitized, description: description ?? null, workspaceId, memberCount: 1 })
      .returning()
    return channel
  },

  async listMessages(channelId: string, before?: string) {
    const conditions = [eq(chatMessages.channelId, channelId)]
    if (before) {
      conditions.push(lt(chatMessages.createdAt, new Date(before)))
    }
    return db
      .select()
      .from(chatMessages)
      .where(and(...conditions))
      .orderBy(desc(chatMessages.createdAt))
  },

  async sendMessage(userId: string, channelId: string, body: string, threadId?: string) {
    const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1)
    const userName = user?.name ?? 'Unknown'
    const [message] = await db
      .insert(chatMessages)
      .values({ channelId, body, userId, userName, threadId: threadId ?? null })
      .returning()
    return message
  },

  async addReaction(userId: string, _channelId: string, messageId: string, emoji: string) {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, messageId))
    if (!message) return null
    const reactions = (message.reactions ?? []) as Array<{ emoji: string; userIds: string[] }>
    const existing = reactions.find((r: { emoji: string }) => r.emoji === emoji)
    if (existing) {
      const idx = existing.userIds.indexOf(userId)
      if (idx >= 0) existing.userIds.splice(idx, 1)
      else existing.userIds.push(userId)
    } else {
      reactions.push({ emoji, userIds: [userId] })
    }
    const [updated] = await db
      .update(chatMessages)
      .set({ reactions })
      .where(eq(chatMessages.id, messageId))
      .returning()
    return updated
  },
}
