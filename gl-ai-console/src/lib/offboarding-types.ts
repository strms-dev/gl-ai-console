// TypeScript types for STRMS Offboarding System
// Maps to Supabase tables: strms_offboarding_customers, strms_offboarding_completion_dates, strms_offboarding_checklist_items

// ============================================================================
// Stage Types
// ============================================================================

export type OffboardingStage =
  | "active"
  | "terminate-automations"
  | "terminate-billing"
  | "revoke-access"
  | "update-inventory"
  | "send-email"
  | "complete"

// ============================================================================
// Database Row Types (snake_case - matches Supabase)
// ============================================================================

export interface OffboardingCustomerRow {
  id: string
  company: string
  email: string
  contact: string
  stage: OffboardingStage
  last_activity: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OffboardingCompletionDateRow {
  customer_id: string
  stage_id: string
  completed_at: string
}

export interface OffboardingChecklistItemRow {
  customer_id: string
  stage_id: string
  item_id: string
  checked: boolean
  checked_at: string | null
}

// ============================================================================
// Application Types (camelCase - used in React components)
// ============================================================================

export interface OffboardingCustomer {
  id: string
  company: string
  email: string
  contact: string
  stage: OffboardingStage
  lastActivity: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OffboardingCompletionDates {
  [stageId: string]: string // ISO 8601 timestamp
}

export interface OffboardingChecklistItem {
  customerId: string
  stageId: string
  itemId: string
  checked: boolean
  checkedAt?: string
}

// ============================================================================
// Insert Types (for Supabase .insert() operations)
// ============================================================================

export interface OffboardingCustomerInsert {
  id: string
  company: string
  email: string
  contact: string
  stage: OffboardingStage
  last_activity: string
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface OffboardingCompletionDateInsert {
  customer_id: string
  stage_id: string
  completed_at: string
}

export interface OffboardingChecklistItemInsert {
  customer_id: string
  stage_id: string
  item_id: string
  checked: boolean
  checked_at?: string | null
}

// ============================================================================
// Update Types (partial updates)
// ============================================================================

export interface OffboardingCustomerUpdate {
  company?: string
  email?: string
  contact?: string
  stage?: OffboardingStage
  last_activity?: string
  notes?: string | null
  updated_at?: string
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================

export function rowToCustomer(row: OffboardingCustomerRow): OffboardingCustomer {
  return {
    id: row.id,
    company: row.company,
    email: row.email,
    contact: row.contact,
    stage: row.stage,
    lastActivity: row.last_activity,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function customerToInsert(customer: Partial<OffboardingCustomer> & { id: string }): OffboardingCustomerInsert {
  return {
    id: customer.id,
    company: customer.company || '',
    email: customer.email || '',
    contact: customer.contact || '',
    stage: customer.stage || 'terminate-automations',
    last_activity: customer.lastActivity || 'Just now',
    notes: customer.notes || null,
    created_at: customer.createdAt || new Date().toISOString(),
    updated_at: customer.updatedAt || new Date().toISOString(),
  }
}

export function customerToUpdate(updates: Partial<OffboardingCustomer>): OffboardingCustomerUpdate {
  const result: OffboardingCustomerUpdate = {}

  if (updates.company !== undefined) result.company = updates.company
  if (updates.email !== undefined) result.email = updates.email
  if (updates.contact !== undefined) result.contact = updates.contact
  if (updates.stage !== undefined) result.stage = updates.stage
  if (updates.lastActivity !== undefined) result.last_activity = updates.lastActivity
  if (updates.notes !== undefined) result.notes = updates.notes || null
  if (updates.updatedAt !== undefined) result.updated_at = updates.updatedAt

  return result
}

export function completionDatesRowsToObject(rows: OffboardingCompletionDateRow[]): OffboardingCompletionDates {
  const result: OffboardingCompletionDates = {}
  for (const row of rows) {
    result[row.stage_id] = row.completed_at
  }
  return result
}
