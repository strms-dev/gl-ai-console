import { supabase } from './client'
import type {
  RevOpsPipelineStageData,
  RevOpsPipelineStageDataInsert,
  Json
} from './types'

/**
 * Get all data for a specific stage
 */
export async function getStageData(
  dealId: string,
  stageId: string
): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from('revops_pipeline_stage_data')
    .select('data_key, data_value')
    .eq('deal_id', dealId)
    .eq('stage_id', stageId)

  if (error) {
    console.error('Error fetching stage data:', error)
    throw new Error(`Failed to fetch stage data: ${error.message}`)
  }

  // Convert array of key-value pairs to object
  const result: Record<string, Json> = {}
  for (const row of (data as { data_key: string; data_value: Json }[])) {
    result[row.data_key] = row.data_value
  }

  return result
}

/**
 * Get a single value from stage data
 */
export async function getStageDataValue(
  dealId: string,
  stageId: string,
  dataKey: string
): Promise<Json | null> {
  const { data, error } = await supabase
    .from('revops_pipeline_stage_data')
    .select('data_value')
    .eq('deal_id', dealId)
    .eq('stage_id', stageId)
    .eq('data_key', dataKey)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is a valid "not found" case
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching stage data value:', error)
    throw new Error(`Failed to fetch stage data value: ${error.message}`)
  }

  return (data as { data_value: Json }).data_value
}

/**
 * Set a single value in stage data (upsert)
 */
export async function setStageDataValue(
  dealId: string,
  stageId: string,
  dataKey: string,
  dataValue: Json
): Promise<void> {
  const now = new Date().toISOString()

  // Use upsert with on_conflict
  const insertData: RevOpsPipelineStageDataInsert = {
    deal_id: dealId,
    stage_id: stageId,
    data_key: dataKey,
    data_value: dataValue,
    updated_at: now,
  }

  const { error } = await supabase
    .from('revops_pipeline_stage_data')
    .upsert(insertData as never, {
      onConflict: 'deal_id,stage_id,data_key',
    })

  if (error) {
    console.error('Error setting stage data value:', error)
    throw new Error(`Failed to set stage data value: ${error.message}`)
  }
}

/**
 * Set multiple values in stage data (batch upsert)
 */
export async function setStageDataBatch(
  dealId: string,
  stageId: string,
  data: Record<string, Json>
): Promise<void> {
  const now = new Date().toISOString()

  const rows: RevOpsPipelineStageDataInsert[] = Object.entries(data).map(
    ([dataKey, dataValue]) => ({
      deal_id: dealId,
      stage_id: stageId,
      data_key: dataKey,
      data_value: dataValue,
      updated_at: now,
    })
  )

  const { error } = await supabase
    .from('revops_pipeline_stage_data')
    .upsert(rows as never[], {
      onConflict: 'deal_id,stage_id,data_key',
    })

  if (error) {
    console.error('Error setting stage data batch:', error)
    throw new Error(`Failed to set stage data batch: ${error.message}`)
  }
}

/**
 * Delete a single value from stage data
 */
export async function deleteStageDataValue(
  dealId: string,
  stageId: string,
  dataKey: string
): Promise<void> {
  const { error } = await supabase
    .from('revops_pipeline_stage_data')
    .delete()
    .eq('deal_id', dealId)
    .eq('stage_id', stageId)
    .eq('data_key', dataKey)

  if (error) {
    console.error('Error deleting stage data value:', error)
    throw new Error(`Failed to delete stage data value: ${error.message}`)
  }
}

/**
 * Delete all data for a specific stage
 */
export async function deleteStageData(
  dealId: string,
  stageId: string
): Promise<void> {
  const { error } = await supabase
    .from('revops_pipeline_stage_data')
    .delete()
    .eq('deal_id', dealId)
    .eq('stage_id', stageId)

  if (error) {
    console.error('Error deleting stage data:', error)
    throw new Error(`Failed to delete stage data: ${error.message}`)
  }
}

// ============================================
// Reminder Sequence Specific Functions
// ============================================

export type ReminderSequenceStatus = 'not_enrolled' | 'enrolled' | 'access_received'

export interface ReminderSequenceData {
  status: ReminderSequenceStatus
  platform: 'qbo' | 'xero' | 'other' | null
  enrolledAt: string | null
  unenrolledAt: string | null
  accessReceivedAt: string | null
}

const REMINDER_SEQUENCE_STAGE_ID = 'reminder-sequence'

/**
 * Get reminder sequence data for a deal
 */
export async function getReminderSequenceData(
  dealId: string
): Promise<ReminderSequenceData> {
  const data = await getStageData(dealId, REMINDER_SEQUENCE_STAGE_ID)

  return {
    status: (data.status as ReminderSequenceStatus) || 'not_enrolled',
    platform: (data.platform as 'qbo' | 'xero' | 'other' | null) || null,
    enrolledAt: (data.enrolled_at as string) || null,
    unenrolledAt: (data.unenrolled_at as string) || null,
    accessReceivedAt: (data.access_received_at as string) || null,
  }
}

/**
 * Initialize reminder sequence data for a deal
 */
export async function initializeReminderSequence(
  dealId: string,
  platform: 'qbo' | 'xero' | 'other'
): Promise<void> {
  await setStageDataBatch(dealId, REMINDER_SEQUENCE_STAGE_ID, {
    status: 'not_enrolled',
    platform: platform,
    enrolled_at: null,
    unenrolled_at: null,
    access_received_at: null,
  })
}

/**
 * Mark contact as enrolled in sequence
 */
export async function markEnrolledInSequenceSupabase(
  dealId: string
): Promise<void> {
  const now = new Date().toISOString()
  await setStageDataBatch(dealId, REMINDER_SEQUENCE_STAGE_ID, {
    status: 'enrolled',
    enrolled_at: now,
    unenrolled_at: null,
  })
}

/**
 * Mark contact as unenrolled from sequence (without access received)
 */
export async function markUnenrolledFromSequenceSupabase(
  dealId: string
): Promise<void> {
  const now = new Date().toISOString()
  await setStageDataBatch(dealId, REMINDER_SEQUENCE_STAGE_ID, {
    status: 'not_enrolled',
    unenrolled_at: now,
  })
}

/**
 * Mark access received (unenrolls and completes stage)
 */
export async function markAccessReceivedSupabase(
  dealId: string
): Promise<void> {
  const now = new Date().toISOString()
  await setStageDataBatch(dealId, REMINDER_SEQUENCE_STAGE_ID, {
    status: 'access_received',
    unenrolled_at: now,
    access_received_at: now,
  })
}

/**
 * Reset reminder sequence data
 */
export async function resetReminderSequenceSupabase(
  dealId: string
): Promise<void> {
  await deleteStageData(dealId, REMINDER_SEQUENCE_STAGE_ID)
}

// ============================================
// Internal Review Specific Functions
// ============================================

export interface InternalReviewSupabaseData {
  toRecipients: { name: string; email: string }[]
  ccTimEnabled: boolean
  emailSubject: string
  emailBody: string
  isEdited: boolean
  sentAt: string | null
}

const INTERNAL_REVIEW_STAGE_ID = 'internal-review'

/**
 * Get internal review data for a deal
 */
export async function getInternalReviewData(
  dealId: string
): Promise<InternalReviewSupabaseData | null> {
  const data = await getStageData(dealId, INTERNAL_REVIEW_STAGE_ID)

  // If no data exists, return null
  if (Object.keys(data).length === 0) {
    return null
  }

  return {
    toRecipients: (data.to_recipients as { name: string; email: string }[]) || [],
    ccTimEnabled: data.cc_tim_enabled !== false, // Default to true
    emailSubject: (data.email_subject as string) || '',
    emailBody: (data.email_body as string) || '',
    isEdited: (data.is_edited as boolean) || false,
    sentAt: (data.sent_at as string) || null,
  }
}

/**
 * Initialize internal review data for a deal
 */
export async function initializeInternalReviewSupabase(
  dealId: string,
  toRecipients: { name: string; email: string }[],
  ccTimEnabled: boolean,
  emailSubject: string,
  emailBody: string
): Promise<void> {
  await setStageDataBatch(dealId, INTERNAL_REVIEW_STAGE_ID, {
    to_recipients: toRecipients,
    cc_tim_enabled: ccTimEnabled,
    email_subject: emailSubject,
    email_body: emailBody,
    is_edited: false,
    sent_at: null,
  })
}

/**
 * Update internal review email content
 */
export async function updateInternalReviewSupabase(
  dealId: string,
  toRecipients: { name: string; email: string }[],
  ccTimEnabled: boolean,
  emailSubject: string,
  emailBody: string
): Promise<void> {
  await setStageDataBatch(dealId, INTERNAL_REVIEW_STAGE_ID, {
    to_recipients: toRecipients,
    cc_tim_enabled: ccTimEnabled,
    email_subject: emailSubject,
    email_body: emailBody,
    is_edited: true,
  })
}

/**
 * Mark internal review email as sent
 */
export async function markInternalReviewSentSupabase(
  dealId: string
): Promise<void> {
  const now = new Date().toISOString()
  await setStageDataValue(dealId, INTERNAL_REVIEW_STAGE_ID, 'sent_at', now)
}

/**
 * Reset internal review data
 */
export async function resetInternalReviewSupabase(
  dealId: string
): Promise<void> {
  await deleteStageData(dealId, INTERNAL_REVIEW_STAGE_ID)
}
