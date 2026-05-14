import { FastifyInstance } from 'fastify'
import { shareService } from './share.service'

export async function shareRoutes(app: FastifyInstance) {
  app.post<{ Body: { resourceId: string; userId: string; role: string } }>(
    '/share',
    { preHandler: [app.authenticate] },
    async (req) => {
      const { resourceId, role } = req.body
      const share = await shareService.create(resourceId, role, req.user.id)
      return { share }
    },
  )

  app.get<{ Params: { resourceId: string } }>(
    '/share/:resourceId',
    { preHandler: [app.authenticate] },
    async (req) => {
      const shares = await shareService.listByResource(req.params.resourceId)
      return { shares }
    },
  )

  app.delete<{ Params: { id: string } }>(
    '/share/:id',
    { preHandler: [app.authenticate] },
    async (req) => {
      await shareService.delete(req.params.id)
      return { success: true }
    },
  )

  app.post<{ Body: { resourceId: string; role: string; expiresAt?: string } }>(
    '/share/link',
    { preHandler: [app.authenticate] },
    async (req) => {
      const { resourceId, role, expiresAt } = req.body
      const link = await shareService.createLink(resourceId, role, expiresAt, req.user.id)
      return { link: `https://jay.app/s/${link!.id}`, role, expiresAt }
    },
  )
}
