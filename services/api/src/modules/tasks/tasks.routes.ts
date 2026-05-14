import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { tasksService } from './tasks.service'

async function tasksRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { status?: string; priority?: string; search?: string } }>(
    '/tasks',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Querystring: { status?: string; priority?: string; search?: string } }>) => {
      const rows = await tasksService.list(request.user.id, request.query)
      return { tasks: rows, total: rows.length }
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/tasks/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const task = await tasksService.get(request.params.id)
      if (!task) return reply.status(404).send({ error: 'Task not found' })
      return { task }
    },
  )

  fastify.post<{ Body: { title: string; description?: string; status?: string; priority?: string } }>(
    '/tasks',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title: string; description?: string; status?: string; priority?: string } }>, reply: FastifyReply) => {
      const task = await tasksService.create(request.user.id, request.body)
      return reply.status(201).send({ task })
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { title?: string; description?: string | null; status?: string; priority?: string } }>(
    '/tasks/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; description?: string | null; status?: string; priority?: string } }>, reply: FastifyReply) => {
      const task = await tasksService.update(request.params.id, request.body)
      if (!task) return reply.status(404).send({ error: 'Task not found' })
      return { task }
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/tasks/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const existing = await tasksService.get(request.params.id)
      if (!existing) return reply.status(404).send({ error: 'Task not found' })
      await tasksService.delete(request.params.id)
      return reply.status(204).send()
    },
  )
}

export default tasksRoutes
