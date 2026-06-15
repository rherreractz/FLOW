import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTenantConfig } from '@/lib/tenant'
import { LandingPage } from '@/components/LandingPage'

interface Props { params: { tenant: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params  
  const config = await getTenantConfig(tenant)
  if (!config) return { title: 'AgendaFlow' }
  return {
    title: config.metaTitle ?? config.tenant.name,
    description: config.metaDescription ?? undefined,
  }
}

export default async function TenantLandingPage({ params }: Props) {
  const { tenant } = await params 
  const config = await getTenantConfig(tenant)
  if (!config) notFound()
  return (
    <main
      style={{
        '--brand-primary': config.primaryColor,
        '--brand-accent':  config.accentColor,
        '--brand-bg':      config.backgroundColor,
      } as React.CSSProperties}
    >
      <LandingPage tenantSlug={tenant} tenantName={config.tenant.name} config={config} />
    </main>
  )
}
