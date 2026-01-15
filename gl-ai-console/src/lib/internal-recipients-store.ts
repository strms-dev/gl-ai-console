"use client"

// Managed Internal Recipients Store
// Stores the pool of team members available for Internal Team Assignment
// Uses Supabase for persistence

import { supabase } from './supabase/client'

export interface ManagedRecipient {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
}

// Get all managed recipients from Supabase
export async function getManagedRecipients(): Promise<ManagedRecipient[]> {
  const { data, error } = await supabase
    .from('revops_internal_team_members')
    .select('id, name, email, is_active, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at
  }))
}

// Get only active recipients (for display in selection UI)
export async function getActiveRecipients(): Promise<ManagedRecipient[]> {
  const { data, error } = await supabase
    .from('revops_internal_team_members')
    .select('id, name, email, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching active team members:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at
  }))
}

// Add a new recipient to the pool
export async function addManagedRecipient(name: string, email: string): Promise<ManagedRecipient | null> {
  const { data, error } = await supabase
    .from('revops_internal_team_members')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      is_active: true
    } as never)
    .select('id, name, email, is_active, created_at')
    .single()

  if (error) {
    console.error('Error adding team member:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    isActive: data.is_active,
    createdAt: data.created_at
  }
}

// Update an existing recipient
export async function updateManagedRecipient(
  id: string,
  updates: Partial<Pick<ManagedRecipient, "name" | "email" | "isActive">>
): Promise<ManagedRecipient | null> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  if (updates.name !== undefined) updateData.name = updates.name.trim()
  if (updates.email !== undefined) updateData.email = updates.email.trim().toLowerCase()
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive

  const { data, error } = await supabase
    .from('revops_internal_team_members')
    .update(updateData as never)
    .eq('id', id)
    .select('id, name, email, is_active, created_at')
    .single()

  if (error) {
    console.error('Error updating team member:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    isActive: data.is_active,
    createdAt: data.created_at
  }
}

// Delete a recipient from the pool
export async function deleteManagedRecipient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('revops_internal_team_members')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting team member:', error)
    return false
  }

  return true
}

// Toggle recipient active status
export async function toggleRecipientActive(id: string): Promise<ManagedRecipient | null> {
  // First get current state
  const { data: current, error: fetchError } = await supabase
    .from('revops_internal_team_members')
    .select('is_active')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    console.error('Error fetching team member:', fetchError)
    return null
  }

  // Toggle the active status
  return updateManagedRecipient(id, { isActive: !current.is_active })
}

// Check if email already exists in the pool
export async function recipientEmailExists(email: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('revops_internal_team_members')
    .select('id')
    .eq('email', email.toLowerCase())

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking email existence:', error)
    return false
  }

  return (data?.length || 0) > 0
}
