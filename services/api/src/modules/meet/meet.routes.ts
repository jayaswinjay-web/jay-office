import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { meetService } from './meet.service'

export async function meetRoutes(fastify: FastifyInstance) {
  fastify.get('/meet', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest) => {
    const meetings = await meetService.list(request.user.id)
    return { meetings }
  })

  fastify.get<{ Params: { id: string } }>(
    '/meet/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const meeting = await meetService.get(request.params.id)
      if (!meeting) return reply.code(404).send({ message: 'Meeting not found' })
      return { meeting }
    },
  )

  fastify.post<{ Body: { title: string } }>(
    '/meet',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title: string } }>, reply: FastifyReply) => {
      if (!request.body.title) return reply.code(400).send({ message: 'Title is required' })
      const meeting = await meetService.create(request.user.id, request.body.title)
      return reply.code(201).send({ meeting })
    },
  )

  fastify.post<{ Params: { id: string } }>(
    '/meet/:id/join',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const meeting = await meetService.join(request.user.id, request.params.id)
      if (!meeting) return reply.code(404).send({ message: 'Meeting not found' })
      return { meeting }
    },
  )

  fastify.post<{ Params: { id: string } }>(
    '/meet/:id/leave',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const meeting = await meetService.leave(request.user.id, request.params.id)
      if (!meeting) return reply.code(404).send({ message: 'Meeting not found' })
      return { success: true }
    },
  )
}
