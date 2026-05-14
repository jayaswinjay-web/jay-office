import type { FastifyInstance, FastifyReply } from 'fastify'

interface Attachment {
  id: string
  name: string
  size: string
  url: string
  mimeType: string
}

interface MailMessage {
  id: string
  from: string
  fromName: string | null
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  body: string
  preview: string | null
  isRead: boolean
  isStarred: boolean
  receivedAt: string
  threadId: string | null
  attachments: Attachment[] | null
  folder: 'inbox' | 'sent' | 'starred' | 'trash' | 'archive'
}

interface SendMessageBody {
  to: string
  subject: string
  body: string
  cc?: string
  bcc?: string
}

const messages: MailMessage[] = []

async function mailRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: {
      folder?: string
      search?: string
      threadId?: string
      page?: string
      limit?: string
    }
  }>(
    '/mail/messages',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const { folder, search, threadId, page, limit } = request.query
      const pageNum = page ? parseInt(page, 10) : 1
      const limitNum = limit ? parseInt(limit, 10) : 20
      const offset = (pageNum - 1) * limitNum

      let filtered = messages.filter((m) => m.from === request.user.email)

      if (folder) {
        if (folder === 'starred') {
          filtered = filtered.filter((m) => m.isStarred && m.folder !== 'trash')
        } else {
          filtered = filtered.filter((m) => m.folder === folder)
        }
      }

      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(
          (m) =>
            m.subject.toLowerCase().includes(q) ||
            m.body.toLowerCase().includes(q) ||
            m.from.toLowerCase().includes(q),
        )
      }

      if (threadId) {
        filtered = filtered.filter((m) => m.threadId === threadId)
      }

      filtered.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())

      const total = filtered.length
      const paginated = filtered.slice(offset, offset + limitNum)

      return {
        messages: paginated,
        total,
        hasMore: offset + limitNum < total,
      }
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/mail/messages/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply: FastifyReply) => {
      const { id } = request.params
      const message = messages.find((m) => m.id === id && m.from === request.user.email)
      if (!message) {
        return reply.status(404).send({ error: 'Message not found' })
      }
      return { message }
    },
  )

  fastify.post<{ Body: SendMessageBody }>(
    '/mail/send',
    { preHandler: [fastify.authenticate] },
    async (request, reply: FastifyReply) => {
      const { to, subject, body, cc, bcc } = request.body

      const recipients = to.split(',').map((r) => r.trim())
      const ccRecipients = cc ? cc.split(',').map((r) => r.trim()) : []
      const bccRecipients = bcc ? bcc.split(',').map((r) => r.trim()) : []

      const newMessage: MailMessage = {
        id: crypto.randomUUID(),
        from: request.user.email,
        fromName: request.user.name,
        to: recipients,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject,
        body,
        preview: body.substring(0, 100),
        isRead: true,
        isStarred: false,
        receivedAt: new Date().toISOString(),
        threadId: null,
        attachments: null,
        folder: 'sent',
      }

      messages.push(newMessage)
      return reply.status(201).send({ message: newMessage })
    },
  )

  fastify.post<{ Params: { id: string } }>(
    '/mail/messages/:id/read',
    { preHandler: [fastify.authenticate] },
    async (request, reply: FastifyReply) => {
      const { id } = request.params
      const message = messages.find((m) => m.id === id && m.from === request.user.email)
      if (!message) {
        return reply.status(404).send({ error: 'Message not found' })
      }
      message.isRead = true
      return reply.status(204).send()
    },
  )

  fastify.post<{ Params: { id: string }; Body: { starred: boolean } }>(
    '/mail/messages/:id/star',
    { preHandler: [fastify.authenticate] },
    async (request, reply: FastifyReply) => {
      const { id } = request.params
      const { starred } = request.body
      const message = messages.find((m) => m.id === id && m.from === request.user.email)
      if (!message) {
        return reply.status(404).send({ error: 'Message not found' })
      }
      message.isStarred = starred
      return reply.status(204).send()
    },
  )

  fastify.post<{ Params: { id: string } }>(
    '/mail/messages/:id/archive',
    { preHandler: [fastify.authenticate] },
    async (request, reply: FastifyReply) => {
      const { id } = request.params
      const message = messages.find((m) => m.id === id && m.from === request.user.email)
      if (!message) {
        return reply.status(404).send({ error: 'Message not found' })
      }
      message.folder = 'archive'
      return reply.status(204).send()
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/mail/messages/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply: FastifyReply) => {
      const { id } = request.params
      const idx = messages.findIndex((m) => m.id === id && m.from === request.user.email)
      if (idx < 0) {
        return reply.status(404).send({ error: 'Message not found' })
      }
      const msg = messages[idx]
      if (!msg) return reply.status(404).send({ error: 'Message not found' })
      msg.folder = 'trash'
      return reply.status(204).send()
    },
  )
}

export default mailRoutes
