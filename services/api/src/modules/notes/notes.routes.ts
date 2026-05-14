import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { notesService } from './notes.service'

export async function notesRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/notes',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest) => {
      const notes = await notesService.list(request.user.id)
      return { notes }
    },
  )

  fastify.post<{ Body: { title?: string; parentId?: string } }>(
    '/notes',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title?: string; parentId?: string } }>, reply: FastifyReply) => {
      const note = await notesService.create(request.user.id, request.body.title, request.body.parentId)
      return reply.code(201).send({ note })
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/notes/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const note = await notesService.get(request.params.id)
      if (!note) return reply.code(404).send({ error: 'Note not found' })
      return { note }
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { title?: string; content?: string | null } }>(
    '/notes/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; content?: string | null } }>, reply: FastifyReply) => {
      const note = await notesService.update(request.params.id, request.body)
      if (!note) return reply.code(404).send({ error: 'Note not found' })
      return { note }
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/notes/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const existing = await notesService.get(request.params.id)
      if (!existing) return reply.code(404).send({ error: 'Note not found' })
      await notesService.delete(request.params.id)
      return reply.code(204).send()
    },
  )
}
