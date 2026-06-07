import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { prisma } from '@agendaflow/database'
import { leadQueue } from '../queues/lead.queue'

export const leadRoutes: FastifyPluginAsyncTypebox = async (app) => {
  // POST /api/leads — recibe el formulario de la landing
  app.post('/', {
    schema: {
      body: Type.Object({
        tenantSlug: Type.String(),
        name: Type.String({ minLength: 2 }),
        phone: Type.String({ minLength: 7 }),
        email: Type.Optional(Type.String({ format: 'email' })),
        message: Type.Optional(Type.String()),
        source: Type.Union([
          Type.Literal('landing'), Type.Literal('whatsapp'),
          Type.Literal('instagram'), Type.Literal('facebook'), Type.Literal('manual'),
        ]),
      }),
    },
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, async (req, reply) => {
    const { tenantSlug, name, phone, email, message, source } = req.body
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return reply.code(404).send({ error: 'Tenant not found' })

    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant.id, name, phone, email,
        source: source.toUpperCase() as never,
        rawMessage: message,
        metadata: { userAgent: req.headers['user-agent'] ?? '' },
      },
    })

    await leadQueue.add('classify', { leadId: lead.id, tenantId: tenant.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    })

    return reply.code(201).send({
      success: true,
      leadId: lead.id,
      message: 'Gracias, te contactaremos pronto.',
    })
  })

  // GET /api/leads — dashboard interno, requiere JWT
  app.get('/', {
    schema: {
      querystring: Type.Object({
        tenantId: Type.String(),
        status: Type.Optional(Type.String()),
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        pageSize: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
      }),
    },
  }, async (req) => {
    await req.jwtVerify()
    const { tenantId, status, page = 1, pageSize = 20 } = req.query
    const [items, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where: { tenantId, ...(status ? { status: status as never } : {}) },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lead.count({ where: { tenantId, ...(status ? { status: status as never } : {}) } }),
    ])
    return { items, total, page, pageSize }
  })
}
