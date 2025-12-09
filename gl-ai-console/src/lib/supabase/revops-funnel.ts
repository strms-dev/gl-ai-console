import { supabase } from './client'
import type { RevOpsFunnelLead, RevOpsFunnelLeadInsert, RevOpsFunnelLeadUpdate } from './types'

/**
 * Fetch all funnel leads from Supabase
 * Returns leads ordered by created_at (most recent first)
 */
export async function fetchFunnelLeads(): Promise<RevOpsFunnelLead[]> {
  const { data, error } = await supabase
    .from('revops_funnel_leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching funnel leads:', error)
    throw new Error(`Failed to fetch funnel leads: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch a single funnel lead by ID
 */
export async function getFunnelLeadByIdSupabase(id: string): Promise<RevOpsFunnelLead | null> {
  const { data, error } = await supabase
    .from('revops_funnel_leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is a valid "not found" case
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching funnel lead:', error)
    throw new Error(`Failed to fetch funnel lead: ${error.message}`)
  }

  return data
}

/**
 * Create a new funnel lead
 */
export async function createFunnelLead(lead: RevOpsFunnelLeadInsert): Promise<RevOpsFunnelLead> {
  const { data, error } = await supabase
    .from('revops_funnel_leads')
    .insert(lead as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating funnel lead:', error)
    throw new Error(`Failed to create funnel lead: ${error.message}`)
  }

  return data
}

/**
 * Update an existing funnel lead
 */
export async function updateFunnelLeadSupabase(id: string, updates: RevOpsFunnelLeadUpdate): Promise<RevOpsFunnelLead> {
  const { data, error } = await supabase
    .from('revops_funnel_leads')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating funnel lead:', error)
    throw new Error(`Failed to update funnel lead: ${error.message}`)
  }

  return data
}

/**
 * Delete a funnel lead
 */
export async function deleteFunnelLeadSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('revops_funnel_leads')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting funnel lead:', error)
    throw new Error(`Failed to delete funnel lead: ${error.message}`)
  }
}

/**
 * Toggle HubSpot contact created status
 */
export async function toggleHsContactCreatedSupabase(id: string): Promise<RevOpsFunnelLead> {
  // First fetch the current lead to get current value
  const lead = await getFunnelLeadByIdSupabase(id)
  if (!lead) {
    throw new Error(`Lead not found: ${id}`)
  }

  // Toggle the value
  return await updateFunnelLeadSupabase(id, {
    hs_contact_created: !lead.hs_contact_created
  })
}

/**
 * Toggle HubSpot sequence enrolled status
 */
export async function toggleHsSequenceEnrolledSupabase(id: string): Promise<RevOpsFunnelLead> {
  // First fetch the current lead to get current value
  const lead = await getFunnelLeadByIdSupabase(id)
  if (!lead) {
    throw new Error(`Lead not found: ${id}`)
  }

  // Toggle the value
  return await updateFunnelLeadSupabase(id, {
    hs_sequence_enrolled: !lead.hs_sequence_enrolled
  })
}
