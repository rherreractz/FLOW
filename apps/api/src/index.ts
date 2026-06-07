import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

import { leadRoutes } from './routes/leads'
import { tenantRoutes } from './routes/tenants'
import { webhookRoutes } from './routes/webhooks'

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
}).withTypeProvider<TypeBoxTypeProvider>()

async function bootstrap() {
  // ── Plugins ───────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  })

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  })

  // ── Routes ────────────────────────────────────────────────────────────────
  await app.register(leadRoutes, { prefix: '/api/leads' })
  await app.register(tenantRoutes, { prefix: '/api/tenants' })
  await app.register(webhookRoutes, { prefix: '/api/webhooks' })

  // ── Health ────────────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = Number(process.env.PORT ?? 4000)
  await app.listen({ port, host: '0.0.0.0' })
  app.log.info(`API running on port ${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
