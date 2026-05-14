import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../lib/db'
import { forms, formResponses } from '@jay/schema'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const formsService = {
  async list(userId: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    return db.select().from(forms).where(and(eq(forms.workspaceId, workspaceId), eq(forms.ownerId, userId))).orderBy(desc(forms.createdAt))
  },

  async get(id: string) {
    const [form] = await db.select().from(forms).where(eq(forms.id, id))
    return form ?? null
  },

  async create(userId: string, title: string, description?: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [form] = await db.insert(forms).values({ title, description: description ?? null, workspaceId, ownerId: userId }).returning()
    return form
  },

  async update(id: string, updates: { title?: string; description?: string | null; status?: string; questions?: unknown }) {
    const setData: Record<string, unknown> = {}
    if (updates.title !== undefined) setData.title = updates.title
    if (updates.description !== undefined) setData.description = updates.description
    if (updates.status !== undefined) setData.status = updates.status
    if (updates.questions !== undefined) setData.questions = updates.questions
    const [form] = await db.update(forms).set(setData).where(eq(forms.id, id)).returning()
    return form ?? null
  },

  async submitResponse(formId: string, answers: Record<string, string>) {
    const [response] = await db.insert(formResponses).values({ formId, answers }).returning()
    const all = await db.select({ count: sql<number>`count(*)` }).from(formResponses).where(eq(formResponses.formId, formId))
    await db.update(forms).set({ responseCount: all[0]?.count ?? 0 }).where(eq(forms.id, formId))
    return response
  },

  async getResponses(formId: string) {
    return db.select().from(formResponses).where(eq(formResponses.formId, formId)).orderBy(desc(formResponses.submittedAt))
  },
}
