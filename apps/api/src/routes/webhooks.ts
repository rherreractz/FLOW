import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'

export const webhookRoutes: FastifyPluginAsyncTypebox = async (app) => {
  // Verificación inicial de Meta (WhatsApp / Instagram)
  app.get('/meta', {
    schema: {
      querystring: Type.Object({
        'hub.mode': Type.Optional(Type.String()),
        'hub.verify_token': Type.Optional(Type.String()),
        'hub.challenge': Type.Optional(Type.String()),
      }),
    },
  }, async (req, reply) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) return reply.send(challenge)
    return reply.code(403).send({ error: 'Forbidden' })
  })

  app.post('/meta', async (req) => {
    app.log.info({ body: req.body }, 'Meta webhook received')
    // TODO: parsear evento → crear Lead → encolar en BullMQ
    return { received: true }
  })
}
