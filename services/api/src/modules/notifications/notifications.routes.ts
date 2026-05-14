import { FastifyInstance } from 'fastify'
import { notificationService } from './notifications.service'

export async function notificationRoutes(app: FastifyInstance) {
  app.get('/notifications', { preHandler: [app.authenticate] }, async (request) => {
    return notificationService.list(request.user.id)
  })

  app.post<{ Params: { id: string } }>('/notifications/:id/read', { preHandler: [app.authenticate] }, async (req) => {
    return notificationService.markRead(req.user.id, req.params.id)
  })

  app.post('/notifications/read-all', { preHandler: [app.authenticate] }, async (request) => {
    return notificationService.markAllRead(request.user.id)
  })
}
