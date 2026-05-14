import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { slidesService } from './slides.service'

async function slidesRoutes(fastify: FastifyInstance) {
  fastify.get('/slides', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest) => {
    const all = await slidesService.list(request.user.id)
    return { slides: all }
  })

  fastify.get<{ Params: { id: string } }>(
    '/slides/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const slide = await slidesService.get(request.params.id)
      if (!slide) return reply.status(404).send({ error: 'Slide not found' })
      return { slide }
    },
  )

  fastify.post<{ Body: { title: string } }>(
    '/slides',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title: string } }>, reply: FastifyReply) => {
      const slide = await slidesService.create(request.user.id, request.body.title)
      return reply.status(201).send({ slide })
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { title?: string; content?: string | null } }>(
    '/slides/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; content?: string | null } }>, reply: FastifyReply) => {
      const slide = await slidesService.update(request.params.id, request.body)
      if (!slide) return reply.status(404).send({ error: 'Slide not found' })
      return { slide }
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/slides/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const existing = await slidesService.get(request.params.id)
      if (!existing) return reply.status(404).send({ error: 'Slide not found' })
      await slidesService.delete(request.params.id)
      return reply.status(204).send()
    },
  )

  fastify.post<{ Params: { id: string } }>(
    '/slides/:id/duplicate',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const slide = await slidesService.duplicate(request.user.id, request.params.id)
      if (!slide) return reply.status(404).send({ error: 'Slide not found' })
      return reply.status(201).send({ slide })
    },
  )
}

export default slidesRoutes
