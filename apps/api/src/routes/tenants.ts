import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { prisma } from '@agendaflow/database'

export const tenantRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/:slug/config', {
    schema: { params: Type.Object({ slug: Type.String() }) },
  }, async (req, reply) => {
    const config = await prisma.tenantConfig.findFirst({
      where: { tenant: { slug: req.params.slug } },
      include: { tenant: { select: { name: true, plan: true } } },
    })
    if (!config) return reply.code(404).send({ error: 'Not found' })
    return config
  })
}
