import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { prisma } from '@agendaflow/database'

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

export const leadQueue = new Queue('leads', { connection })

// Worker: clasifica el lead de forma asíncrona
export const leadWorker = new Worker('leads', async (job) => {
  const { leadId } = job.data as { leadId: string; tenantId: string }
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return

  // Scoring base — aquí se conectará el clasificador ML
  const score = computeBaseScore(lead.rawMessage ?? '', lead.phone)
  const status = score >= 60 ? 'QUALIFIED' : score <= 20 ? 'FALSE_NEGATIVE' : 'RAW'

  await prisma.lead.update({ where: { id: leadId }, data: { score, status } })
  await prisma.leadEvent.create({
    data: { leadId, type: 'scored', payload: { score, status, jobId: job.id } },
  })

  // TODO: trigger webhook a n8n para iniciar automatización
}, { connection, concurrency: 5 })

function computeBaseScore(message: string, phone?: string | null): number {
  let score = 50
  if (message.length > 20) score += 15
  if (phone && phone.length >= 10) score += 20
  if (/precio|costo|cuanto|cuánto|plan|servicio/i.test(message)) score += 15
  if (/test|prueba|bot|spam/i.test(message)) score -= 40
  return Math.max(0, Math.min(100, score))
}
