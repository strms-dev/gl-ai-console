import { supabase } from '@/lib/supabase-client'
import {
  MaintenanceTicket,
  MaintenanceTicketRow,
  MaintenanceStatus,
  Developer,
  TicketType,
  Platform
} from '@/lib/types'

/**
 * Calculate relative time from timestamp (e.g., "2 hours ago")
 */
function getRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`

  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
}

/**
 * Convert database row to MaintenanceTicket interface
 */
function rowToTicket(row: MaintenanceTicketRow, timeTracked: number = 0): MaintenanceTicket {
  return {
    id: row.id,
    ticketTitle: row.ticket_title || '',
    customer: row.customer || '',
    ticketType: (row.ticket_type as TicketType) || 'Maintenance',
    platform: (row.platform as Platform) || '',
    numberOfErrors: row.number_of_errors,
    status: (row.status as MaintenanceStatus) || 'errors-logged',
    assignee: (row.assignee as Developer) || 'Nick',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    timeTracked,
    priority: row.priority,
    notes: row.notes || '',
    errorMessage: row.error_message || '',
    lastActivity: getRelativeTime(row.updated_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedDate: row.completed_date || undefined
  }
}

/**
 * Get time tracked for a specific ticket
 */
async function getTimeTrackedForTicket(ticketId: string): Promise<number> {
  const { data, error } = await supabase
    .from('strms_time_entries')
    .select('duration')
    .eq('project_id', ticketId)
    .eq('project_type', 'maintenance')

  if (error) {
    console.error('Error fetching time tracked:', error)
    return 0
  }

  return data?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
}

/**
 * Get all maintenance tickets with time tracking totals
 */
export async function getMaintTickets(): Promise<MaintenanceTicket[]> {
  const { data, error } = await supabase
    .from('strms_maintenance_tickets')
    .select('*')
    .order('priority', { ascending: true })

  if (error) {
    console.error('Error fetching maintenance tickets:', error)
    throw new Error('Failed to fetch maintenance tickets')
  }

  if (!data) return []

  // Fetch time tracked for all tickets in parallel
  const ticketsWithTime = await Promise.all(
    data.map(async (row) => {
      const timeTracked = await getTimeTrackedForTicket(row.id)
      return rowToTicket(row as MaintenanceTicketRow, timeTracked)
    })
  )

  return ticketsWithTime
}

/**
 * Get a single maintenance ticket by ID with time tracking
 */
export async function getMaintTicketById(id: string): Promise<MaintenanceTicket | null> {
  const { data, error } = await supabase
    .from('strms_maintenance_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching maintenance ticket:', error)
    return null
  }

  if (!data) return null

  const timeTracked = await getTimeTrackedForTicket(id)
  return rowToTicket(data as MaintenanceTicketRow, timeTracked)
}

/**
 * Create a new maintenance ticket
 */
export async function createMaintTicket(
  ticket: Partial<Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'timeTracked'>>
): Promise<MaintenanceTicket> {
  const now = new Date().toISOString()

  // If ticket is created with a closed status, set completedDate
  const completedDate = ticket.status === "closed" ? now : null

  const { data, error } = await supabase
    .from('strms_maintenance_tickets')
    .insert({
      ticket_title: ticket.ticketTitle || null,
      customer: ticket.customer || null,
      ticket_type: ticket.ticketType || null,
      platform: ticket.platform || null,
      number_of_errors: ticket.numberOfErrors || 0,
      status: ticket.status || null,
      assignee: ticket.assignee || null,
      start_date: ticket.startDate || null,
      end_date: ticket.endDate || null,
      priority: ticket.priority || 0,
      notes: ticket.notes || null,
      error_message: ticket.errorMessage || null,
      completed_date: completedDate
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating maintenance ticket:', error)
    throw new Error('Failed to create maintenance ticket')
  }

  return rowToTicket(data as MaintenanceTicketRow, 0)
}

/**
 * Update an existing maintenance ticket
 */
export async function updateMaintTicket(
  id: string,
  updates: Partial<Omit<MaintenanceTicket, 'id' | 'createdAt' | 'timeTracked' | 'lastActivity'>>
): Promise<MaintenanceTicket> {
  // Fetch current ticket to check status change
  const { data: currentData } = await supabase
    .from('strms_maintenance_tickets')
    .select('status, completed_date')
    .eq('id', id)
    .single()

  const now = new Date().toISOString()

  // If status is being changed to closed, set completedDate
  let completedDate = currentData?.completed_date
  if (updates.status && updates.status === "closed" && currentData?.status !== "closed") {
    completedDate = now
  }

  const { data, error } = await supabase
    .from('strms_maintenance_tickets')
    .update({
      ticket_title: updates.ticketTitle !== undefined ? updates.ticketTitle || null : undefined,
      customer: updates.customer !== undefined ? updates.customer || null : undefined,
      ticket_type: updates.ticketType !== undefined ? updates.ticketType || null : undefined,
      platform: updates.platform !== undefined ? updates.platform || null : undefined,
      number_of_errors: updates.numberOfErrors !== undefined ? updates.numberOfErrors : undefined,
      status: updates.status !== undefined ? updates.status || null : undefined,
      assignee: updates.assignee !== undefined ? updates.assignee || null : undefined,
      start_date: updates.startDate !== undefined ? updates.startDate || null : undefined,
      end_date: updates.endDate !== undefined ? updates.endDate || null : undefined,
      priority: updates.priority !== undefined ? updates.priority : undefined,
      notes: updates.notes !== undefined ? updates.notes || null : undefined,
      error_message: updates.errorMessage !== undefined ? updates.errorMessage || null : undefined,
      completed_date: completedDate
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating maintenance ticket:', error)
    throw new Error('Failed to update maintenance ticket')
  }

  const timeTracked = await getTimeTrackedForTicket(id)
  return rowToTicket(data as MaintenanceTicketRow, timeTracked)
}

/**
 * Delete a maintenance ticket and associated time entries
 */
export async function deleteMaintTicket(id: string): Promise<void> {
  // First delete associated time entries
  const { error: timeError } = await supabase
    .from('strms_time_entries')
    .delete()
    .eq('project_id', id)
    .eq('project_type', 'maintenance')

  if (timeError) {
    console.error('Error deleting time entries:', timeError)
    throw new Error('Failed to delete associated time entries')
  }

  // Then delete the ticket
  const { error } = await supabase
    .from('strms_maintenance_tickets')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting maintenance ticket:', error)
    throw new Error('Failed to delete maintenance ticket')
  }
}

/**
 * Update priority for a maintenance ticket
 */
export async function updateMaintTicketPriority(id: string, priority: number): Promise<void> {
  const { error } = await supabase
    .from('strms_maintenance_tickets')
    .update({ priority })
    .eq('id', id)

  if (error) {
    console.error('Error updating priority:', error)
    throw new Error('Failed to update ticket priority')
  }
}

/**
 * Get maintenance tickets by assignee with optional filter for completed
 */
export async function getMaintTicketsByAssignee(
  assignee: Developer,
  includeCompleted: boolean = false
): Promise<MaintenanceTicket[]> {
  let query = supabase
    .from('strms_maintenance_tickets')
    .select('*')
    .eq('assignee', assignee)

  if (!includeCompleted) {
    query = query.not('status', 'in', '(closed)')
  }

  query = query.order('priority', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching maintenance tickets by assignee:', error)
    throw new Error('Failed to fetch maintenance tickets')
  }

  if (!data) return []

  // Fetch time tracked for all tickets in parallel
  const ticketsWithTime = await Promise.all(
    data.map(async (row) => {
      const timeTracked = await getTimeTrackedForTicket(row.id)
      return rowToTicket(row as MaintenanceTicketRow, timeTracked)
    })
  )

  return ticketsWithTime
}
