import { supabase } from './client'
import type { StageData, StageDataInsert, Json } from './types'

/**
 * Set stage-specific data (upsert - insert or update if exists)
 */
export async function setStageData(
  projectId: string,
  stageId: string,
  dataKey: string,
  dataValue: Json
): Promise<StageData> {
  const { data, error } = await supabase
    .from('strms_project_stage_data')
    .upsert(
      {
        project_id: projectId,
        stage_id: stageId,
        data_key: dataKey,
        data_value: dataValue
      },
      {
        onConflict: 'project_id,stage_id,data_key'
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error setting stage data:', error)
    throw new Error(`Failed to set stage data: ${error.message}`)
  }

  return data
}

/**
 * Get stage data by key
 */
export async function getStageData(
  projectId: string,
  stageId: string,
  dataKey: string
): Promise<Json | null> {
  const { data, error } = await supabase
    .from('strms_project_stage_data')
    .select('data_value')
    .eq('project_id', projectId)
    .eq('stage_id', stageId)
    .eq('data_key', dataKey)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error getting stage data:', error)
    throw new Error(`Failed to get stage data: ${error.message}`)
  }

  return data?.data_value || null
}

/**
 * Get all stage data for a specific stage
 */
export async function getAllStageData(projectId: string, stageId: string): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from('strms_project_stage_data')
    .select('data_key, data_value')
    .eq('project_id', projectId)
    .eq('stage_id', stageId)

  if (error) {
    console.error('Error getting all stage data:', error)
    throw new Error(`Failed to get all stage data: ${error.message}`)
  }

  // Convert array to key-value object
  const result: Record<string, Json> = {}
  if (data) {
    data.forEach(item => {
      result[item.data_key] = item.data_value
    })
  }

  return result
}

/**
 * Get all stage data for a project (all stages)
 */
export async function getAllProjectStageData(projectId: string): Promise<StageData[]> {
  const { data, error } = await supabase
    .from('strms_project_stage_data')
    .select('*')
    .eq('project_id', projectId)

  if (error) {
    console.error('Error getting project stage data:', error)
    throw new Error(`Failed to get project stage data: ${error.message}`)
  }

  return data || []
}

/**
 * Delete stage data by key
 */
export async function deleteStageData(
  projectId: string,
  stageId: string,
  dataKey: string
): Promise<void> {
  const { error } = await supabase
    .from('strms_project_stage_data')
    .delete()
    .eq('project_id', projectId)
    .eq('stage_id', stageId)
    .eq('data_key', dataKey)

  if (error) {
    console.error('Error deleting stage data:', error)
    throw new Error(`Failed to delete stage data: ${error.message}`)
  }
}

/**
 * Delete all stage data for a specific stage
 */
export async function deleteAllStageData(projectId: string, stageId: string): Promise<void> {
  const { error } = await supabase
    .from('strms_project_stage_data')
    .delete()
    .eq('project_id', projectId)
    .eq('stage_id', stageId)

  if (error) {
    console.error('Error deleting all stage data:', error)
    throw new Error(`Failed to delete all stage data: ${error.message}`)
  }
}

// ====================================================================
// Convenience functions for specific stage data
// ====================================================================

/**
 * Scoping Decision Stage
 */
export async function setScopingDecision(
  projectId: string,
  decision: 'proceed' | 'reject',
  developer?: string,
  emailDraft?: string
): Promise<void> {
  await setStageData(projectId, 'decision', 'decision_outcome', decision)

  if (developer) {
    await setStageData(projectId, 'decision', 'selected_developer', developer)
  }

  if (emailDraft) {
    await setStageData(projectId, 'decision', 'email_draft', emailDraft)
  }
}

/**
 * Proposal Decision Stage
 */
export async function setProposalDecision(
  projectId: string,
  decision: 'accept' | 'decline' | 'adjust',
  adjustmentData?: {
    newSprintLength?: string
    newPrice?: number
    reasoning?: string
  }
): Promise<void> {
  await setStageData(projectId, 'proposal-decision', 'decision_outcome', decision)

  if (adjustmentData) {
    await setStageData(projectId, 'proposal-decision', 'adjustment_data', adjustmentData as Json)
  }
}

/**
 * Engagement Agreement Stage
 */
export async function setEAStageData(
  projectId: string,
  data: {
    anchorContactCreated?: boolean
    anchorProposalCreated?: boolean
    eaConfirmed?: boolean
  }
): Promise<void> {
  if (data.anchorContactCreated !== undefined) {
    await setStageData(projectId, 'ea', 'anchor_contact_created', data.anchorContactCreated)
  }

  if (data.anchorProposalCreated !== undefined) {
    await setStageData(projectId, 'ea', 'anchor_proposal_created', data.anchorProposalCreated)
  }

  if (data.eaConfirmed !== undefined) {
    await setStageData(projectId, 'ea', 'ea_confirmed', data.eaConfirmed)
  }
}

/**
 * Project Setup Stage
 */
export async function setSetupStageData(
  projectId: string,
  data: {
    clickupTaskCreated?: boolean
    airtableRecordCreated?: boolean
    emailSent?: boolean
  }
): Promise<void> {
  if (data.clickupTaskCreated !== undefined) {
    await setStageData(projectId, 'setup', 'clickup_task_created', data.clickupTaskCreated)
  }

  if (data.airtableRecordCreated !== undefined) {
    await setStageData(projectId, 'setup', 'airtable_record_created', data.airtableRecordCreated)
  }

  if (data.emailSent !== undefined) {
    await setStageData(projectId, 'setup', 'email_sent', data.emailSent)
  }
}

/**
 * Proposal Stage
 */
export async function setProposalEmailDraft(projectId: string, emailDraft: string): Promise<void> {
  await setStageData(projectId, 'proposal', 'email_draft', emailDraft)
}

export async function getProposalEmailDraft(projectId: string): Promise<string | null> {
  const data = await getStageData(projectId, 'proposal', 'email_draft')
  return data as string | null
}

/**
 * Get completion date for a stage
 * Returns the updated_at timestamp from stage_data if it exists
 */
export async function getStageCompletionDate(projectId: string, stageId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('strms_project_stage_data')
    .select('updated_at')
    .eq('project_id', projectId)
    .eq('stage_id', stageId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - stage has no data yet
      return null
    }
    console.error('Error getting stage completion date:', error)
    return null
  }

  return data?.updated_at || null
}
