import { FastifyInstance, FastifyRequest } from 'fastify'
import { filesService } from './files.service'

interface FileParams { id: string }
interface FileQuery { folderId?: string; search?: string; starred?: string; trashed?: string }
interface UpdateFileBody { name?: string; folderId?: string | null; starred?: boolean }
interface CreateFolderBody { name: string; parentId?: string }

interface MultipartRequest extends FastifyRequest {
  file: () => Promise<{
    file: NodeJS.ReadableStream
    filename: string
    mimetype: string
    toBuffer: () => Promise<Buffer>
  } | undefined>
}

export async function filesRoutes(app: FastifyInstance) {
  app.get<{ Querystring: FileQuery }>('/files', { preHandler: [app.authenticate] }, async (req) => {
    const { folderId, search, starred, trashed } = req.query
    const files = await filesService.listFiles(req.user.id, {
      folderId, search, starred: starred === 'true', trashed: trashed === 'true',
    })
    return { files }
  })

  app.get<{ Params: FileParams }>('/files/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const file = await filesService.getFile(req.params.id)
    if (!file) return reply.code(404).send({ message: 'File not found' })
    return { file }
  })

  app.post('/files/upload', { preHandler: [app.authenticate] }, async (req, reply) => {
    const data = await (req as MultipartRequest).file()
    if (!data) return reply.code(400).send({ message: 'No file provided' })
    const folderId = (req.body as Record<string, string> | undefined)?.folderId ?? null
    const file = await filesService.uploadFile(req.user.id, data, folderId)
    return { file }
  })

  app.patch<{ Params: FileParams; Body: UpdateFileBody }>('/files/:id', { preHandler: [app.authenticate] }, async (req) => {
    const file = await filesService.updateFile(req.params.id, req.body)
    return { file }
  })

  app.delete<{ Params: FileParams }>('/files/:id', { preHandler: [app.authenticate] }, async (req) => {
    await filesService.softDelete(req.params.id)
    return { success: true }
  })

  app.post<{ Params: FileParams }>('/files/:id/restore', { preHandler: [app.authenticate] }, async (req) => {
    await filesService.restore(req.params.id)
    return { success: true }
  })

  app.delete<{ Params: FileParams }>('/files/:id/permanent', { preHandler: [app.authenticate] }, async (req) => {
    await filesService.permanentDelete(req.params.id)
    return { success: true }
  })

  app.post<{ Body: CreateFolderBody }>('/folders', { preHandler: [app.authenticate] }, async (req) => {
    const { name, parentId } = req.body
    const folder = await filesService.createFolder(req.user.id, name, parentId ?? null)
    return { folder }
  })

  app.get('/folders', { preHandler: [app.authenticate] }, async (req) => {
    const folderList = await filesService.listFolders(req.user.id)
    return { folders: folderList }
  })
}
