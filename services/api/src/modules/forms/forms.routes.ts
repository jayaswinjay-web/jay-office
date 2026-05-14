import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { formsService } from './forms.service'

export async function formsRoutes(fastify: FastifyInstance) {
  fastify.get('/forms', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest) => {
    const forms = await formsService.list(request.user.id)
    return { forms }
  })

  fastify.post<{ Body: { title: string; description?: string } }>(
    '/forms',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { title: string; description?: string } }>, reply: FastifyReply) => {
      if (!request.body.title) return reply.code(400).send({ message: 'Title is required' })
      const form = await formsService.create(request.user.id, request.body.title, request.body.description)
      return reply.code(201).send({ form })
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/forms/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const form = await formsService.get(request.params.id)
      if (!form) return reply.code(404).send({ message: 'Form not found' })
      return { form }
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { title?: string; description?: string | null; status?: string; questions?: unknown } }>(
    '/forms/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; description?: string | null; status?: string; questions?: unknown } }>, reply: FastifyReply) => {
      const form = await formsService.update(request.params.id, request.body)
      if (!form) return reply.code(404).send({ message: 'Form not found' })
      return { form }
    },
  )

  fastify.post<{ Params: { id: string }; Body: { answers: Record<string, string> } }>(
    '/forms/:id/responses',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { answers: Record<string, string> } }>, reply: FastifyReply) => {
      const response = await formsService.submitResponse(request.params.id, request.body.answers)
      return reply.code(201).send({ response })
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/forms/:id/responses',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const responses = await formsService.getResponses(request.params.id)
      return { responses }
    },
  )
}
