import { supabase } from './client'
import { getProjectById } from './projects'
import { getSprintPricing } from './sprint-pricing'

/**
 * Create a development project from STRMS project data
 * Uses data from strms_projects and strms_sprint_pricing tables
 */
export async function createDevProjectFromSTRMS(
  projectId: string,
  assignee: 'Nick' | 'Gon'
): Promise<string> {
  // Fetch project data
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error(`Project not found: ${projectId}`)
  }

  // Fetch sprint pricing
  const pricing = await getSprintPricing(projectId)
  if (!pricing || !pricing.confirmed_sprint_length) {
    throw new Error(`Sprint pricing not found for project: ${projectId}`)
  }

  // Map sprint length from "1" to "1x" format
  const sprintLengthMap: Record<string, string> = {
    '0.5': '0.5x',
    '1': '1x',
    '1.5': '1.5x',
    '2': '2x'
  }
  const sprintLength = sprintLengthMap[pricing.confirmed_sprint_length] || pricing.confirmed_sprint_length

  // Create dev project
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('strms_dev_projects')
    .insert({
      project_name: project.project_name,
      customer: project.company,
      sprint_length: sprintLength,
      start_date: now,
      status: 'setup',
      assignee: assignee,
      priority: 0,
      notes: pricing.ai_scope || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating dev project:', error)
    throw new Error(`Failed to create dev project: ${error.message}`)
  }

  return data.id
}

/**
 * Check if a dev project already exists for a STRMS project
 * (by matching project_name and customer)
 */
export async function devProjectExistsForSTRMS(
  projectName: string,
  customer: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('strms_dev_projects')
    .select('id')
    .eq('project_name', projectName)
    .eq('customer', customer)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return false
    }
    console.error('Error checking for existing dev project:', error)
    return false
  }

  return !!data
}
