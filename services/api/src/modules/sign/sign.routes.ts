import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { signService } from './sign.service'

export async function signRoutes(fastify: FastifyInstance) {
  fastify.get('/sign/requests', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest) => {
    const requests = await signService.list(request.user.id)
    return { requests }
  })

  fastify.post<{ Body: { documentId: string; documentName?: string; signers: Array<{ email: string; name: string }> } }>(
    '/sign/requests',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { documentId: string; documentName?: string; signers: Array<{ email: string; name: string }> } }>, reply: FastifyReply) => {
      if (!request.body.documentId) return reply.code(400).send({ message: 'Document ID is required' })
      if (!request.body.signers || !Array.isArray(request.body.signers) || request.body.signers.length === 0) {
        return reply.code(400).send({ message: 'At least one signer is required' })
      }
      const created = await Promise.all(
        request.body.signers.map((s) =>
          signService.create(request.user.id, { documentId: request.body.documentId, documentName: request.body.documentName, signerEmail: s.email, signerName: s.name })
        ),
      )
      return reply.code(201).send({ requests: created, request: created[0] ?? null })
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/sign/requests/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const signReq = await signService.get(request.params.id)
      if (!signReq) return reply.code(404).send({ message: 'Signature request not found' })
      return { request: signReq }
    },
  )

  fastify.post<{ Params: { id: string }; Body: { fields: Array<{ id: string; value: string }> } }>(
    '/sign/requests/:id/sign',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { fields: Array<{ id: string; value: string }> } }>, reply: FastifyReply) => {
      const signReq = await signService.sign(request.params.id, request.body.fields)
      if (!signReq) return reply.code(404).send({ message: 'Signature request not found' })
      return { request: signReq }
    },
  )

  fastify.post<{ Params: { id: string }; Body: { reason?: string } }>(
    '/sign/requests/:id/decline',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { reason?: string } }>, reply: FastifyReply) => {
      const signReq = await signService.decline(request.params.id, request.body.reason)
      if (!signReq) return reply.code(404).send({ message: 'Signature request not found' })
      return { request: signReq }
    },
  )
}
