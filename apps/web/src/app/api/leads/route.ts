import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  tenantSlug: z.string(),
  name:       z.string().min(2),
  phone:      z.string().min(7),
  email:      z.string().email().optional().or(z.literal('')),
  message:    z.string().optional(),
  source:     z.enum(['landing', 'whatsapp', 'instagram', 'facebook', 'manual']),
})

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json())
    const apiUrl = process.env.API_URL ?? 'http://localhost:4000'
    const res = await fetch(`${apiUrl}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
