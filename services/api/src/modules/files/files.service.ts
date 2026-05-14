import { eq, and, like, isNull, desc } from 'drizzle-orm'
import { db } from '../../lib/db'
import { files, folders } from '@jay/schema'
import { s3, BUCKET } from '../../lib/s3'
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { generateId } from '@jay/utils'
import { resolveUserWorkspace } from '../workspace/workspace.service'

export const filesService = {
  async listFiles(userId: string, params: { folderId?: string; search?: string; starred?: boolean; trashed?: boolean }) {
    const workspaceId = await resolveUserWorkspace(userId)
    const conditions = [eq(files.workspaceId, workspaceId), eq(files.ownerId, userId)]
    if (params.folderId) conditions.push(eq(files.folderId, params.folderId))
    else conditions.push(isNull(files.folderId))
    if (params.search) conditions.push(like(files.name, `%${params.search}%`))
    if (params.starred) conditions.push(eq(files.starred, true))
    if (params.trashed) conditions.push(eq(files.trashed, true))
    else conditions.push(eq(files.trashed, false))
    return db.select().from(files).where(and(...conditions)).orderBy(desc(files.updatedAt))
  },

  async getFile(id: string) {
    const [file] = await db.select().from(files).where(eq(files.id, id))
    return file ?? null
  },

  async uploadFile(userId: string, data: { file: NodeJS.ReadableStream; filename: string; mimetype: string; toBuffer: () => Promise<Buffer> }, folderId: string | null) {
    const workspaceId = await resolveUserWorkspace(userId)
    const buffer = await data.toBuffer()
    const key = `${generateId()}-${data.filename}`
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: data.mimetype }))
    const [file] = await db.insert(files).values({
      name: data.filename, mimeType: data.mimetype, size: buffer.length,
      key, workspaceId, ownerId: userId, folderId,
    }).returning()
    return file
  },

  async softDelete(id: string) { await db.update(files).set({ trashed: true, trashedAt: new Date() }).where(eq(files.id, id)) },
  async restore(id: string) { await db.update(files).set({ trashed: false, trashedAt: null }).where(eq(files.id, id)) },

  async permanentDelete(id: string) {
    const [file] = await db.select().from(files).where(eq(files.id, id))
    if (!file) return
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: file.key }))
    await db.delete(files).where(eq(files.id, id))
  },

  async updateFile(id: string, updates: { name?: string; folderId?: string | null; starred?: boolean }) {
    const [file] = await db.update(files).set(updates).where(eq(files.id, id)).returning()
    return file
  },

  async getDownloadUrl(id: string) {
    const [file] = await db.select().from(files).where(eq(files.id, id))
    if (!file) return null
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: file.key })
    return getSignedUrl(s3, command, { expiresIn: 3600 })
  },

  async createFolder(userId: string, name: string, parentId: string | null) {
    const workspaceId = await resolveUserWorkspace(userId)
    const [folder] = await db.insert(folders).values({ name, workspaceId, ownerId: userId, parentId }).returning()
    return folder
  },

  async listFolders(userId: string) {
    const workspaceId = await resolveUserWorkspace(userId)
    return db.select().from(folders).where(eq(folders.workspaceId, workspaceId)).orderBy(folders.name)
  },
}
