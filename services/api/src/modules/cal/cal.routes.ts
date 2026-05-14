import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { calService } from './cal.service'

async function calRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { startDate: string; endDate: string } }>(
    '/cal/events',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Querystring: { startDate: string; endDate: string } }>) => {
      const { startDate, endDate } = request.query
      const events = await calService.list(request.user.id, startDate, endDate)
      return { events }
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/cal/events/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const event = await calService.get(request.params.id)
      if (!event) return reply.status(404).send({ error: 'Event not found' })
      return { event }
    },
  )

  fastify.post<{ Body: { title: string; description?: string; startDate: string; endDate: string; location?: string; color?: string; isAllDay?: boolean } }>(
    '/cal/events',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title: string; description?: string; startDate: string; endDate: string; location?: string; color?: string; isAllDay?: boolean } }>, reply: FastifyReply) => {
      const event = await calService.create(request.user.id, request.body)
      return reply.status(201).send({ event })
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { title?: string; description?: string | null; startDate?: string; endDate?: string; location?: string | null; color?: string; isAllDay?: boolean } }>(
    '/cal/events/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; description?: string | null; startDate?: string; endDate?: string; location?: string | null; color?: string; isAllDay?: boolean } }>, reply: FastifyReply) => {
      const event = await calService.update(request.params.id, request.body)
      if (!event) return reply.status(404).send({ error: 'Event not found' })
      return { event }
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/cal/events/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const existing = await calService.get(request.params.id)
      if (!existing) return reply.status(404).send({ error: 'Event not found' })
      await calService.delete(request.params.id)
      return reply.status(204).send()
    },
  )
}

export default calRoutes
