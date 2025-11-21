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
  timeTracked: number            // Minutes tracked (calculated from time_entries)
  priority: number               // Priority for developer view ordering (lower = higher priority)
  notes: string
  lastActivity: string           // Relative time string (calculated from updated_at)
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
  timeTracked: number            // Minutes tracked (calculated from time_entries)
  priority: number               // Priority for developer view ordering (lower = higher priority)
  notes: string
  errorMessage: string           // Detailed error message
  lastActivity: string           // Relative time string (calculated from updated_at)
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

// Database row types (from Supabase)
export interface DevProjectRow {
  id: string
  project_name: string | null
  customer: string | null
  sprint_length: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
  assignee: string | null
  priority: number
  notes: string | null
  created_at: string
  updated_at: string
  completed_date: string | null
}

export interface MaintenanceTicketRow {
  id: string
  ticket_title: string | null
  customer: string | null
  ticket_type: string | null
  platform: string | null
  number_of_errors: number
  status: string | null
  assignee: string | null
  start_date: string | null
  end_date: string | null
  priority: number
  notes: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  completed_date: string | null
}

export interface TimeEntryRow {
  id: string
  project_id: string | null
  project_type: string | null
  assignee: string | null
  duration: number
  notes: string | null
  week_start_date: string | null
  created_at: string
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
