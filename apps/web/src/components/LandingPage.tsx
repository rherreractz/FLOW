'use client'
import { LeadForm } from './LeadForm'

interface Props {
  tenantSlug: string
  tenantName: string
  config: Record<string, unknown>
}

export function LandingPage({ tenantSlug, tenantName }: Props) {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--brand-primary)] sm:text-5xl">
          {tenantName}
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Respondemos tus consultas automáticamente, 24/7.
        </p>
      </section>
      <section className="mx-auto max-w-lg px-6 pb-24">
        <LeadForm tenantSlug={tenantSlug} />
      </section>
    </div>
  )
}
