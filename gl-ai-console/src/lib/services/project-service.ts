import { supabase } from '@/lib/supabase-client'
import {
  DevelopmentProject,
  DevProjectRow,
  DevelopmentStatus,
  Developer,
  SprintLength
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
 * Convert database row to DevelopmentProject interface
 */
function rowToProject(row: DevProjectRow, timeTracked: number = 0): DevelopmentProject {
  return {
    id: row.id,
    projectName: row.project_name || '',
    customer: row.customer || '',
    sprintLength: (row.sprint_length as SprintLength) || '1x',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    status: (row.status as DevelopmentStatus) || 'setup',
    assignee: (row.assignee as Developer) || 'Nick',
    timeTracked,
    priority: row.priority,
    notes: row.notes || '',
    lastActivity: getRelativeTime(row.updated_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedDate: row.completed_date || undefined
  }
}

/**
 * Get time tracked for a specific project
 */
async function getTimeTrackedForProject(projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from('strms_time_entries')
    .select('duration')
    .eq('project_id', projectId)
    .eq('project_type', 'development')

  if (error) {
    console.error('Error fetching time tracked:', error)
    return 0
  }

  return data?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
}

/**
 * Get all development projects with time tracking totals
 */
export async function getDevProjects(): Promise<DevelopmentProject[]> {
  const { data, error } = await supabase
    .from('strms_dev_projects')
    .select('*')
    .order('priority', { ascending: true })

  if (error) {
    console.error('Error fetching dev projects:', error)
    throw new Error('Failed to fetch development projects')
  }

  if (!data) return []

  // Fetch time tracked for all projects in parallel
  const projectsWithTime = await Promise.all(
    data.map(async (row) => {
      const timeTracked = await getTimeTrackedForProject(row.id)
      return rowToProject(row as DevProjectRow, timeTracked)
    })
  )

  return projectsWithTime
}

/**
 * Get a single development project by ID with time tracking
 */
export async function getDevProjectById(id: string): Promise<DevelopmentProject | null> {
  const { data, error } = await supabase
    .from('strms_dev_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching dev project:', error)
    return null
  }

  if (!data) return null

  const timeTracked = await getTimeTrackedForProject(id)
  return rowToProject(data as DevProjectRow, timeTracked)
}

/**
 * Create a new development project
 */
export async function createDevProject(
  project: Partial<Omit<DevelopmentProject, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'timeTracked'>>
): Promise<DevelopmentProject> {
  const now = new Date().toISOString()

  // If project is created with a completed status, set completedDate
  const completedDate = (project.status === "complete" || project.status === "cancelled") ? now : null

  const { data, error } = await supabase
    .from('strms_dev_projects')
    .insert({
      project_name: project.projectName || null,
      customer: project.customer || null,
      sprint_length: project.sprintLength || null,
      start_date: project.startDate || null,
      end_date: project.endDate || null,
      status: project.status || null,
      assignee: project.assignee || null,
      priority: project.priority || 0,
      notes: project.notes || null,
      completed_date: completedDate
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating dev project:', error)
    throw new Error('Failed to create development project')
  }

  return rowToProject(data as DevProjectRow, 0)
}

/**
 * Update an existing development project
 */
export async function updateDevProject(
  id: string,
  updates: Partial<Omit<DevelopmentProject, 'id' | 'createdAt' | 'timeTracked' | 'lastActivity'>>
): Promise<DevelopmentProject> {
  // Fetch current project to check status change
  const { data: currentData } = await supabase
    .from('strms_dev_projects')
    .select('status, completed_date')
    .eq('id', id)
    .single()

  const now = new Date().toISOString()

  // If status is being changed to complete or cancelled, set completedDate
  let completedDate = currentData?.completed_date
  if (updates.status && (updates.status === "complete" || updates.status === "cancelled") && currentData?.status !== updates.status) {
    completedDate = now
  }

  const { data, error } = await supabase
    .from('strms_dev_projects')
    .update({
      project_name: updates.projectName !== undefined ? updates.projectName || null : undefined,
      customer: updates.customer !== undefined ? updates.customer || null : undefined,
      sprint_length: updates.sprintLength !== undefined ? updates.sprintLength || null : undefined,
      start_date: updates.startDate !== undefined ? updates.startDate || null : undefined,
      end_date: updates.endDate !== undefined ? updates.endDate || null : undefined,
      status: updates.status !== undefined ? updates.status || null : undefined,
      assignee: updates.assignee !== undefined ? updates.assignee || null : undefined,
      priority: updates.priority !== undefined ? updates.priority : undefined,
      notes: updates.notes !== undefined ? updates.notes || null : undefined,
      completed_date: completedDate
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating dev project:', error)
    throw new Error('Failed to update development project')
  }

  const timeTracked = await getTimeTrackedForProject(id)
  return rowToProject(data as DevProjectRow, timeTracked)
}

/**
 * Delete a development project and associated time entries
 */
export async function deleteDevProject(id: string): Promise<void> {
  // First delete associated time entries
  const { error: timeError } = await supabase
    .from('strms_time_entries')
    .delete()
    .eq('project_id', id)
    .eq('project_type', 'development')

  if (timeError) {
    console.error('Error deleting time entries:', timeError)
    throw new Error('Failed to delete associated time entries')
  }

  // Then delete the project
  const { error } = await supabase
    .from('strms_dev_projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting dev project:', error)
    throw new Error('Failed to delete development project')
  }
}

/**
 * Update priority for a development project
 */
export async function updateDevProjectPriority(id: string, priority: number): Promise<void> {
  const { error } = await supabase
    .from('strms_dev_projects')
    .update({ priority })
    .eq('id', id)

  if (error) {
    console.error('Error updating priority:', error)
    throw new Error('Failed to update project priority')
  }
}

/**
 * Bulk delete development projects and their associated time entries
 */
export async function bulkDeleteDevProjects(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  // First delete associated time entries for all projects
  const { error: timeError } = await supabase
    .from('strms_time_entries')
    .delete()
    .in('project_id', ids)
    .eq('project_type', 'development')

  if (timeError) {
    console.error('Error bulk deleting time entries:', timeError)
    throw new Error('Failed to delete associated time entries')
  }

  // Then delete the projects
  const { error } = await supabase
    .from('strms_dev_projects')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error bulk deleting dev projects:', error)
    throw new Error('Failed to delete development projects')
  }
}

/**
 * Bulk update status for development projects
 */
export async function bulkUpdateDevProjectStatus(
  ids: string[],
  status: DevelopmentStatus
): Promise<void> {
  if (ids.length === 0) return

  const now = new Date().toISOString()
  const completedDate = (status === "complete" || status === "cancelled") ? now : null

  const { error } = await supabase
    .from('strms_dev_projects')
    .update({
      status,
      completed_date: completedDate,
      updated_at: now
    })
    .in('id', ids)

  if (error) {
    console.error('Error bulk updating status:', error)
    throw new Error('Failed to update project statuses')
  }
}

/**
 * Get development projects by assignee with optional filter for completed
 */
export async function getDevProjectsByAssignee(
  assignee: Developer,
  includeCompleted: boolean = false
): Promise<DevelopmentProject[]> {
  let query = supabase
    .from('strms_dev_projects')
    .select('*')
    .eq('assignee', assignee)

  if (!includeCompleted) {
    query = query.not('status', 'in', '(complete,cancelled)')
  }

  query = query.order('priority', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching dev projects by assignee:', error)
    throw new Error('Failed to fetch development projects')
  }

  if (!data) return []

  // Fetch time tracked for all projects in parallel
  const projectsWithTime = await Promise.all(
    data.map(async (row) => {
      const timeTracked = await getTimeTrackedForProject(row.id)
      return rowToProject(row as DevProjectRow, timeTracked)
    })
  )

  return projectsWithTime
}
