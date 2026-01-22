import { supabase } from './client'
import type { RevOpsGLReviewInsert, RevOpsGLReviewUpdate, GLReviewType, Json } from './types'
import type { GLReviewFormData, GLReviewFieldConfidence, GLReviewComparisonSelections, GLReviewCustomValues } from '@/lib/sales-pipeline-timeline-types'

/**
 * Convert GLReviewFormData (camelCase) to database columns (snake_case)
 * Note: email, company_name, lead_name are no longer part of GLReviewFormData
 * They come from the deal data instead
 */
function formDataToDbColumns(formData: GLReviewFormData): Partial<RevOpsGLReviewInsert> {
  return {
    accounts: formData.accounts as unknown as Json,
    ecommerce: formData.ecommerce as unknown as Json,
    revenue_coa_allocations: formData.revenueCoaAllocations || null,
    coa_revenue_categories: formData.coaRevenueCategories || null,
    active_classes: formData.activeClasses || null,
    catchup_required: formData.catchupRequired || null,
    catchup_date_range: formData.catchupDateRange || null,
    catchup_months: formData.catchupMonths || null,
    additional_notes: formData.additionalNotes || null,
  }
}

/**
 * Convert database row (snake_case) to GLReviewFormData (camelCase)
 * Note: email, company_name, lead_name are no longer part of GLReviewFormData
 */
function dbRowToFormData(row: {
  accounts: Json
  ecommerce: Json
  revenue_coa_allocations: string | null
  coa_revenue_categories: string | null
  active_classes: string | null
  catchup_required: string | null
  catchup_date_range: string | null
  catchup_months: string | null
  additional_notes: string | null
}): GLReviewFormData {
  // Parse accounts from JSONB
  const accounts = Array.isArray(row.accounts)
    ? (row.accounts as unknown as GLReviewFormData['accounts'])
    : []

  // Ensure we have 20 account slots
  while (accounts.length < 20) {
    accounts.push({ name: '', transactionCount: '' })
  }

  // Parse ecommerce from JSONB
  const ecommerce = typeof row.ecommerce === 'object' && row.ecommerce !== null
    ? (row.ecommerce as unknown as GLReviewFormData['ecommerce'])
    : { amazon: '' as const, shopify: '' as const, square: '' as const, etsy: '' as const, ebay: '' as const, woocommerce: '' as const, other: '' as const }

  return {
    accounts,
    ecommerce,
    revenueCoaAllocations: (row.revenue_coa_allocations || '') as GLReviewFormData['revenueCoaAllocations'],
    coaRevenueCategories: row.coa_revenue_categories || '',
    activeClasses: (row.active_classes || '') as GLReviewFormData['activeClasses'],
    catchupRequired: (row.catchup_required || '') as GLReviewFormData['catchupRequired'],
    catchupDateRange: row.catchup_date_range || '',
    catchupMonths: row.catchup_months || '',
    additionalNotes: row.additional_notes || '',
  }
}

/**
 * Response type for fetching GL review data
 */
export interface GLReviewResult {
  id: string
  dealId: string
  reviewType: GLReviewType
  formData: GLReviewFormData
  fieldConfidence: GLReviewFieldConfidence | null
  isAutoFilled: boolean
  autoFilledAt: string | null
  isConfirmed: boolean
  confirmedAt: string | null
  confirmedBy: string | null
  // AI-specific
  qboClientName: string | null
  qboAccessConfirmedAt: string | null
  // Team-specific
  submittedBy: string | null
  googleFormResponseId: string | null
  // Final-specific
  fieldSelections: GLReviewComparisonSelections | null
  customValues: GLReviewCustomValues | null
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Parse database row to GLReviewResult
 */
function parseDbRow(row: Record<string, unknown>): GLReviewResult {
  return {
    id: row.id as string,
    dealId: row.deal_id as string,
    reviewType: row.review_type as GLReviewType,
    formData: dbRowToFormData(row as Parameters<typeof dbRowToFormData>[0]),
    fieldConfidence: row.field_confidence as GLReviewFieldConfidence | null,
    isAutoFilled: row.is_auto_filled as boolean,
    autoFilledAt: row.auto_filled_at as string | null,
    isConfirmed: row.is_confirmed as boolean,
    confirmedAt: row.confirmed_at as string | null,
    confirmedBy: row.confirmed_by as string | null,
    qboClientName: row.qbo_client_name as string | null,
    qboAccessConfirmedAt: row.qbo_access_confirmed_at as string | null,
    submittedBy: row.submitted_by as string | null,
    googleFormResponseId: row.google_form_response_id as string | null,
    fieldSelections: row.field_selections as GLReviewComparisonSelections | null,
    customValues: row.custom_values as GLReviewCustomValues | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

/**
 * Fetch GL review by deal ID and review type
 * Returns null if no review exists
 */
export async function fetchGLReviewByDealIdAndType(
  dealId: string,
  reviewType: GLReviewType
): Promise<GLReviewResult | null> {
  const { data, error } = await supabase
    .from('revops_gl_reviews')
    .select('*')
    .eq('deal_id', dealId)
    .eq('review_type', reviewType)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is a valid "not found" case
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching GL review:', error)
    throw new Error(`Failed to fetch GL review: ${error.message}`)
  }

  return parseDbRow(data as Record<string, unknown>)
}

/**
 * Fetch all GL reviews for a deal (AI, team, and final)
 */
export async function fetchAllGLReviewsByDealId(dealId: string): Promise<{
  ai: GLReviewResult | null
  team: GLReviewResult | null
  final: GLReviewResult | null
}> {
  const { data, error } = await supabase
    .from('revops_gl_reviews')
    .select('*')
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error fetching GL reviews:', error)
    throw new Error(`Failed to fetch GL reviews: ${error.message}`)
  }

  const reviews = {
    ai: null as GLReviewResult | null,
    team: null as GLReviewResult | null,
    final: null as GLReviewResult | null,
  }

  for (const row of (data || [])) {
    const parsed = parseDbRow(row as Record<string, unknown>)
    reviews[parsed.reviewType] = parsed
  }

  return reviews
}

/**
 * Create a new AI GL review
 * Used by n8n workflow for AI auto-fill
 */
export async function createAIGLReview(
  dealId: string,
  formData: GLReviewFormData,
  fieldConfidence: GLReviewFieldConfidence | null = null,
  qboClientName: string | null = null
): Promise<string> {
  const insertData: RevOpsGLReviewInsert = {
    deal_id: dealId,
    review_type: 'ai',
    ...formDataToDbColumns(formData),
    field_confidence: (fieldConfidence || {}) as unknown as Json,
    qbo_client_name: qboClientName,
    qbo_access_confirmed_at: qboClientName ? new Date().toISOString() : null,
    is_auto_filled: true,
    auto_filled_at: new Date().toISOString(),
    is_confirmed: false,
    confirmed_at: null,
  }

  const { data, error } = await supabase
    .from('revops_gl_reviews')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating AI GL review:', error)
    throw new Error(`Failed to create AI GL review: ${error.message}`)
  }

  return (data as { id: string }).id
}

/**
 * Upsert AI GL review (create or update)
 * Used by n8n workflow when it might need to overwrite existing data
 */
export async function upsertAIGLReview(
  dealId: string,
  formData: GLReviewFormData,
  fieldConfidence: GLReviewFieldConfidence | null = null,
  qboClientName: string | null = null
): Promise<string> {
  const upsertData: RevOpsGLReviewInsert = {
    deal_id: dealId,
    review_type: 'ai',
    ...formDataToDbColumns(formData),
    field_confidence: (fieldConfidence || {}) as unknown as Json,
    qbo_client_name: qboClientName,
    qbo_access_confirmed_at: qboClientName ? new Date().toISOString() : null,
    is_auto_filled: true,
    auto_filled_at: new Date().toISOString(),
    is_confirmed: false,
    confirmed_at: null,
  }

  const { data, error } = await supabase
    .from('revops_gl_reviews')
    .upsert(upsertData as never, {
      onConflict: 'deal_id,review_type',
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting AI GL review:', error)
    throw new Error(`Failed to upsert AI GL review: ${error.message}`)
  }

  return (data as { id: string }).id
}

/**
 * Create a team GL review
 * Used by Google Apps Script webhook from form submission
 */
export async function createTeamGLReview(
  dealId: string,
  formData: GLReviewFormData,
  submittedBy: string,
  googleFormResponseId?: string
): Promise<string> {
  const insertData: RevOpsGLReviewInsert = {
    deal_id: dealId,
    review_type: 'team',
    ...formDataToDbColumns(formData),
    submitted_by: submittedBy,
    google_form_response_id: googleFormResponseId || null,
    is_auto_filled: false,
    is_confirmed: false,
    confirmed_at: null,
  }

  const { data, error } = await supabase
    .from('revops_gl_reviews')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating team GL review:', error)
    throw new Error(`Failed to create team GL review: ${error.message}`)
  }

  return (data as { id: string }).id
}

/**
 * Upsert team GL review (create or update)
 * Used by Google Apps Script when form might be resubmitted
 */
export async function upsertTeamGLReview(
  dealId: string,
  formData: GLReviewFormData,
  submittedBy: string,
  googleFormResponseId?: string
): Promise<string> {
  const upsertData: RevOpsGLReviewInsert = {
    deal_id: dealId,
    review_type: 'team',
    ...formDataToDbColumns(formData),
    submitted_by: submittedBy,
    google_form_response_id: googleFormResponseId || null,
    is_auto_filled: false,
    is_confirmed: false,
    confirmed_at: null,
  }

  const { data, error } = await supabase
    .from('revops_gl_reviews')
    .upsert(upsertData as never, {
      onConflict: 'deal_id,review_type',
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting team GL review:', error)
    throw new Error(`Failed to upsert team GL review: ${error.message}`)
  }

  return (data as { id: string }).id
}

/**
 * Create or update the final GL review
 * Used when user completes the comparison
 */
export async function saveFinalGLReview(
  dealId: string,
  formData: GLReviewFormData,
  fieldSelections: GLReviewComparisonSelections,
  customValues: GLReviewCustomValues,
  confirmedBy: string
): Promise<string> {
  const upsertData: RevOpsGLReviewInsert = {
    deal_id: dealId,
    review_type: 'final',
    ...formDataToDbColumns(formData),
    field_selections: fieldSelections as unknown as Json,
    custom_values: customValues as unknown as Json,
    is_auto_filled: false,
    is_confirmed: true,
    confirmed_at: new Date().toISOString(),
    confirmed_by: confirmedBy,
  }

  const { data, error } = await supabase
    .from('revops_gl_reviews')
    .upsert(upsertData as never, {
      onConflict: 'deal_id,review_type',
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving final GL review:', error)
    throw new Error(`Failed to save final GL review: ${error.message}`)
  }

  return (data as { id: string }).id
}

/**
 * Update GL review form data (for user edits before confirming)
 */
export async function updateGLReview(
  dealId: string,
  reviewType: GLReviewType,
  formData: GLReviewFormData,
  fieldConfidence?: GLReviewFieldConfidence | null
): Promise<void> {
  const updateData: RevOpsGLReviewUpdate = {
    ...formDataToDbColumns(formData),
    updated_at: new Date().toISOString(),
  }

  if (fieldConfidence !== undefined) {
    updateData.field_confidence = (fieldConfidence || {}) as unknown as Json
  }

  const { error } = await supabase
    .from('revops_gl_reviews')
    .update(updateData as never)
    .eq('deal_id', dealId)
    .eq('review_type', reviewType)

  if (error) {
    console.error('Error updating GL review:', error)
    throw new Error(`Failed to update GL review: ${error.message}`)
  }
}

/**
 * Confirm AI GL review (user reviewed and confirmed)
 */
export async function confirmAIGLReview(dealId: string, confirmedBy: string): Promise<void> {
  const { error } = await supabase
    .from('revops_gl_reviews')
    .update({
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
      confirmed_by: confirmedBy,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('deal_id', dealId)
    .eq('review_type', 'ai')

  if (error) {
    console.error('Error confirming AI GL review:', error)
    throw new Error(`Failed to confirm AI GL review: ${error.message}`)
  }
}

/**
 * Delete GL review by deal ID and type (for reset functionality)
 */
export async function deleteGLReview(dealId: string, reviewType: GLReviewType): Promise<void> {
  const { error } = await supabase
    .from('revops_gl_reviews')
    .delete()
    .eq('deal_id', dealId)
    .eq('review_type', reviewType)

  if (error) {
    console.error('Error deleting GL review:', error)
    throw new Error(`Failed to delete GL review: ${error.message}`)
  }
}

/**
 * Delete all GL reviews for a deal (full reset)
 */
export async function deleteAllGLReviewsForDeal(dealId: string): Promise<void> {
  const { error } = await supabase
    .from('revops_gl_reviews')
    .delete()
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error deleting all GL reviews:', error)
    throw new Error(`Failed to delete all GL reviews: ${error.message}`)
  }
}

/**
 * Record QBO access confirmation (when user confirms they authorized in MCP dashboard)
 */
export async function recordQBOAccessConfirmation(
  dealId: string,
  qboClientName: string
): Promise<void> {
  // First check if an AI review exists
  const existing = await fetchGLReviewByDealIdAndType(dealId, 'ai')

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('revops_gl_reviews')
      .update({
        qbo_client_name: qboClientName,
        qbo_access_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('deal_id', dealId)
      .eq('review_type', 'ai')

    if (error) {
      console.error('Error recording QBO access confirmation:', error)
      throw new Error(`Failed to record QBO access: ${error.message}`)
    }
  } else {
    // Create new record with just QBO access info
    const insertData: RevOpsGLReviewInsert = {
      deal_id: dealId,
      review_type: 'ai',
      qbo_client_name: qboClientName,
      qbo_access_confirmed_at: new Date().toISOString(),
      is_auto_filled: false,
      is_confirmed: false,
    }

    const { error } = await supabase
      .from('revops_gl_reviews')
      .insert(insertData as never)

    if (error) {
      console.error('Error creating QBO access record:', error)
      throw new Error(`Failed to create QBO access record: ${error.message}`)
    }
  }
}
