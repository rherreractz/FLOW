const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export async function getTenantConfig(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/tenants/${slug}/config`, {
      next: { revalidate: 300 }, // ISR: re-fetch config cada 5 min
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
