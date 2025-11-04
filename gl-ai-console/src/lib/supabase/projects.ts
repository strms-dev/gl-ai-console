import { supabase } from './client'
import type { Project, ProjectInsert, ProjectUpdate, ProjectWithDetails, ProjectFile, StageData, SprintPricing } from './types'
import { deleteProjectFiles } from './files'

/**
 * Fetch all projects from Supabase
 * Returns projects ordered by last_activity (most recent first)
 */
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('strms_projects')
    .select('*')
    .order('last_activity', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch a single project by ID with all related data
 * Includes files, stage data, and sprint pricing
 */
export async function getProjectById(id: string): Promise<ProjectWithDetails | null> {
  // Fetch main project
  const { data: project, error: projectError } = await supabase
    .from('strms_projects')
    .select('*')
    .eq('id', id)
    .single() as { data: Project | null, error: Error | null }

  if (projectError) {
    console.error('Error fetching project:', projectError)
    throw new Error(`Failed to fetch project: ${projectError.message}`)
  }

  if (!project) {
    return null
  }

  // Fetch related files
  const { data: files, error: filesError } = await supabase
    .from('strms_project_files')
    .select('*')
    .eq('project_id', id) as { data: ProjectFile[] | null, error: Error | null }

  if (filesError) {
    console.error('Error fetching project files:', filesError)
  }

  // Fetch stage data
  const { data: stageData, error: stageDataError } = await supabase
    .from('strms_project_stage_data')
    .select('*')
    .eq('project_id', id) as { data: StageData[] | null, error: Error | null }

  if (stageDataError) {
    console.error('Error fetching stage data:', stageDataError)
  }

  // Fetch sprint pricing
  const { data: sprintPricing, error: sprintPricingError } = await supabase
    .from('strms_sprint_pricing')
    .select('*')
    .eq('project_id', id)
    .single() as { data: SprintPricing | null, error: { code?: string } | null }

  if (sprintPricingError && sprintPricingError.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine
    console.error('Error fetching sprint pricing:', sprintPricingError)
  }

  return {
    ...project,
    files: files || [],
    stageData: stageData || [],
    sprintPricing: sprintPricing || null
  }
}

/**
 * Create a new project
 */
export async function createProject(project: ProjectInsert): Promise<Project> {
  const { data, error } = await supabase
    .from('strms_projects')
    .insert(project as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error(`Failed to create project: ${error.message}`)
  }

  return data
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
  const { data, error } = await supabase
    .from('strms_projects')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw new Error(`Failed to update project: ${error.message}`)
  }

  return data
}

/**
 * Delete a project (cascades to related tables and deletes storage files)
 */
export async function deleteProject(id: string): Promise<void> {
  // Delete all files from storage and file metadata
  await deleteProjectFiles(id)

  // Delete the project record (this will cascade to related tables via DB constraints)
  const { error } = await supabase
    .from('strms_projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error(`Failed to delete project: ${error.message}`)
  }
}

/**
 * Update project's last activity timestamp
 */
export async function updateProjectActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from('strms_projects')
    .update({ last_activity: new Date().toISOString() } as never)
    .eq('id', id)

  if (error) {
    console.error('Error updating project activity:', error)
    throw new Error(`Failed to update project activity: ${error.message}`)
  }
}
