import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { sheetsService } from './sheets.service'

export async function sheetsRoutes(fastify: FastifyInstance) {
  fastify.get('/sheets', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest) => {
    const all = await sheetsService.list(request.user.id)
    return { spreadsheets: all }
  })

  fastify.post<{ Body: { title?: string } }>(
    '/sheets',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title?: string } }>, reply: FastifyReply) => {
      const sheet = await sheetsService.create(request.user.id, request.body.title)
      return reply.code(201).send({ spreadsheet: sheet })
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/sheets/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const sheet = await sheetsService.get(request.params.id)
      if (!sheet) return reply.code(404).send({ error: 'Spreadsheet not found' })
      return { spreadsheet: sheet }
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { title?: string } }>(
    '/sheets/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { title?: string } }>, reply: FastifyReply) => {
      const { title } = request.body
      if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
        return reply.code(400).send({ error: 'Title cannot be empty' })
      }
      const sheet = await sheetsService.update(request.params.id, title)
      if (!sheet) return reply.code(404).send({ error: 'Spreadsheet not found' })
      return { spreadsheet: sheet }
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/sheets/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const existing = await sheetsService.get(request.params.id)
      if (!existing) return reply.code(404).send({ error: 'Spreadsheet not found' })
      await sheetsService.delete(request.params.id)
      return reply.code(204).send()
    },
  )
}
