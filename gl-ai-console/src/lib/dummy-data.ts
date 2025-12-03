import { ProjectStatus } from './supabase/types'

export interface Lead {
  id: string
  projectName: string
  company: string
  contact: string
  email: string
  stage: "new" | "demo" | "readiness" | "decision" | "scoping" | "scoping-prep" | "dev-overview" | "workflow-docs" | "sprint-pricing" | "proposal" | "proposal-decision" | "internal-client-docs" | "ea" | "setup" | "kickoff"
  projectStatus?: ProjectStatus  // Status of the project (active, not-a-fit, proposal-declined, onboarding-complete)
  lastActivity: string
  readinessScore?: number
  estimatedValue?: number
  nextAction?: string
  notes?: string
}

export const dummyLeads: Lead[] = [
  {
    id: "lead-1",
    projectName: "Karbon > Notion Sync",
    company: "Acme Corp",
    contact: "John Smith",
    email: "john@acmecorp.com",
    stage: "demo",
    lastActivity: "2 hours ago"
  }
]

export const stageLabels = {
  new: "New Lead",
  demo: "Demo Call",
  readiness: "Readiness Assessment",
  decision: "Scoping Decision",
  scoping: "Scoping Call",
  "scoping-prep": "Scoping Prep",
  "dev-overview": "Developer Overview",
  "workflow-docs": "Workflow Documentation",
  "sprint-pricing": "Sprint Pricing",
  proposal: "Send Proposal",
  "proposal-decision": "Proposal Decision",
  "internal-client-docs": "Scoping Document",
  ea: "Engagement Agreement",
  setup: "Project Setup",
  kickoff: "Project Kickoff"
}

export const stageColors = {
  new: "bg-slate-100 text-slate-800",
  demo: "bg-blue-100 text-blue-800",
  readiness: "bg-yellow-100 text-yellow-800",
  decision: "bg-amber-100 text-amber-800",
  scoping: "bg-purple-100 text-purple-800",
  "scoping-prep": "bg-indigo-100 text-indigo-800",
  "dev-overview": "bg-cyan-100 text-cyan-800",
  "workflow-docs": "bg-teal-100 text-teal-800",
  "sprint-pricing": "bg-violet-100 text-violet-800",
  proposal: "bg-orange-100 text-orange-800",
  "proposal-decision": "bg-red-100 text-red-800",
  "internal-client-docs": "bg-emerald-100 text-emerald-800",
  ea: "bg-green-100 text-green-800",
  setup: "bg-lime-100 text-lime-800",
  kickoff: "bg-gray-100 text-gray-800"
}

// ============================================================================
// PROJECT MANAGEMENT & MAINTENANCE TYPES
// ============================================================================

export type SprintLength = "0.5x" | "1x" | "1.5x" | "2x"
export type Developer = "Nick" | "Gon"

// Development Project Types
export type DevelopmentStatus = "setup" | "connections" | "dev-in-progress" | "user-testing" | "complete" | "cancelled"

export interface DevelopmentProject {
  id: string
  projectName: string
  customer: string
  sprintLength: SprintLength
  startDate: string              // ISO date string
  endDate: string                // ISO date string
  status: DevelopmentStatus
  assignee: Developer
  timeTracked: number            // Minutes tracked
  priority: number               // Priority for developer view ordering (lower = higher priority)
  notes: string
  lastActivity: string           // Relative time string
  createdAt: string              // ISO timestamp
  updatedAt: string              // ISO timestamp
  completedDate?: string         // ISO timestamp when status changed to complete/cancelled
}

// Maintenance Ticket Types
export type MaintenanceStatus = "errors-logged" | "on-hold" | "fix-requests" | "in-progress" | "closed"
export type TicketType = "Maintenance" | "Customization"
export type Platform = "n8n" | "Make" | "Zapier" | "Prismatic"

export interface MaintenanceTicket {
  id: string
  ticketTitle: string
  customer: string
  ticketType: TicketType
  platform: Platform | ""        // Platform where the issue occurred
  numberOfErrors: number         // Count of duplicate error occurrences
  status: MaintenanceStatus
  assignee: Developer
  startDate: string
  endDate: string
  timeTracked: number            // Minutes tracked
  priority: number               // Priority for developer view ordering (lower = higher priority)
  notes: string
  errorMessage: string           // Detailed error message
  lastActivity: string
  createdAt: string
  updatedAt: string
  completedDate?: string         // ISO timestamp when status changed to closed
}

// Time Entry Types
export type ProjectType = "development" | "maintenance"

export interface TimeEntry {
  id: string
  projectId: string              // Reference to dev project or maintenance ticket
  projectType: ProjectType
  assignee: Developer
  duration: number               // Minutes
  notes: string
  weekStartDate: string          // ISO date for the week (Monday)
  createdAt: string              // ISO timestamp of when entry was created
}

// Development Stage Labels & Colors
export const devStageLabels: Record<DevelopmentStatus, string> = {
  "setup": "Setup",
  "connections": "Connections",
  "dev-in-progress": "Development In Progress",
  "user-testing": "User Testing",
  "complete": "Complete",
  "cancelled": "Cancelled"
}

export const devStageColors: Record<DevelopmentStatus, string> = {
  "setup": "bg-blue-100 text-blue-800",
  "connections": "bg-purple-100 text-purple-800",
  "dev-in-progress": "bg-amber-100 text-amber-800",
  "user-testing": "bg-cyan-100 text-cyan-800",
  "complete": "bg-green-100 text-green-800",
  "cancelled": "bg-gray-100 text-gray-800"
}

// Maintenance Stage Labels & Colors
export const maintStageLabels: Record<MaintenanceStatus, string> = {
  "errors-logged": "Errors Logged",
  "on-hold": "On Hold",
  "fix-requests": "Fix Requests",
  "in-progress": "In Progress",
  "closed": "Closed"
}

export const maintStageColors: Record<MaintenanceStatus, string> = {
  "errors-logged": "bg-red-100 text-red-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
  "fix-requests": "bg-orange-100 text-orange-800",
  "in-progress": "bg-blue-100 text-blue-800",
  "closed": "bg-gray-100 text-gray-800"
}

// Sprint Length Labels
export const sprintLengthLabels: Record<SprintLength, string> = {
  "0.5x": "0.5x Sprint",
  "1x": "1x Sprint",
  "1.5x": "1.5x Sprint",
  "2x": "2x Sprint"
}

// Mock data for development projects
export const dummyDevProjects: DevelopmentProject[] = []

// Mock data for maintenance tickets
export const dummyMaintTickets: MaintenanceTicket[] = []

// Mock data for time entries
export const dummyTimeEntries: TimeEntry[] = []
