import { supabase } from './client'
import type { RevOpsFollowUpEmail, RevOpsFollowUpEmailInsert, RevOpsFollowUpEmailUpdate } from './types'

/**
 * Result type for fetching follow-up email data
 */
export interface FollowUpEmailResult {
  templateType: "qbo" | "xero" | "other" | null
  toEmail: string
  ccEmail: string
  emailSubject: string
  emailBody: string
  isEdited: boolean
  sentAt: string | null
  hubspotDealMoved: boolean
  hubspotDealMovedAt: string | null
}

/**
 * Convert database row to result format
 */
function dbRowToResult(row: RevOpsFollowUpEmail): FollowUpEmailResult {
  return {
    templateType: row.template_type as "qbo" | "xero" | "other" | null,
    toEmail: row.to_email,
    ccEmail: row.cc_email,
    emailSubject: row.email_subject,
    emailBody: row.email_body,
    isEdited: row.is_edited,
    sentAt: row.sent_at,
    hubspotDealMoved: row.hubspot_deal_moved,
    hubspotDealMovedAt: row.hubspot_deal_moved_at,
  }
}

/**
 * Fetch follow-up email by deal ID
 * Returns null if no record exists for this deal
 */
export async function fetchFollowUpEmailByDealId(dealId: string): Promise<FollowUpEmailResult | null> {
  const { data, error } = await supabase
    .from('revops_follow_up_emails')
    .select('*')
    .eq('deal_id', dealId)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is a valid "not found" case
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching follow-up email:', error)
    throw new Error(`Failed to fetch follow-up email: ${error.message}`)
  }

  return dbRowToResult(data as RevOpsFollowUpEmail)
}

/**
 * Initialize follow-up email with template data
 * Creates a new record or updates existing
 */
export async function initializeFollowUpEmailSupabase(
  dealId: string,
  templateType: "qbo" | "xero" | "other",
  toEmail: string,
  ccEmail: string,
  subject: string,
  body: string
): Promise<string> {
  // First check if a record already exists for this deal
  const { data: existing } = await supabase
    .from('revops_follow_up_emails')
    .select('id')
    .eq('deal_id', dealId)
    .single()

  if (existing) {
    // Update existing record
    console.log('Updating existing follow-up email record for deal:', dealId)
    const { data, error } = await supabase
      .from('revops_follow_up_emails')
      .update({
        template_type: templateType,
        to_email: toEmail,
        cc_email: ccEmail,
        email_subject: subject,
        email_body: body,
        is_edited: false,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('deal_id', dealId)
      .select()
      .single()

    if (error) {
      console.error('Error updating follow-up email:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to update follow-up email: ${error.message}`)
    }

    console.log('Successfully updated follow-up email:', data)
    return (data as { id: string }).id
  } else {
    // Insert new record
    console.log('Inserting new follow-up email record for deal:', dealId)
    const insertData: RevOpsFollowUpEmailInsert = {
      deal_id: dealId,
      template_type: templateType,
      to_email: toEmail,
      cc_email: ccEmail,
      email_subject: subject,
      email_body: body,
      is_edited: false,
      sent_at: null,
      hubspot_deal_moved: false,
      hubspot_deal_moved_at: null,
    }
    console.log('Insert data:', insertData)

    const { data, error } = await supabase
      .from('revops_follow_up_emails')
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      console.error('Error inserting follow-up email:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      console.error('Error code:', error.code)
      console.error('Error hint:', error.hint)
      throw new Error(`Failed to insert follow-up email: ${error.message}`)
    }

    console.log('Successfully inserted follow-up email:', data)
    return (data as { id: string }).id
  }
}

/**
 * Update follow-up email content (for user edits)
 */
export async function updateFollowUpEmailSupabase(
  dealId: string,
  toEmail: string,
  ccEmail: string,
  subject: string,
  body: string
): Promise<void> {
  const updateData: RevOpsFollowUpEmailUpdate = {
    to_email: toEmail,
    cc_email: ccEmail,
    email_subject: subject,
    email_body: body,
    is_edited: true,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('revops_follow_up_emails')
    .update(updateData as never)
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error updating follow-up email:', error)
    throw new Error(`Failed to update follow-up email: ${error.message}`)
  }
}

/**
 * Mark follow-up email as sent
 */
export async function markFollowUpEmailSentSupabase(dealId: string): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('revops_follow_up_emails')
    .update({
      sent_at: now,
      updated_at: now,
    } as never)
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error marking follow-up email as sent:', error)
    throw new Error(`Failed to mark follow-up email as sent: ${error.message}`)
  }
}

/**
 * Mark HubSpot deal as moved to Need Info stage
 */
export async function markHubspotDealMovedSupabase(dealId: string): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('revops_follow_up_emails')
    .update({
      hubspot_deal_moved: true,
      hubspot_deal_moved_at: now,
      updated_at: now,
    } as never)
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error marking HubSpot deal as moved:', error)
    throw new Error(`Failed to mark HubSpot deal as moved: ${error.message}`)
  }
}

/**
 * Delete follow-up email (for reset functionality)
 */
export async function deleteFollowUpEmailSupabase(dealId: string): Promise<void> {
  const { error } = await supabase
    .from('revops_follow_up_emails')
    .delete()
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error deleting follow-up email:', error)
    throw new Error(`Failed to delete follow-up email: ${error.message}`)
  }
}
