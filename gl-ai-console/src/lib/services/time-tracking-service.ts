import { supabase } from '@/lib/supabase-client'
import {
  TimeEntry,
  TimeEntryRow,
  ProjectType,
  Developer
} from '@/lib/types'

/**
 * Convert database row to TimeEntry interface
 */
function rowToTimeEntry(row: TimeEntryRow): TimeEntry {
  return {
    id: row.id,
    projectId: row.project_id || '',
    projectType: (row.project_type as ProjectType) || 'development',
    assignee: (row.assignee as Developer) || 'Nick',
    duration: row.duration,
    notes: row.notes || '',
    weekStartDate: row.week_start_date || '',
    createdAt: row.created_at
  }
}

/**
 * Get all time entries
 */
export async function getTimeEntries(): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('strms_time_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching time entries:', error)
    throw new Error('Failed to fetch time entries')
  }

  if (!data) return []

  return data.map(row => rowToTimeEntry(row as TimeEntryRow))
}

/**
 * Get time entries for a specific project
 */
export async function getTimeEntriesForProject(
  projectId: string,
  projectType: ProjectType
): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('strms_time_entries')
    .select('*')
    .eq('project_id', projectId)
    .eq('project_type', projectType)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching time entries for project:', error)
    throw new Error('Failed to fetch time entries')
  }

  if (!data) return []

  return data.map(row => rowToTimeEntry(row as TimeEntryRow))
}

/**
 * Get time entries for a specific week with optional assignee filter
 */
export async function getTimeEntriesForWeek(
  weekStartDate: string,
  assignee?: Developer
): Promise<TimeEntry[]> {
  let query = supabase
    .from('strms_time_entries')
    .select('*')
    .eq('week_start_date', weekStartDate)

  if (assignee) {
    query = query.eq('assignee', assignee)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching time entries for week:', error)
    throw new Error('Failed to fetch time entries')
  }

  if (!data) return []

  return data.map(row => rowToTimeEntry(row as TimeEntryRow))
}

/**
 * Create a new time entry
 * @param entry - Time entry data (createdAt is optional for backdating)
 */
export async function createTimeEntry(
  entry: Omit<TimeEntry, 'id' | 'createdAt'> & { createdAt?: string }
): Promise<TimeEntry> {
  // Build insert data - only include created_at if explicitly provided (for backdating)
  const insertData: Record<string, unknown> = {
    project_id: entry.projectId || null,
    project_type: entry.projectType || null,
    assignee: entry.assignee || null,
    duration: entry.duration,
    notes: entry.notes || null,
    week_start_date: entry.weekStartDate || null
  }

  // Only pass created_at when backdating - otherwise let Supabase auto-generate
  if (entry.createdAt) {
    insertData.created_at = entry.createdAt
  }

  const { data, error } = await supabase
    .from('strms_time_entries')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating time entry:', error)
    throw new Error('Failed to create time entry')
  }

  return rowToTimeEntry(data as TimeEntryRow)
}

/**
 * Update an existing time entry
 */
export async function updateTimeEntry(
  id: string,
  updates: Partial<Omit<TimeEntry, 'id' | 'createdAt'>>
): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('strms_time_entries')
    .update({
      project_id: updates.projectId !== undefined ? updates.projectId || null : undefined,
      project_type: updates.projectType !== undefined ? updates.projectType || null : undefined,
      assignee: updates.assignee !== undefined ? updates.assignee || null : undefined,
      duration: updates.duration !== undefined ? updates.duration : undefined,
      notes: updates.notes !== undefined ? updates.notes || null : undefined,
      week_start_date: updates.weekStartDate !== undefined ? updates.weekStartDate || null : undefined
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating time entry:', error)
    throw new Error('Failed to update time entry')
  }

  return rowToTimeEntry(data as TimeEntryRow)
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('strms_time_entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting time entry:', error)
    throw new Error('Failed to delete time entry')
  }
}

/**
 * Calculate total time tracked for a project/ticket
 */
export async function calculateTimeTracked(
  projectId: string,
  projectType: ProjectType
): Promise<number> {
  const { data, error } = await supabase
    .from('strms_time_entries')
    .select('duration')
    .eq('project_id', projectId)
    .eq('project_type', projectType)

  if (error) {
    console.error('Error calculating time tracked:', error)
    return 0
  }

  return data?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
}

/**
 * Get weekly summary with aggregated statistics
 */
export async function getWeeklySummary(weekStartDate: string) {
  const entries = await getTimeEntriesForWeek(weekStartDate)

  // Calculate totals
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0)

  // Nick's breakdown
  const nickEntries = entries.filter(e => e.assignee === 'Nick')
  const nickTotalMinutes = nickEntries.reduce((sum, entry) => sum + entry.duration, 0)
  const nickDevMinutes = nickEntries
    .filter(e => e.projectType === 'development')
    .reduce((sum, entry) => sum + entry.duration, 0)
  const nickMaintMinutes = nickEntries
    .filter(e => e.projectType === 'maintenance')
    .reduce((sum, entry) => sum + entry.duration, 0)

  // Gon's breakdown
  const gonEntries = entries.filter(e => e.assignee === 'Gon')
  const gonTotalMinutes = gonEntries.reduce((sum, entry) => sum + entry.duration, 0)
  const gonDevMinutes = gonEntries
    .filter(e => e.projectType === 'development')
    .reduce((sum, entry) => sum + entry.duration, 0)
  const gonMaintMinutes = gonEntries
    .filter(e => e.projectType === 'maintenance')
    .reduce((sum, entry) => sum + entry.duration, 0)

  return {
    totalMinutes,
    nick: {
      totalMinutes: nickTotalMinutes,
      developmentMinutes: nickDevMinutes,
      maintenanceMinutes: nickMaintMinutes
    },
    gon: {
      totalMinutes: gonTotalMinutes,
      developmentMinutes: gonDevMinutes,
      maintenanceMinutes: gonMaintMinutes
    },
    entries
  }
}

/**
 * Get the start date (Monday) of the week containing the given date
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0] // Return YYYY-MM-DD format
}

/**
 * Format minutes to human-readable time (e.g., "2h 30m")
 */
export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0m"

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Format date string (YYYY-MM-DD) to localized date without timezone conversion
 * This prevents dates from shifting due to timezone offsets
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ""

  // Parse the date string as local date (YYYY-MM-DD format)
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed

  return date.toLocaleDateString()
}
