"use client"

import { Lead } from "@/lib/dummy-data"
import { fetchProjects, createProject, updateProject as updateProjectSupabase, deleteProject, getProjectById } from "@/lib/supabase/projects"
import type { Project, ProjectInsert, ProjectUpdate } from "@/lib/supabase/types"

// Helper function to convert Supabase Project to Lead format
function projectToLead(project: Project): Lead {
  return {
    id: project.id,
    projectName: project.project_name,
    company: project.company,
    contact: project.contact_name,
    email: project.email,
    stage: project.current_stage as Lead['stage'],
    lastActivity: formatTimestamp(project.last_activity)
  }
}

// Helper function to format timestamp to relative time
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

// Helper function to convert Lead to Supabase Project format
function leadToProject(lead: Partial<Lead>): ProjectInsert | ProjectUpdate {
  const project: any = {}

  if (lead.projectName !== undefined) project.project_name = lead.projectName
  if (lead.company !== undefined) project.company = lead.company
  if (lead.contact !== undefined) project.contact_name = lead.contact
  if (lead.email !== undefined) project.email = lead.email
  if (lead.stage !== undefined) project.current_stage = lead.stage

  return project
}

/**
 * Fetch all projects from Supabase
 */
export async function getLeads(): Promise<Lead[]> {
  try {
    const projects = await fetchProjects()
    return projects.map(projectToLead)
  } catch (error) {
    console.error("Error fetching leads from Supabase:", error)
    return []
  }
}

/**
 * Get a single lead by ID from Supabase
 */
export async function getLeadById(id: string): Promise<Lead | undefined> {
  try {
    const project = await getProjectById(id)
    if (!project) return undefined
    return projectToLead(project)
  } catch (error) {
    console.error("Error fetching lead by ID from Supabase:", error)
    return undefined
  }
}

/**
 * Add a new lead to Supabase
 */
export async function addLead(lead: Omit<Lead, 'id'>): Promise<Lead> {
  try {
    const projectData: ProjectInsert = {
      project_name: lead.projectName,
      company: lead.company,
      contact_name: lead.contact,
      email: lead.email,
      current_stage: lead.stage || 'demo',
      last_activity: new Date().toISOString()
    }

    const project = await createProject(projectData)
    return projectToLead(project)
  } catch (error) {
    console.error("Error adding lead to Supabase:", error)
    throw error
  }
}

/**
 * Update an existing lead in Supabase
 */
export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  try {
    const projectUpdates = leadToProject(updates) as ProjectUpdate

    // Always update last_activity when updating a lead
    projectUpdates.last_activity = new Date().toISOString()

    const project = await updateProjectSupabase(id, projectUpdates)
    return projectToLead(project)
  } catch (error) {
    console.error("Error updating lead in Supabase:", error)
    throw error
  }
}

/**
 * Delete a lead from Supabase
 */
export async function deleteLead(id: string): Promise<void> {
  try {
    await deleteProject(id)
  } catch (error) {
    console.error("Error deleting lead from Supabase:", error)
    throw error
  }
}

// Legacy functions for backward compatibility (no longer used)
export function saveLeads(leads: Lead[]): void {
  console.warn("saveLeads is deprecated - data is now automatically saved to Supabase")
}

