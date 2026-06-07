'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { LeadFormPayload, LeadFormResponse } from '@agendaflow/types'
import { useState } from 'react'

const schema = z.object({
  name:    z.string().min(2, 'Nombre muy corto'),
  phone:   z.string().min(7, 'Teléfono inválido'),
  email:   z.string().email('Email inválido').optional().or(z.literal('')),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function LeadForm({ tenantSlug }: { tenantSlug: string }) {
  const [step, setStep] = useState<1 | 2 | 'done'>(1)
  const [response, setResponse] = useState<LeadFormResponse | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const payload: LeadFormPayload = { tenantSlug, source: 'landing', ...data }
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setResponse(await res.json())
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="rounded-2xl border border-[var(--brand-accent)] p-8 text-center">
        <p className="text-xl font-medium text-[var(--brand-accent)]">
          {response?.message ?? '¡Recibido! Te contactamos pronto.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border p-8 shadow-sm">
      {/* Barra de progreso — shaping de Skinner */}
      <div className="mb-6">
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-[var(--brand-primary)] transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">Paso {step} de 2</p>
      </div>

      {step === 1 && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              {...register('name')}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              placeholder="Tu nombre"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              {...register('phone')}
              type="tel"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              placeholder="+52 55 1234 5678"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-[var(--brand-primary)] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Continuar →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (opcional)</label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">¿En qué podemos ayudarte?</label>
            <textarea
              {...register('message')}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              placeholder="Cuéntanos tu necesidad..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[var(--brand-accent)] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Quiero más información'}
          </button>
        </>
      )}
    </form>
  )
}
