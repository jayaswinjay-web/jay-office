import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { docsService } from './docs.service'

export async function docsRoutes(fastify: FastifyInstance) {
  fastify.get('/docs', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest) => {
    const docs = await docsService.list(request.user.id)
    return { docs }
  })

  fastify.post<{ Body: { title?: string } }>(
    '/docs',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title?: string } }>, reply: FastifyReply) => {
      const { title } = request.body
      const doc = await docsService.create(request.user.id, title)
      return reply.code(201).send({ doc })
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/docs/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params
      const doc = await docsService.get(id)
      if (!doc) {
        return reply.code(404).send({ error: 'Document not found' })
      }
      return { doc }
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { title?: string; content?: string | null } }>(
    '/docs/:id',
    { preHandler: [fastify.authenticate] },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; content?: string | null } }>,
      reply: FastifyReply,
    ) => {
      const { id } = request.params
      const doc = await docsService.update(id, request.body)
      if (!doc) {
        return reply.code(404).send({ error: 'Document not found' })
      }
      return { doc }
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/docs/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params
      const existing = await docsService.get(id)
      if (!existing) {
        return reply.code(404).send({ error: 'Document not found' })
      }
      await docsService.delete(id)
      return reply.code(204).send()
    },
  )
}
