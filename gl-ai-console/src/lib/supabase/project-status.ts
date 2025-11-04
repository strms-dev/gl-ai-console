import { supabase } from './client'
import type { ProjectStatus } from './types'

/**
 * Update the project status in the database
 */
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  const { error } = await supabase
    .from('strms_projects')
    .update({
      project_status: status,
      updated_at: new Date().toISOString()
    } as never)
    .eq('id', projectId)

  if (error) {
    console.error('Error updating project status:', error)
    throw new Error(`Failed to update project status: ${error.message}`)
  }
}

/**
 * Get the project status from the database
 */
export async function getProjectStatus(projectId: string): Promise<ProjectStatus> {
  const { data, error } = await supabase
    .from('strms_projects')
    .select('project_status')
    .eq('id', projectId)
    .single() as { data: { project_status: ProjectStatus } | null, error: Error | null }

  if (error) {
    console.error('Error getting project status:', error)
    throw new Error(`Failed to get project status: ${error.message}`)
  }

  return (data?.project_status as ProjectStatus) || 'active'
}
