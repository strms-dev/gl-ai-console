/**
 * Supabase CRUD operations for offboarding customers
 * Replaces localStorage with Supabase database operations
 */

import { supabase } from './supabase-client'
import type {
  OffboardingCustomer,
  OffboardingCustomerRow,
  OffboardingCustomerInsert,
  OffboardingCustomerUpdate,
  OffboardingCompletionDates,
  OffboardingCompletionDateRow,
  OffboardingCompletionDateInsert,
  OffboardingChecklistItem,
  OffboardingChecklistItemRow,
  OffboardingChecklistItemInsert,
} from './offboarding-types'
import {
  rowToCustomer,
  customerToInsert,
  customerToUpdate,
  completionDatesRowsToObject,
} from './offboarding-types'

// ============================================================================
// Customer CRUD Operations
// ============================================================================

export async function getCustomers(): Promise<OffboardingCustomer[]> {
  const { data, error } = await supabase
    .from('strms_offboarding_customers')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  return (data as OffboardingCustomerRow[]).map(rowToCustomer)
}

export async function getCustomerById(id: string): Promise<OffboardingCustomer | undefined> {
  const { data, error } = await supabase
    .from('strms_offboarding_customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - customer not found
      return undefined
    }
    console.error('Error fetching customer:', error)
    throw new Error(`Failed to fetch customer: ${error.message}`)
  }

  return rowToCustomer(data as OffboardingCustomerRow)
}

export async function addCustomer(customer: Omit<OffboardingCustomer, 'id' | 'createdAt' | 'updatedAt'>): Promise<OffboardingCustomer> {
  const now = new Date().toISOString()
  const newCustomer: OffboardingCustomer = {
    ...customer,
    id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  }

  const insertData = customerToInsert(newCustomer)

  const { data, error } = await supabase
    .from('strms_offboarding_customers')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    console.error('Error adding customer:', error)
    throw new Error(`Failed to add customer: ${error.message}`)
  }

  return rowToCustomer(data as OffboardingCustomerRow)
}

export async function updateCustomer(id: string, updates: Partial<OffboardingCustomer>): Promise<OffboardingCustomer> {
  // Add updated_at timestamp
  const updatesWithTimestamp = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const updateData = customerToUpdate(updatesWithTimestamp)

  const { data, error } = await supabase
    .from('strms_offboarding_customers')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    throw new Error(`Failed to update customer: ${error.message}`)
  }

  return rowToCustomer(data as OffboardingCustomerRow)
}

export async function deleteCustomer(id: string): Promise<void> {
  // Cascade delete will handle completion_dates and checklist_items
  const { error } = await supabase
    .from('strms_offboarding_customers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting customer:', error)
    throw new Error(`Failed to delete customer: ${error.message}`)
  }
}

// ============================================================================
// Completion Dates Operations
// ============================================================================

export async function getCompletionDates(customerId: string): Promise<OffboardingCompletionDates> {
  const { data, error } = await supabase
    .from('strms_offboarding_completion_dates')
    .select('*')
    .eq('customer_id', customerId)

  if (error) {
    console.error('Error fetching completion dates:', error)
    throw new Error(`Failed to fetch completion dates: ${error.message}`)
  }

  return completionDatesRowsToObject(data as OffboardingCompletionDateRow[])
}

export async function updateCompletionDate(
  customerId: string,
  stageId: string,
  date: string
): Promise<void> {
  const insertData: OffboardingCompletionDateInsert = {
    customer_id: customerId,
    stage_id: stageId,
    completed_at: date,
  }

  const { error } = await supabase
    .from('strms_offboarding_completion_dates')
    .upsert(insertData as never, {
      onConflict: 'customer_id,stage_id'
    })

  if (error) {
    console.error('Error updating completion date:', error)
    throw new Error(`Failed to update completion date: ${error.message}`)
  }
}

// ============================================================================
// Checklist Operations
// ============================================================================

export async function getChecklistItems(customerId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('strms_offboarding_checklist_items')
    .select('*')
    .eq('customer_id', customerId)

  if (error) {
    console.error('Error fetching checklist items:', error)
    throw new Error(`Failed to fetch checklist items: ${error.message}`)
  }

  const result: Record<string, boolean> = {}
  for (const row of data as OffboardingChecklistItemRow[]) {
    const key = `${row.stage_id}-${row.item_id}`
    result[key] = row.checked
  }

  return result
}

export async function updateChecklistItem(
  customerId: string,
  stageId: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  const insertData: OffboardingChecklistItemInsert = {
    customer_id: customerId,
    stage_id: stageId,
    item_id: itemId,
    checked,
    checked_at: checked ? new Date().toISOString() : null,
  }

  const { error } = await supabase
    .from('strms_offboarding_checklist_items')
    .upsert(insertData as never, {
      onConflict: 'customer_id,stage_id,item_id'
    })

  if (error) {
    console.error('Error updating checklist item:', error)
    throw new Error(`Failed to update checklist item: ${error.message}`)
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export async function clearAllOffboardingData(): Promise<void> {
  // Delete all customers (cascade will handle related tables)
  const { error } = await supabase
    .from('strms_offboarding_customers')
    .delete()
    .neq('id', '') // Delete all rows

  if (error) {
    console.error('Error clearing offboarding data:', error)
    throw new Error(`Failed to clear offboarding data: ${error.message}`)
  }
}
