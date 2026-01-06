import { supabase } from './client'
import type { RevOpsPipelineDeal, RevOpsPipelineDealInsert, RevOpsPipelineDealUpdate } from './types'

/**
 * Fetch all pipeline deals from Supabase
 * Returns deals ordered by updated_at (most recent first)
 */
export async function fetchPipelineDeals(): Promise<RevOpsPipelineDeal[]> {
  const { data, error } = await supabase
    .from('revops_pipeline_deals')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching pipeline deals:', error)
    throw new Error(`Failed to fetch pipeline deals: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch a single pipeline deal by ID
 */
export async function fetchPipelineDealById(id: string): Promise<RevOpsPipelineDeal | null> {
  const { data, error } = await supabase
    .from('revops_pipeline_deals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is a valid "not found" case
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching pipeline deal:', error)
    throw new Error(`Failed to fetch pipeline deal: ${error.message}`)
  }

  return data
}

/**
 * Create a new pipeline deal
 */
export async function createPipelineDeal(deal: RevOpsPipelineDealInsert): Promise<RevOpsPipelineDeal> {
  const { data, error } = await supabase
    .from('revops_pipeline_deals')
    .insert(deal as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating pipeline deal:', error)
    throw new Error(`Failed to create pipeline deal: ${error.message}`)
  }

  return data
}

/**
 * Update an existing pipeline deal
 */
export async function updatePipelineDealSupabase(id: string, updates: RevOpsPipelineDealUpdate): Promise<RevOpsPipelineDeal> {
  const { data, error } = await supabase
    .from('revops_pipeline_deals')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating pipeline deal:', error)
    throw new Error(`Failed to update pipeline deal: ${error.message}`)
  }

  return data
}

/**
 * Delete a pipeline deal
 */
export async function deletePipelineDealSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('revops_pipeline_deals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting pipeline deal:', error)
    throw new Error(`Failed to delete pipeline deal: ${error.message}`)
  }
}
