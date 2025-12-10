"use client"

import type { RevOpsFunnelLead } from "@/lib/supabase/types"
import {
  fetchFunnelLeads,
  getFunnelLeadByIdSupabase,
  createFunnelLead,
  updateFunnelLeadSupabase,
  deleteFunnelLeadSupabase,
  toggleHsContactCreatedSupabase,
} from "@/lib/supabase/revops-funnel"

// Application-level interface (camelCase for UI layer)
export interface FunnelLead {
  id: string
  firstName: string
  lastName: string
  email: string
  companyName: string
  companyDomain: string
  notes: string
  hsContactCreated: boolean
  hsContactUrl: string | null
  hsSequenceEnrolled: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Convert database RevOpsFunnelLead (snake_case) to application FunnelLead (camelCase)
 */
function dbToApp(dbLead: RevOpsFunnelLead): FunnelLead {
  return {
    id: dbLead.id,
    firstName: dbLead.first_name,
    lastName: dbLead.last_name,
    email: dbLead.email,
    companyName: dbLead.company_name,
    companyDomain: dbLead.company_domain || "",
    notes: dbLead.notes || "",
    hsContactCreated: dbLead.hs_contact_created,
    hsContactUrl: dbLead.hs_contact_url,
    hsSequenceEnrolled: dbLead.hs_sequence_enrolled,
    createdAt: dbLead.created_at,
    updatedAt: dbLead.updated_at,
  }
}

/**
 * Convert application FunnelLead updates to database format
 */
function appToDbUpdate(appLead: Partial<Omit<FunnelLead, "id" | "createdAt" | "updatedAt">>) {
  const dbUpdate: {
    first_name?: string
    last_name?: string
    email?: string
    company_name?: string
    company_domain?: string | null
    notes?: string | null
    hs_contact_created?: boolean
    hs_contact_url?: string | null
    hs_sequence_enrolled?: boolean
  } = {}

  if (appLead.firstName !== undefined) dbUpdate.first_name = appLead.firstName
  if (appLead.lastName !== undefined) dbUpdate.last_name = appLead.lastName
  if (appLead.email !== undefined) dbUpdate.email = appLead.email
  if (appLead.companyName !== undefined) dbUpdate.company_name = appLead.companyName
  if (appLead.companyDomain !== undefined) {
    dbUpdate.company_domain = appLead.companyDomain || null
  }
  if (appLead.notes !== undefined) {
    dbUpdate.notes = appLead.notes || null
  }
  if (appLead.hsContactCreated !== undefined) {
    dbUpdate.hs_contact_created = appLead.hsContactCreated
  }
  if (appLead.hsContactUrl !== undefined) {
    dbUpdate.hs_contact_url = appLead.hsContactUrl
  }
  if (appLead.hsSequenceEnrolled !== undefined) {
    dbUpdate.hs_sequence_enrolled = appLead.hsSequenceEnrolled
  }

  return dbUpdate
}

/**
 * Get all funnel leads from Supabase
 */
export async function getFunnelLeads(): Promise<FunnelLead[]> {
  try {
    const dbLeads = await fetchFunnelLeads()
    return dbLeads.map(dbToApp)
  } catch (error) {
    console.error("Error fetching funnel leads from Supabase:", error)
    return []
  }
}

/**
 * Get a single funnel lead by ID from Supabase
 */
export async function getFunnelLeadById(id: string): Promise<FunnelLead | null> {
  try {
    const dbLead = await getFunnelLeadByIdSupabase(id)
    if (!dbLead) return null
    return dbToApp(dbLead)
  } catch (error) {
    console.error("Error fetching funnel lead by ID from Supabase:", error)
    return null
  }
}

/**
 * Add a new funnel lead to Supabase
 */
export async function addFunnelLead(
  lead: Omit<FunnelLead, "id" | "hsContactCreated" | "hsSequenceEnrolled" | "createdAt" | "updatedAt">
): Promise<FunnelLead> {
  const dbLead = await createFunnelLead({
    first_name: lead.firstName,
    last_name: lead.lastName,
    email: lead.email,
    company_name: lead.companyName,
    company_domain: lead.companyDomain || null,
    notes: lead.notes || null,
  })
  return dbToApp(dbLead)
}

/**
 * Update an existing funnel lead in Supabase
 */
export async function updateFunnelLead(
  id: string,
  updates: Partial<Omit<FunnelLead, "id" | "createdAt" | "updatedAt">>
): Promise<FunnelLead | null> {
  try {
    const dbUpdates = appToDbUpdate(updates)
    const dbLead = await updateFunnelLeadSupabase(id, dbUpdates)
    return dbToApp(dbLead)
  } catch (error) {
    console.error("Error updating funnel lead in Supabase:", error)
    return null
  }
}

/**
 * Delete a funnel lead from Supabase
 */
export async function deleteFunnelLead(id: string): Promise<boolean> {
  try {
    await deleteFunnelLeadSupabase(id)
    return true
  } catch (error) {
    console.error("Error deleting funnel lead from Supabase:", error)
    return false
  }
}

/**
 * Toggle HubSpot contact created status
 */
export async function toggleHsContactCreated(id: string): Promise<FunnelLead | null> {
  try {
    const dbLead = await toggleHsContactCreatedSupabase(id)
    return dbToApp(dbLead)
  } catch (error) {
    console.error("Error toggling HubSpot contact status:", error)
    return null
  }
}

