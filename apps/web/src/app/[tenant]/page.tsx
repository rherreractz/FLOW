import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTenantConfig } from '@/lib/tenant'
import { LandingPage } from '@/components/LandingPage'

interface Props { params: { tenant: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = await getTenantConfig(params.tenant)
  if (!config) return { title: 'AgendaFlow' }
  return {
    title: config.metaTitle ?? config.tenant.name,
    description: config.metaDescription ?? undefined,
  }
}

export default async function TenantLandingPage({ params }: Props) {
  const config = await getTenantConfig(params.tenant)
  if (!config) notFound()
  return (
    <main
      style={{
        '--brand-primary': config.primaryColor,
        '--brand-accent':  config.accentColor,
        '--brand-bg':      config.backgroundColor,
      } as React.CSSProperties}
    >
      <LandingPage tenantSlug={params.tenant} tenantName={config.tenant.name} config={config} />
    </main>
  )
}
