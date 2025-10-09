import { supabase } from './client'
import type { SprintPricing, SprintPricingInsert, SprintPricingUpdate } from './types'

/**
 * Save or update sprint pricing data (upsert)
 */
export async function saveSprintPricing(
  projectId: string,
  pricingData: {
    aiSprintLength?: string
    aiPrice?: number
    aiExplanation?: string
    confirmedSprintLength?: string
    confirmedPrice?: number
    adjustmentReasoning?: string
  }
): Promise<SprintPricing> {
  const insertData: SprintPricingInsert = {
    project_id: projectId,
    ai_sprint_length: pricingData.aiSprintLength || null,
    ai_price: pricingData.aiPrice || null,
    ai_explanation: pricingData.aiExplanation || null,
    confirmed_sprint_length: pricingData.confirmedSprintLength || null,
    confirmed_price: pricingData.confirmedPrice || null,
    adjustment_reasoning: pricingData.adjustmentReasoning || null
  }

  const { data, error } = await supabase
    .from('strms_sprint_pricing')
    .upsert(insertData, {
      onConflict: 'project_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving sprint pricing:', error)
    throw new Error(`Failed to save sprint pricing: ${error.message}`)
  }

  return data
}

/**
 * Get sprint pricing for a project
 */
export async function getSprintPricing(projectId: string): Promise<SprintPricing | null> {
  const { data, error } = await supabase
    .from('strms_sprint_pricing')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error getting sprint pricing:', error)
    throw new Error(`Failed to get sprint pricing: ${error.message}`)
  }

  return data
}

/**
 * Update confirmed pricing (used when proposal is adjusted and accepted)
 */
export async function updateConfirmedPricing(
  projectId: string,
  confirmedSprintLength: string,
  confirmedPrice: number,
  adjustmentReasoning?: string
): Promise<SprintPricing> {
  const updateData: SprintPricingUpdate = {
    confirmed_sprint_length: confirmedSprintLength,
    confirmed_price: confirmedPrice,
    adjustment_reasoning: adjustmentReasoning || null
  }

  const { data, error } = await supabase
    .from('strms_sprint_pricing')
    .update(updateData)
    .eq('project_id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating confirmed pricing:', error)
    throw new Error(`Failed to update confirmed pricing: ${error.message}`)
  }

  return data
}

/**
 * Delete sprint pricing for a project
 */
export async function deleteSprintPricing(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('strms_sprint_pricing')
    .delete()
    .eq('project_id', projectId)

  if (error) {
    console.error('Error deleting sprint pricing:', error)
    throw new Error(`Failed to delete sprint pricing: ${error.message}`)
  }
}

/**
 * Save AI-generated sprint pricing
 */
export async function saveAISprintPricing(
  projectId: string,
  aiSprintLength: string,
  aiPrice: number,
  aiExplanation: string
): Promise<SprintPricing> {
  return saveSprintPricing(projectId, {
    aiSprintLength,
    aiPrice,
    aiExplanation
  })
}

/**
 * Confirm sprint pricing - saves both AI values (initial) and confirmed values (what user actually selected)
 * This is called when user confirms the estimate in "Review Sprint Length & Price Estimate" stage
 */
export async function confirmSprintPricing(
  projectId: string,
  aiSprintLength: string,
  aiPrice: number,
  aiExplanation: string,
  confirmedSprintLength: string,
  confirmedPrice: number
): Promise<SprintPricing> {
  return saveSprintPricing(projectId, {
    aiSprintLength,
    aiPrice,
    aiExplanation,
    confirmedSprintLength,
    confirmedPrice
  })
}
