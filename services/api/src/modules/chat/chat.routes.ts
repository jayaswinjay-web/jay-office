import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { chatService } from './chat.service'

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/chat/channels',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest) => {
      const channels = await chatService.listChannels(request.user.id)
      return { channels }
    },
  )

  fastify.post<{ Body: { name: string; description?: string } }>(
    '/chat/channels',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { name: string; description?: string } }>, reply: FastifyReply) => {
      if (!request.body.name || typeof request.body.name !== 'string') {
        return reply.code(400).send({ message: 'Channel name is required' })
      }
      const channel = await chatService.createChannel(request.user.id, request.body.name, request.body.description)
      return reply.code(201).send({ channel })
    },
  )

  fastify.get<{ Params: { id: string }; Querystring: { before?: string } }>(
    '/chat/channels/:id/messages',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Querystring: { before?: string } }>, _reply: FastifyReply) => {
      const messages = await chatService.listMessages(request.params.id, request.query.before)
      return { messages }
    },
  )

  fastify.post<{ Params: { id: string }; Body: { body: string; threadId?: string } }>(
    '/chat/channels/:id/messages',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { body: string; threadId?: string } }>, reply: FastifyReply) => {
      if (!request.body.body || typeof request.body.body !== 'string' || request.body.body.trim().length === 0) {
        return reply.code(400).send({ message: 'Message body is required' })
      }
      const message = await chatService.sendMessage(request.user.id, request.params.id, request.body.body, request.body.threadId)
      return reply.code(201).send({ message })
    },
  )

  fastify.post<{ Params: { id: string; msgId: string }; Body: { emoji: string } }>(
    '/chat/channels/:id/messages/:msgId/reactions',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Params: { id: string; msgId: string }; Body: { emoji: string } }>, reply: FastifyReply) => {
      if (!request.body.emoji) return reply.code(400).send({ message: 'Emoji is required' })
      const message = await chatService.addReaction(request.user.id, request.params.id, request.params.msgId, request.body.emoji)
      if (!message) return reply.code(404).send({ message: 'Message not found' })
      return { message }
    },
  )
}
