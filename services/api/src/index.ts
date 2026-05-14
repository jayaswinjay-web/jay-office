import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { authPlugin } from './plugins/auth'
import { authRoutes } from './modules/auth/auth.routes'
import { filesRoutes } from './modules/files/files.routes'
import { shareRoutes } from './modules/share/share.routes'
import { docsRoutes } from './modules/docs/docs.routes'
import { sheetsRoutes } from './modules/sheets/sheets.routes'
import slidesRoutes from './modules/slides/slides.routes'
import calRoutes from './modules/cal/cal.routes'
import mailRoutes from './modules/mail/mail.routes'
import tasksRoutes from './modules/tasks/tasks.routes'
import { meetRoutes } from './modules/meet/meet.routes'
import { chatRoutes } from './modules/chat/chat.routes'
import { formsRoutes } from './modules/forms/forms.routes'
import { signRoutes } from './modules/sign/sign.routes'
import { notificationRoutes } from './modules/notifications/notifications.routes'
import { notesRoutes } from './modules/notes/notes.routes'

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})

await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
})

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

await app.register(authPlugin)

app.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '0.0.1',
}))

await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(filesRoutes, { prefix: '/api' })
await app.register(shareRoutes, { prefix: '/api' })
await app.register(docsRoutes, { prefix: '/api' })
await app.register(sheetsRoutes, { prefix: '/api' })
await app.register(slidesRoutes, { prefix: '/api' })
await app.register(calRoutes, { prefix: '/api' })
await app.register(mailRoutes, { prefix: '/api' })
await app.register(tasksRoutes, { prefix: '/api' })
await app.register(meetRoutes, { prefix: '/api' })
await app.register(chatRoutes, { prefix: '/api' })
await app.register(formsRoutes, { prefix: '/api' })
await app.register(signRoutes, { prefix: '/api' })
await app.register(notificationRoutes, { prefix: '/api' })
await app.register(notesRoutes, { prefix: '/api' })

const PORT = Number(process.env.PORT) || 4000

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`JAY API server listening at ${address}`)
})
