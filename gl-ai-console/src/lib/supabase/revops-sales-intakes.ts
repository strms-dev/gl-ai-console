import { supabase } from './client'
import type { RevOpsSalesIntake, RevOpsSalesIntakeInsert, RevOpsSalesIntakeUpdate, Json } from './types'
import type { SalesIntakeFormData, FieldConfidence } from '@/lib/sales-pipeline-timeline-types'

/**
 * Convert SalesIntakeFormData (camelCase) to database columns (snake_case)
 */
function formDataToDbColumns(formData: SalesIntakeFormData): Partial<RevOpsSalesIntakeInsert> {
  return {
    company_name: formData.companyName || null,
    contact_name: formData.contactName || null,
    email_address: formData.emailAddress || null,
    entity_type: formData.entityType || null,
    has_restricted_grants: formData.hasRestrictedGrants || null,
    uses_qbo_or_xero: formData.usesQboOrXero || null,
    accounting_platform: formData.accountingPlatform || null,
    accounting_basis: formData.accountingBasis || null,
    bookkeeping_cadence: formData.bookkeepingCadence || null,
    needs_financials_before_15th: formData.needsFinancialsBefore15th || null,
    financial_review_frequency: formData.financialReviewFrequency || null,
    payroll_provider: formData.payrollProvider || null,
    has_401k: formData.has401k || null,
    payroll_departments: formData.payrollDepartments || null,
    employee_count: formData.employeeCount || null,
    tracks_expenses_by_employee: formData.tracksExpensesByEmployee || null,
    expense_platform: formData.expensePlatform || null,
    expense_platform_employees: formData.expensePlatformEmployees || null,
    needs_bill_pay_support: formData.needsBillPaySupport || null,
    bill_pay_cadence: formData.billPayCadence || null,
    bills_per_month: formData.billsPerMonth || null,
    needs_invoicing_support: formData.needsInvoicingSupport || null,
    invoicing_cadence: formData.invoicingCadence || null,
    invoices_per_month: formData.invoicesPerMonth || null,
    interested_in_cfo_review: formData.interestedInCfoReview || null,
    additional_notes: formData.additionalNotes || null,
    fireflies_video_link: formData.firefliesVideoLink || null,
  }
}

/**
 * Convert database row (snake_case) to SalesIntakeFormData (camelCase)
 */
function dbRowToFormData(row: RevOpsSalesIntake): SalesIntakeFormData {
  return {
    companyName: row.company_name || '',
    contactName: row.contact_name || '',
    emailAddress: row.email_address || '',
    entityType: (row.entity_type || '') as SalesIntakeFormData['entityType'],
    hasRestrictedGrants: (row.has_restricted_grants || '') as SalesIntakeFormData['hasRestrictedGrants'],
    usesQboOrXero: (row.uses_qbo_or_xero || '') as SalesIntakeFormData['usesQboOrXero'],
    accountingPlatform: (row.accounting_platform || '') as SalesIntakeFormData['accountingPlatform'],
    accountingBasis: (row.accounting_basis || '') as SalesIntakeFormData['accountingBasis'],
    bookkeepingCadence: (row.bookkeeping_cadence || '') as SalesIntakeFormData['bookkeepingCadence'],
    needsFinancialsBefore15th: (row.needs_financials_before_15th || '') as SalesIntakeFormData['needsFinancialsBefore15th'],
    financialReviewFrequency: (row.financial_review_frequency || '') as SalesIntakeFormData['financialReviewFrequency'],
    payrollProvider: (row.payroll_provider || '') as SalesIntakeFormData['payrollProvider'],
    has401k: (row.has_401k || '') as SalesIntakeFormData['has401k'],
    payrollDepartments: (row.payroll_departments || '') as SalesIntakeFormData['payrollDepartments'],
    employeeCount: (row.employee_count || '') as SalesIntakeFormData['employeeCount'],
    tracksExpensesByEmployee: (row.tracks_expenses_by_employee || '') as SalesIntakeFormData['tracksExpensesByEmployee'],
    expensePlatform: (row.expense_platform || '') as SalesIntakeFormData['expensePlatform'],
    expensePlatformEmployees: (row.expense_platform_employees || '') as SalesIntakeFormData['expensePlatformEmployees'],
    needsBillPaySupport: (row.needs_bill_pay_support || '') as SalesIntakeFormData['needsBillPaySupport'],
    billPayCadence: (row.bill_pay_cadence || '') as SalesIntakeFormData['billPayCadence'],
    billsPerMonth: (row.bills_per_month || '') as SalesIntakeFormData['billsPerMonth'],
    needsInvoicingSupport: (row.needs_invoicing_support || '') as SalesIntakeFormData['needsInvoicingSupport'],
    invoicingCadence: (row.invoicing_cadence || '') as SalesIntakeFormData['invoicingCadence'],
    invoicesPerMonth: (row.invoices_per_month || '') as SalesIntakeFormData['invoicesPerMonth'],
    interestedInCfoReview: (row.interested_in_cfo_review || '') as SalesIntakeFormData['interestedInCfoReview'],
    additionalNotes: row.additional_notes || '',
    firefliesVideoLink: row.fireflies_video_link || '',
  }
}

/**
 * Response type for fetching sales intake data
 */
export interface SalesIntakeResult {
  formData: SalesIntakeFormData
  fieldConfidence: FieldConfidence | null
  isAutoFilled: boolean
  autoFilledAt: string | null
  isConfirmed: boolean
  confirmedAt: string | null
}

/**
 * Fetch sales intake by deal ID
 * Returns null if no intake exists for this deal
 */
export async function fetchSalesIntakeByDealId(dealId: string): Promise<SalesIntakeResult | null> {
  const { data, error } = await supabase
    .from('revops_sales_intakes')
    .select('*')
    .eq('deal_id', dealId)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is a valid "not found" case
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching sales intake:', error)
    throw new Error(`Failed to fetch sales intake: ${error.message}`)
  }

  const row = data as RevOpsSalesIntake

  return {
    formData: dbRowToFormData(row),
    fieldConfidence: row.field_confidence as FieldConfidence | null,
    isAutoFilled: row.is_auto_filled,
    autoFilledAt: row.auto_filled_at,
    isConfirmed: row.is_confirmed,
    confirmedAt: row.confirmed_at,
  }
}

/**
 * Create a new sales intake record
 * Used by n8n workflow for AI auto-fill
 */
export async function createSalesIntake(
  dealId: string,
  formData: SalesIntakeFormData,
  fieldConfidence: FieldConfidence | null = null,
  isAutoFilled: boolean = false
): Promise<string> {
  const insertData: RevOpsSalesIntakeInsert = {
    deal_id: dealId,
    ...formDataToDbColumns(formData),
    field_confidence: (fieldConfidence || {}) as unknown as Json,
    is_auto_filled: isAutoFilled,
    auto_filled_at: isAutoFilled ? new Date().toISOString() : null,
    is_confirmed: false,
    confirmed_at: null,
  }

  const { data, error } = await supabase
    .from('revops_sales_intakes')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating sales intake:', error)
    throw new Error(`Failed to create sales intake: ${error.message}`)
  }

  return (data as { id: string }).id
}

/**
 * Upsert sales intake (create or update)
 * Used by n8n workflow when it might need to overwrite existing data
 */
export async function upsertSalesIntake(
  dealId: string,
  formData: SalesIntakeFormData,
  fieldConfidence: FieldConfidence | null = null,
  isAutoFilled: boolean = false
): Promise<string> {
  const upsertData: RevOpsSalesIntakeInsert = {
    deal_id: dealId,
    ...formDataToDbColumns(formData),
    field_confidence: (fieldConfidence || {}) as unknown as Json,
    is_auto_filled: isAutoFilled,
    auto_filled_at: isAutoFilled ? new Date().toISOString() : null,
    is_confirmed: false,
    confirmed_at: null,
  }

  const { data, error } = await supabase
    .from('revops_sales_intakes')
    .upsert(upsertData as never, {
      onConflict: 'deal_id',
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting sales intake:', error)
    throw new Error(`Failed to upsert sales intake: ${error.message}`)
  }

  return (data as { id: string }).id
}

/**
 * Update sales intake form data (for user edits)
 */
export async function updateSalesIntakeSupabase(
  dealId: string,
  formData: SalesIntakeFormData,
  fieldConfidence?: FieldConfidence | null
): Promise<void> {
  const updateData: RevOpsSalesIntakeUpdate = {
    ...formDataToDbColumns(formData),
    updated_at: new Date().toISOString(),
  }

  if (fieldConfidence !== undefined) {
    updateData.field_confidence = (fieldConfidence || {}) as unknown as Json
  }

  const { error } = await supabase
    .from('revops_sales_intakes')
    .update(updateData as never)
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error updating sales intake:', error)
    throw new Error(`Failed to update sales intake: ${error.message}`)
  }
}

/**
 * Confirm sales intake (user reviewed and confirmed)
 */
export async function confirmSalesIntakeSupabase(dealId: string): Promise<void> {
  const { error } = await supabase
    .from('revops_sales_intakes')
    .update({
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error confirming sales intake:', error)
    throw new Error(`Failed to confirm sales intake: ${error.message}`)
  }
}

/**
 * Delete sales intake (for reset functionality)
 */
export async function deleteSalesIntakeSupabase(dealId: string): Promise<void> {
  const { error } = await supabase
    .from('revops_sales_intakes')
    .delete()
    .eq('deal_id', dealId)

  if (error) {
    console.error('Error deleting sales intake:', error)
    throw new Error(`Failed to delete sales intake: ${error.message}`)
  }
}
