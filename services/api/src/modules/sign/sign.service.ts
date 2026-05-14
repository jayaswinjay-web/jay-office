import { eq, or } from 'drizzle-orm'
import { db } from '../../lib/db'
import { signRequests, users } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const signService = {
  async list(userId: string) {
    await resolveUserWorkspace(userId)
    const [user] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, userId)).limit(1)
    return db.select().from(signRequests).where(or(eq(signRequests.senderName, user?.name ?? ''), eq(signRequests.signerEmail, user?.email ?? '')))
  },

  async get(id: string) {
    const [req] = await db.select().from(signRequests).where(eq(signRequests.id, id))
    return req ?? null
  },

  async create(userId: string, data: { documentId: string; documentName?: string; signerEmail: string; signerName: string }) {
    await resolveUserWorkspace(userId)
    const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1)
    const [req] = await db.insert(signRequests).values({
      documentId: data.documentId,
      documentName: data.documentName ?? 'Untitled Document',
      signerEmail: data.signerEmail,
      signerName: data.signerName,
      senderName: user?.name ?? 'User',
    }).returning()
    return req
  },

  async sign(id: string, fields: Array<{ id: string; value: string }>) {
    const req = await this.get(id)
    if (!req) return null
    const existingFields = (req.fields ?? []) as Array<{ id: string; type: string; page: number; x: number; y: number; width: number; height: number; value?: string }>
    for (const update of fields) {
      const f = existingFields.find((ef: { id: string }) => ef.id === update.id)
      if (f) f.value = update.value
    }
    const [updated] = await db.update(signRequests).set({ fields: existingFields, status: 'signed', signedAt: new Date() }).where(eq(signRequests.id, id)).returning()
    return updated
  },

  async decline(id: string, reason?: string) {
    const [updated] = await db.update(signRequests).set({ status: 'declined', declineReason: reason ?? null }).where(eq(signRequests.id, id)).returning()
    return updated ?? null
  },
}
