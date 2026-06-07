// ─── Tenant ───────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string
  slug: string
  name: string
  plan: 'starter' | 'pro' | 'enterprise'
  createdAt: Date
}

export interface TenantConfig {
  tenantId: string
  colors: {
    primary: string
    accent: string
    background: string
  }
  fonts: {
    heading: string
    body: string
  }
  logoUrl?: string
  customDomain?: string
}

// ─── Lead ─────────────────────────────────────────────────────────────────────
export type LeadStatus =
  | 'raw'
  | 'qualified'
  | 'false_negative'
  | 'contacted'
  | 'converted'
  | 'lost'

export type LeadSource = 'landing' | 'whatsapp' | 'instagram' | 'facebook' | 'manual'

export interface Lead {
  id: string
  tenantId: string
  name: string
  phone?: string
  email?: string
  source: LeadSource
  status: LeadStatus
  score: number           // 0-100, calculated by classifier
  rawMessage?: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// ─── Landing form ─────────────────────────────────────────────────────────────
export interface LeadFormPayload {
  tenantSlug: string
  name: string
  phone: string
  email?: string
  message?: string
  source: LeadSource
}

export interface LeadFormResponse {
  success: boolean
  leadId: string
  message: string
}

// ─── Automation ───────────────────────────────────────────────────────────────
export type AutomationTrigger = 'new_lead' | 'lead_qualified' | 'lead_converted' | 'no_response_48h'

export interface AutomationJob {
  id: string
  tenantId: string
  trigger: AutomationTrigger
  leadId: string
  payload: Record<string, unknown>
  scheduledAt?: Date
}

// ─── API responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = void> {
  data?: T
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
