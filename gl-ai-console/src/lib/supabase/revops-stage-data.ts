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

// ============================================
// Create Quote Specific Functions
// ============================================

export interface PricingBreakdownItem {
  category: string
  description: string
  amount: number
  formula?: string
}

export interface QuoteLineItem {
  id: string
  service: string
  description: string
  monthlyPrice: number
  isCustom: boolean
}

export interface CreateQuoteSupabaseData {
  accountingMonthlyPrice: number | null
  accountingPriceCalculatedAt: string | null
  accountingPriceBreakdown: string | null
  accountingPriceBreakdownData: PricingBreakdownItem[] | null
  accountingMethod: string | null
  recommendedCadence: string | null
  appliedMultiplier: number | null
  priorityMultiplier: number | null
  cleanupEstimate: number | null
  lineItems: QuoteLineItem[]
  isEdited: boolean
  hubspotSynced: boolean
  hubspotSyncedAt: string | null
  hubspotQuoteLink: string | null
  quoteConfirmedAt: string | null
}

const CREATE_QUOTE_STAGE_ID = 'create-quote'

/**
 * Get create quote data for a deal
 */
export async function getCreateQuoteData(
  dealId: string
): Promise<CreateQuoteSupabaseData | null> {
  const data = await getStageData(dealId, CREATE_QUOTE_STAGE_ID)

  // If no data exists, return null
  if (Object.keys(data).length === 0) {
    return null
  }

  return {
    accountingMonthlyPrice: (data.accounting_monthly_price as number) ?? null,
    accountingPriceCalculatedAt: (data.accounting_price_calculated_at as string) ?? null,
    accountingPriceBreakdown: (data.accounting_price_breakdown as string) ?? null,
    accountingPriceBreakdownData: (data.accounting_price_breakdown_data as unknown as PricingBreakdownItem[]) ?? null,
    accountingMethod: (data.accounting_method as string) ?? null,
    recommendedCadence: (data.recommended_cadence as string) ?? null,
    appliedMultiplier: (data.applied_multiplier as number) ?? null,
    priorityMultiplier: (data.priority_multiplier as number) ?? null,
    cleanupEstimate: (data.cleanup_estimate as number) ?? null,
    lineItems: (data.line_items as unknown as QuoteLineItem[]) ?? [],
    isEdited: (data.is_edited as boolean) ?? false,
    hubspotSynced: (data.hubspot_synced as boolean) ?? false,
    hubspotSyncedAt: (data.hubspot_synced_at as string) ?? null,
    hubspotQuoteLink: (data.hubspot_quote_link as string) ?? null,
    quoteConfirmedAt: (data.quote_confirmed_at as string) ?? null,
  }
}

/**
 * Save all create quote data for a deal
 */
export async function saveCreateQuoteData(
  dealId: string,
  quoteData: CreateQuoteSupabaseData
): Promise<void> {
  await setStageDataBatch(dealId, CREATE_QUOTE_STAGE_ID, {
    accounting_monthly_price: quoteData.accountingMonthlyPrice,
    accounting_price_calculated_at: quoteData.accountingPriceCalculatedAt,
    accounting_price_breakdown: quoteData.accountingPriceBreakdown,
    accounting_price_breakdown_data: quoteData.accountingPriceBreakdownData as unknown as Json,
    accounting_method: quoteData.accountingMethod,
    recommended_cadence: quoteData.recommendedCadence,
    applied_multiplier: quoteData.appliedMultiplier,
    priority_multiplier: quoteData.priorityMultiplier,
    cleanup_estimate: quoteData.cleanupEstimate,
    line_items: quoteData.lineItems as unknown as Json,
    is_edited: quoteData.isEdited,
    hubspot_synced: quoteData.hubspotSynced,
    hubspot_synced_at: quoteData.hubspotSyncedAt,
    hubspot_quote_link: quoteData.hubspotQuoteLink,
    quote_confirmed_at: quoteData.quoteConfirmedAt,
  })
}

/**
 * Add a line item to the quote
 */
export async function addLineItemSupabase(
  dealId: string,
  lineItem: QuoteLineItem
): Promise<QuoteLineItem[]> {
  // Get current line items
  const currentData = await getCreateQuoteData(dealId)
  const lineItems = currentData?.lineItems ?? []

  // Add new item
  lineItems.push(lineItem)

  // Save updated array
  await setStageDataBatch(dealId, CREATE_QUOTE_STAGE_ID, {
    line_items: lineItems as unknown as Json,
    is_edited: true,
  })

  return lineItems
}

/**
 * Update a line item in the quote
 */
export async function updateLineItemSupabase(
  dealId: string,
  lineItemId: string,
  updates: Partial<QuoteLineItem>
): Promise<QuoteLineItem[] | null> {
  // Get current line items
  const currentData = await getCreateQuoteData(dealId)
  if (!currentData) return null

  const lineItems = currentData.lineItems
  const index = lineItems.findIndex(item => item.id === lineItemId)

  if (index === -1) return null

  // Update the item
  lineItems[index] = {
    ...lineItems[index],
    ...updates,
  }

  // Save updated array
  await setStageDataBatch(dealId, CREATE_QUOTE_STAGE_ID, {
    line_items: lineItems as unknown as Json,
    is_edited: true,
  })

  return lineItems
}

/**
 * Remove a line item from the quote
 */
export async function removeLineItemSupabase(
  dealId: string,
  lineItemId: string
): Promise<QuoteLineItem[]> {
  // Get current line items
  const currentData = await getCreateQuoteData(dealId)
  const lineItems = currentData?.lineItems ?? []

  // Filter out the item
  const updatedLineItems = lineItems.filter(item => item.id !== lineItemId)

  // Save updated array
  await setStageDataBatch(dealId, CREATE_QUOTE_STAGE_ID, {
    line_items: updatedLineItems as unknown as Json,
    is_edited: true,
  })

  return updatedLineItems
}

/**
 * Update HubSpot sync status after pushing quote
 */
export async function updateHubspotSyncSupabase(
  dealId: string,
  quoteLink: string | null
): Promise<void> {
  const now = new Date().toISOString()
  await setStageDataBatch(dealId, CREATE_QUOTE_STAGE_ID, {
    hubspot_synced: true,
    hubspot_synced_at: now,
    hubspot_quote_link: quoteLink,
  })
}

/**
 * Mark quote as confirmed
 */
export async function markQuoteConfirmedSupabase(
  dealId: string
): Promise<void> {
  const now = new Date().toISOString()
  await setStageDataValue(dealId, CREATE_QUOTE_STAGE_ID, 'quote_confirmed_at', now)
}

/**
 * Reset create quote data
 */
export async function resetCreateQuoteSupabase(
  dealId: string
): Promise<void> {
  await deleteStageData(dealId, CREATE_QUOTE_STAGE_ID)
}

// ============================================
// Simplified Stage Data Functions (Pizza Tracker)
// These stages only store confirmation timestamps
// ============================================

export type SimplifiedStageId =
  | 'quote-sent'
  | 'prepare-engagement'
  | 'internal-engagement-review'  // EA Ready for Review
  | 'send-engagement'             // EA Sent
  | 'closed-won'
  | 'closed-lost'

export interface SimplifiedStageSupabaseData {
  confirmedAt: string | null
  confirmedBy: string | null
  hubspotSyncedAt: string | null
  isAutoSynced: boolean
  isSkipped: boolean
  skippedReason: string | null
}

export interface ClosedLostSupabaseData extends SimplifiedStageSupabaseData {
  // Note: inherits isSkipped, skippedReason from SimplifiedStageSupabaseData
  lostReason: string | null
  lostReasonDetails: string
  lostFromStage: string | null
}

export interface ClosedWonSupabaseData extends SimplifiedStageSupabaseData {
  // Note: inherits isSkipped, skippedReason from SimplifiedStageSupabaseData
  finalDealValue: number | null
}

/**
 * Get simplified stage data for a deal
 */
export async function getSimplifiedStageData(
  dealId: string,
  stageId: SimplifiedStageId
): Promise<SimplifiedStageSupabaseData> {
  const data = await getStageData(dealId, stageId)

  return {
    confirmedAt: (data.confirmed_at as string) || null,
    confirmedBy: (data.confirmed_by as string) || null,
    hubspotSyncedAt: (data.hubspot_synced_at as string) || null,
    isAutoSynced: (data.is_auto_synced as boolean) || false,
    isSkipped: (data.is_skipped as boolean) || false,
    skippedReason: (data.skipped_reason as string) || null,
  }
}

/**
 * Get all simplified stages data for a deal (for initial load)
 */
export async function getAllSimplifiedStagesData(
  dealId: string
): Promise<Record<SimplifiedStageId, SimplifiedStageSupabaseData>> {
  const stages: SimplifiedStageId[] = [
    'quote-sent',
    'prepare-engagement',
    'internal-engagement-review',
    'send-engagement',
    'closed-won',
    'closed-lost'
  ]

  const results: Record<string, SimplifiedStageSupabaseData> = {}

  // Fetch all stages in parallel
  const promises = stages.map(async (stageId) => {
    const data = await getSimplifiedStageData(dealId, stageId)
    return { stageId, data }
  })

  const responses = await Promise.all(promises)
  for (const { stageId, data } of responses) {
    results[stageId] = data
  }

  return results as Record<SimplifiedStageId, SimplifiedStageSupabaseData>
}

// Order of simplified stages for auto-complete logic
// Note: closed-won and closed-lost are terminal outcomes, not in this order
const SIMPLIFIED_STAGE_ORDER: SimplifiedStageId[] = [
  'quote-sent',
  'prepare-engagement',
  'internal-engagement-review',
  'send-engagement',
]

/**
 * Auto-complete all prior stages when a later stage is confirmed
 * This marks skipped stages as completed with a "skipped" indicator
 */
export async function autoCompletePriorStages(
  dealId: string,
  confirmedStageId: SimplifiedStageId,
  syncedAt: string
): Promise<void> {
  // Handle terminal stages (closed-won/closed-lost) - auto-complete all stages in order
  if (confirmedStageId === 'closed-won' || confirmedStageId === 'closed-lost') {
    for (const stageId of SIMPLIFIED_STAGE_ORDER) {
      const existing = await getSimplifiedStageData(dealId, stageId)
      if (!existing.confirmedAt) {
        await setStageDataBatch(dealId, stageId, {
          confirmed_at: syncedAt,
          confirmed_by: 'system',
          is_auto_synced: true,
          is_skipped: true,
          skipped_reason: 'Deal moved past this stage',
        })
      }
    }
    return
  }

  // For non-terminal stages, find the index and complete all prior stages
  const stageIndex = SIMPLIFIED_STAGE_ORDER.indexOf(confirmedStageId)
  if (stageIndex <= 0) return // No prior stages to skip

  const priorStages = SIMPLIFIED_STAGE_ORDER.slice(0, stageIndex)

  for (const stageId of priorStages) {
    const existing = await getSimplifiedStageData(dealId, stageId)
    if (!existing.confirmedAt) {
      await setStageDataBatch(dealId, stageId, {
        confirmed_at: syncedAt,
        confirmed_by: 'system',
        is_auto_synced: true,
        is_skipped: true,
        skipped_reason: 'Deal moved past this stage',
      })
    }
  }
}

/**
 * Confirm a simplified stage (manual confirmation)
 * Also auto-completes any prior stages that weren't completed
 */
export async function confirmSimplifiedStage(
  dealId: string,
  stageId: SimplifiedStageId,
  confirmedBy?: string
): Promise<void> {
  const now = new Date().toISOString()

  // First, auto-complete any prior stages that weren't completed
  await autoCompletePriorStages(dealId, stageId, now)

  // Then confirm this stage
  await setStageDataBatch(dealId, stageId, {
    confirmed_at: now,
    confirmed_by: confirmedBy || null,
    is_auto_synced: false,
    is_skipped: false,
    skipped_reason: null,
  })
}

/**
 * Mark stage as synced from HubSpot (auto-sync)
 * Also auto-completes any prior stages that weren't completed
 */
export async function markStageHubspotSynced(
  dealId: string,
  stageId: SimplifiedStageId,
  syncedAt: string
): Promise<void> {
  // First, auto-complete any prior stages that weren't completed
  await autoCompletePriorStages(dealId, stageId, syncedAt)

  // Then mark this stage as synced
  await setStageDataBatch(dealId, stageId, {
    confirmed_at: syncedAt,
    hubspot_synced_at: syncedAt,
    is_auto_synced: true,
    is_skipped: false,
    skipped_reason: null,
  })
}

/**
 * Get closed lost data
 */
export async function getClosedLostData(
  dealId: string
): Promise<ClosedLostSupabaseData> {
  const data = await getStageData(dealId, 'closed-lost')

  return {
    confirmedAt: (data.confirmed_at as string) || null,
    confirmedBy: (data.confirmed_by as string) || null,
    hubspotSyncedAt: (data.hubspot_synced_at as string) || null,
    isAutoSynced: (data.is_auto_synced as boolean) || false,
    isSkipped: (data.is_skipped as boolean) || false,
    skippedReason: (data.skipped_reason as string) || null,
    lostReason: (data.lost_reason as string) || null,
    lostReasonDetails: (data.lost_reason_details as string) || '',
    lostFromStage: (data.lost_from_stage as string) || null,
  }
}

/**
 * Confirm closed lost with reason
 * Also auto-completes any prior stages that weren't completed
 */
export async function confirmClosedLost(
  dealId: string,
  lostReason: string,
  lostReasonDetails: string,
  lostFromStage: string,
  confirmedBy?: string
): Promise<void> {
  const now = new Date().toISOString()

  // First, auto-complete any prior stages that weren't completed
  await autoCompletePriorStages(dealId, 'closed-lost', now)

  // Then confirm closed lost
  await setStageDataBatch(dealId, 'closed-lost', {
    confirmed_at: now,
    confirmed_by: confirmedBy || null,
    is_auto_synced: false,
    is_skipped: false,
    skipped_reason: null,
    lost_reason: lostReason,
    lost_reason_details: lostReasonDetails,
    lost_from_stage: lostFromStage,
  })
}

/**
 * Get closed won data
 */
export async function getClosedWonData(
  dealId: string
): Promise<ClosedWonSupabaseData> {
  const data = await getStageData(dealId, 'closed-won')

  return {
    confirmedAt: (data.confirmed_at as string) || null,
    confirmedBy: (data.confirmed_by as string) || null,
    hubspotSyncedAt: (data.hubspot_synced_at as string) || null,
    isAutoSynced: (data.is_auto_synced as boolean) || false,
    isSkipped: (data.is_skipped as boolean) || false,
    skippedReason: (data.skipped_reason as string) || null,
    finalDealValue: (data.final_deal_value as number) || null,
  }
}

/**
 * Confirm closed won with deal value
 * Also auto-completes any prior stages that weren't completed
 */
export async function confirmClosedWon(
  dealId: string,
  finalDealValue: number | null,
  confirmedBy?: string
): Promise<void> {
  const now = new Date().toISOString()

  // First, auto-complete any prior stages that weren't completed
  await autoCompletePriorStages(dealId, 'closed-won', now)

  // Then confirm closed won
  await setStageDataBatch(dealId, 'closed-won', {
    confirmed_at: now,
    confirmed_by: confirmedBy || null,
    is_auto_synced: false,
    is_skipped: false,
    skipped_reason: null,
    final_deal_value: finalDealValue,
  })
}

/**
 * Reset a simplified stage
 */
export async function resetSimplifiedStage(
  dealId: string,
  stageId: SimplifiedStageId
): Promise<void> {
  await deleteStageData(dealId, stageId)
}
