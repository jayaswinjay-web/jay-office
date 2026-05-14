import { eq } from 'drizzle-orm'
import { db } from '../../lib/db'
import { meetings } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const meetService = {
  async list(userId: string) {
    await resolveUserWorkspace(userId)
    return db.select().from(meetings).where(eq(meetings.hostId, userId))
  },

  async get(id: string) {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id))
    return meeting ?? null
  },

  async create(userId: string, title: string) {
    const [meeting] = await db
      .insert(meetings)
      .values({ title, hostId: userId, participants: [{ userId, name: 'Host', joinedAt: new Date().toISOString() }] })
      .returning()
    return meeting
  },

  async join(userId: string, meetingId: string) {
    const meeting = await this.get(meetingId)
    if (!meeting) return null
    const participants = (meeting.participants ?? []) as Array<{ userId: string; name: string; joinedAt: string }>
    if (!participants.find((p: { userId: string }) => p.userId === userId)) {
      participants.push({ userId, name: 'User', joinedAt: new Date().toISOString() })
    }
    const [updated] = await db.update(meetings).set({ participants }).where(eq(meetings.id, meetingId)).returning()
    return updated
  },

  async leave(userId: string, meetingId: string) {
    const meeting = await this.get(meetingId)
    if (!meeting) return null
    const participants = (meeting.participants ?? []) as Array<{ userId: string; name: string; joinedAt: string; leftAt?: string }>
    if (meeting.hostId === userId) {
      const ended = new Date().toISOString()
      await db.update(meetings).set({ endedAt: new Date(), participants: participants.map((p: { userId: string; name: string; joinedAt: string }) => ({ ...p, leftAt: ended })) }).where(eq(meetings.id, meetingId))
    } else {
      await db.update(meetings).set({ participants: participants.map((p: { userId: string; name: string; joinedAt: string }) => p.userId === userId ? { ...p, leftAt: new Date().toISOString() } : p) }).where(eq(meetings.id, meetingId))
    }
    return this.get(meetingId)
  },
}
