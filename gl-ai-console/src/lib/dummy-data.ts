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
  proposal: "Proposal Sent",
  "proposal-decision": "Proposal Decision",
  "internal-client-docs": "Internal & Client Docs",
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

export interface MaintenanceTicket {
  id: string
  ticketTitle: string
  customer: string
  ticketType: TicketType
  numberOfErrors: number         // Count of duplicate error occurrences
  status: MaintenanceStatus
  assignee: Developer
  sprintLength: SprintLength
  startDate: string
  endDate: string
  timeTracked: number            // Minutes tracked
  priority: number               // Priority for developer view ordering (lower = higher priority)
  notes: string
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
  startTime: string              // ISO timestamp
  endTime: string | null         // null if timer running
  duration: number               // Minutes
  notes: string
  weekStartDate: string          // ISO date for the week (Monday)
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
export const dummyDevProjects: DevelopmentProject[] = [
  {
    id: "dev-1",
    projectName: "Customer Portal Integration",
    customer: "Acme Corp",
    sprintLength: "1x",
    startDate: "2025-01-06",
    endDate: "2025-01-17",
    status: "dev-in-progress",
    assignee: "Nick",
    timeTracked: 1200, // 20 hours
    priority: 1,
    notes: "Building custom authentication flow",
    lastActivity: "2 hours ago",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-04T14:30:00Z"
  },
  {
    id: "dev-2",
    projectName: "Payment Gateway Setup",
    customer: "TechStart Inc",
    sprintLength: "0.5x",
    startDate: "2025-01-08",
    endDate: "2025-01-12",
    status: "setup",
    assignee: "Gon",
    timeTracked: 180, // 3 hours
    priority: 2,
    notes: "Stripe integration",
    lastActivity: "5 hours ago",
    createdAt: "2025-01-02T09:00:00Z",
    updatedAt: "2025-01-04T11:00:00Z"
  },
  {
    id: "dev-3",
    projectName: "Reporting Dashboard",
    customer: "DataCo Analytics",
    sprintLength: "1.5x",
    startDate: "2024-12-15",
    endDate: "2025-01-05",
    status: "user-testing",
    assignee: "Nick",
    timeTracked: 2160, // 36 hours
    priority: 3,
    notes: "Real-time analytics dashboard with charts",
    lastActivity: "4 hours ago",
    createdAt: "2024-12-10T08:00:00Z",
    updatedAt: "2025-01-04T16:00:00Z"
  },
  {
    id: "dev-4",
    projectName: "Email Campaign Builder",
    customer: "MarketPro",
    sprintLength: "2x",
    startDate: "2024-12-01",
    endDate: "2024-12-29",
    status: "complete",
    assignee: "Gon",
    timeTracked: 4320, // 72 hours
    priority: 4,
    notes: "Drag-and-drop email template builder",
    lastActivity: "1 week ago",
    createdAt: "2024-11-20T09:00:00Z",
    updatedAt: "2024-12-29T17:00:00Z",
    completedDate: "2024-12-29T17:00:00Z"
  },
  {
    id: "dev-5",
    projectName: "Inventory Management System",
    customer: "RetailHub",
    sprintLength: "1x",
    startDate: "2025-01-09",
    endDate: "2025-01-20",
    status: "connections",
    assignee: "Nick",
    timeTracked: 480, // 8 hours
    priority: 5,
    notes: "Integrating with Shopify API",
    lastActivity: "6 hours ago",
    createdAt: "2025-01-03T10:00:00Z",
    updatedAt: "2025-01-04T12:00:00Z"
  },
  {
    id: "dev-6",
    projectName: "Mobile App Backend",
    customer: "FitTrack",
    sprintLength: "1.5x",
    startDate: "2024-12-20",
    endDate: "2025-01-10",
    status: "dev-in-progress",
    assignee: "Gon",
    timeTracked: 1560, // 26 hours
    priority: 6,
    notes: "REST API for fitness tracking mobile app",
    lastActivity: "3 hours ago",
    createdAt: "2024-12-15T11:00:00Z",
    updatedAt: "2025-01-04T13:00:00Z"
  },
  {
    id: "dev-7",
    projectName: "Booking System Overhaul",
    customer: "EventSpace Co",
    sprintLength: "0.5x",
    startDate: "",
    endDate: "",
    status: "setup",
    assignee: "Nick",
    timeTracked: 120, // 2 hours
    priority: 7,
    notes: "Requirements gathering phase",
    lastActivity: "1 day ago",
    createdAt: "2025-01-02T14:00:00Z",
    updatedAt: "2025-01-03T15:00:00Z"
  },
  {
    id: "dev-8",
    projectName: "Chat Widget Integration",
    customer: "SupportDesk",
    sprintLength: "1x",
    startDate: "2024-11-15",
    endDate: "2024-11-26",
    status: "cancelled",
    assignee: "Gon",
    timeTracked: 360, // 6 hours
    priority: 8,
    notes: "Client decided to use different solution",
    lastActivity: "2 months ago",
    createdAt: "2024-11-10T09:00:00Z",
    updatedAt: "2024-11-18T10:00:00Z",
    completedDate: "2024-11-18T10:00:00Z"
  },
  {
    id: "dev-9",
    projectName: "CRM Migration Tool",
    customer: "SalesPro Inc",
    sprintLength: "2x",
    startDate: "2024-12-10",
    endDate: "2025-01-07",
    status: "user-testing",
    assignee: "Gon",
    timeTracked: 3600, // 60 hours
    priority: 9,
    notes: "Migrating from Salesforce to custom CRM",
    lastActivity: "8 hours ago",
    createdAt: "2024-12-01T08:00:00Z",
    updatedAt: "2025-01-04T10:00:00Z"
  },
  {
    id: "dev-10",
    projectName: "API Rate Limiter",
    customer: "CloudAPI Services",
    sprintLength: "0.5x",
    startDate: "2024-12-28",
    endDate: "2025-01-01",
    status: "complete",
    assignee: "Nick",
    timeTracked: 480, // 8 hours
    priority: 10,
    notes: "Redis-based rate limiting middleware",
    lastActivity: "3 days ago",
    createdAt: "2024-12-20T13:00:00Z",
    updatedAt: "2025-01-01T16:00:00Z",
    completedDate: "2025-01-01T16:00:00Z"
  }
]

// Mock data for maintenance tickets
export const dummyMaintTickets: MaintenanceTicket[] = [
  {
    id: "maint-1",
    ticketTitle: "Database connection timeout",
    customer: "BuildRight LLC",
    ticketType: "Maintenance",
    numberOfErrors: 5,
    status: "in-progress",
    assignee: "Nick",
    sprintLength: "0.5x",
    startDate: "2025-01-03",
    endDate: "2025-01-07",
    timeTracked: 240, // 4 hours
    priority: 1,
    notes: "Connection pool exhaustion issue",
    lastActivity: "1 hour ago",
    createdAt: "2025-01-02T14:00:00Z",
    updatedAt: "2025-01-04T15:00:00Z"
  },
  {
    id: "maint-2",
    ticketTitle: "UI Button styling inconsistency",
    customer: "FastGrow Co",
    ticketType: "Customization",
    numberOfErrors: 1,
    status: "errors-logged",
    assignee: "Gon",
    sprintLength: "0.5x",
    startDate: "",
    endDate: "",
    timeTracked: 0,
    notes: "Reported via support ticket #1234",
    lastActivity: "1 day ago",
    createdAt: "2025-01-03T10:00:00Z",
    updatedAt: "2025-01-03T10:00:00Z"
  },
  {
    id: "maint-3",
    ticketTitle: "Email notifications not sending",
    customer: "NotifyApp",
    ticketType: "Maintenance",
    numberOfErrors: 12,
    status: "fix-requests",
    assignee: "Nick",
    sprintLength: "0.5x",
    startDate: "2025-01-02",
    endDate: "2025-01-06",
    timeTracked: 180, // 3 hours
    priority: 2,
    notes: "SMTP configuration issue",
    lastActivity: "3 hours ago",
    createdAt: "2025-01-01T15:00:00Z",
    updatedAt: "2025-01-04T11:30:00Z"
  },
  {
    id: "maint-4",
    ticketTitle: "Custom theme colors not applying",
    customer: "BrandCo",
    ticketType: "Customization",
    numberOfErrors: 1,
    status: "in-progress",
    assignee: "Gon",
    sprintLength: "0.5x",
    startDate: "2025-01-04",
    endDate: "2025-01-08",
    timeTracked: 120, // 2 hours
    priority: 3,
    notes: "CSS specificity issue in theme engine",
    lastActivity: "30 minutes ago",
    createdAt: "2025-01-03T12:00:00Z",
    updatedAt: "2025-01-04T16:30:00Z"
  },
  {
    id: "maint-5",
    ticketTitle: "Memory leak in dashboard",
    customer: "DataCo Analytics",
    ticketType: "Maintenance",
    numberOfErrors: 3,
    status: "on-hold",
    assignee: "Nick",
    sprintLength: "1x",
    startDate: "",
    endDate: "",
    timeTracked: 360, // 6 hours
    priority: 4,
    notes: "Waiting for client to provide test environment access",
    lastActivity: "2 days ago",
    createdAt: "2024-12-28T10:00:00Z",
    updatedAt: "2025-01-02T09:00:00Z"
  },
  {
    id: "maint-6",
    ticketTitle: "Export to PDF broken",
    customer: "ReportGen Inc",
    ticketType: "Maintenance",
    numberOfErrors: 8,
    status: "closed",
    assignee: "Gon",
    sprintLength: "0.5x",
    startDate: "2024-12-20",
    endDate: "2024-12-23",
    timeTracked: 300, // 5 hours
    priority: 5,
    notes: "Updated PDF library, resolved layout issues",
    lastActivity: "2 weeks ago",
    createdAt: "2024-12-18T11:00:00Z",
    updatedAt: "2024-12-23T14:00:00Z",
    completedDate: "2024-12-23T14:00:00Z"
  },
  {
    id: "maint-7",
    ticketTitle: "API returning 500 errors",
    customer: "CloudAPI Services",
    ticketType: "Maintenance",
    numberOfErrors: 15,
    status: "errors-logged",
    assignee: "Nick",
    sprintLength: "0.5x",
    startDate: "",
    endDate: "",
    timeTracked: 0,
    notes: "Need to investigate error logs",
    lastActivity: "6 hours ago",
    createdAt: "2025-01-04T08:00:00Z",
    updatedAt: "2025-01-04T08:00:00Z"
  },
  {
    id: "maint-8",
    ticketTitle: "Add custom field to user profile",
    customer: "SocialApp Co",
    ticketType: "Customization",
    numberOfErrors: 1,
    status: "fix-requests",
    assignee: "Gon",
    sprintLength: "0.5x",
    startDate: "2025-01-05",
    endDate: "2025-01-09",
    timeTracked: 90, // 1.5 hours
    priority: 6,
    notes: "Database schema update needed",
    lastActivity: "4 hours ago",
    createdAt: "2025-01-02T16:00:00Z",
    updatedAt: "2025-01-04T12:00:00Z"
  },
  {
    id: "maint-9",
    ticketTitle: "Search functionality slow",
    customer: "FindIt App",
    ticketType: "Maintenance",
    numberOfErrors: 6,
    status: "closed",
    assignee: "Nick",
    sprintLength: "1x",
    startDate: "2024-12-15",
    endDate: "2024-12-22",
    timeTracked: 720, // 12 hours
    priority: 7,
    notes: "Added database indexes, implemented caching",
    lastActivity: "2 weeks ago",
    createdAt: "2024-12-12T09:00:00Z",
    updatedAt: "2024-12-22T17:00:00Z",
    completedDate: "2024-12-22T17:00:00Z"
  },
  {
    id: "maint-10",
    ticketTitle: "Mobile responsiveness issues",
    customer: "ResponsiveWeb LLC",
    ticketType: "Customization",
    numberOfErrors: 2,
    status: "on-hold",
    assignee: "Gon",
    sprintLength: "0.5x",
    startDate: "",
    endDate: "",
    timeTracked: 150, // 2.5 hours
    priority: 8,
    notes: "Waiting for client approval on design changes",
    lastActivity: "5 days ago",
    createdAt: "2024-12-27T14:00:00Z",
    updatedAt: "2024-12-30T11:00:00Z"
  },
  {
    id: "maint-11",
    ticketTitle: "Login page redirect loop",
    customer: "AuthSecure",
    ticketType: "Maintenance",
    numberOfErrors: 20,
    status: "in-progress",
    assignee: "Nick",
    sprintLength: "0.5x",
    startDate: "2025-01-03",
    endDate: "2025-01-07",
    timeTracked: 420, // 7 hours
    priority: 9,
    notes: "Session cookie configuration bug",
    lastActivity: "2 hours ago",
    createdAt: "2025-01-02T08:00:00Z",
    updatedAt: "2025-01-04T14:00:00Z"
  },
  {
    id: "maint-12",
    ticketTitle: "Add dark mode toggle",
    customer: "ModernUI Inc",
    ticketType: "Customization",
    numberOfErrors: 1,
    status: "errors-logged",
    assignee: "Gon",
    sprintLength: "1x",
    startDate: "",
    endDate: "",
    timeTracked: 0,
    notes: "Feature request from client",
    lastActivity: "12 hours ago",
    createdAt: "2025-01-03T18:00:00Z",
    updatedAt: "2025-01-03T18:00:00Z"
  },
  {
    id: "maint-13",
    ticketTitle: "File upload size limit error",
    customer: "FileShare Pro",
    ticketType: "Maintenance",
    numberOfErrors: 4,
    status: "closed",
    assignee: "Nick",
    sprintLength: "0.5x",
    startDate: "2024-12-18",
    endDate: "2024-12-21",
    timeTracked: 180, // 3 hours
    priority: 10,
    notes: "Increased server upload limit configuration",
    lastActivity: "2 weeks ago",
    createdAt: "2024-12-16T13:00:00Z",
    updatedAt: "2024-12-21T15:00:00Z",
    completedDate: "2024-12-21T15:00:00Z"
  },
  {
    id: "maint-14",
    ticketTitle: "Webhook delivery failures",
    customer: "IntegrationHub",
    ticketType: "Maintenance",
    numberOfErrors: 9,
    status: "fix-requests",
    assignee: "Gon",
    sprintLength: "0.5x",
    startDate: "2025-01-04",
    endDate: "2025-01-08",
    timeTracked: 210, // 3.5 hours
    priority: 11,
    notes: "Retry logic not working correctly",
    lastActivity: "5 hours ago",
    createdAt: "2025-01-03T09:00:00Z",
    updatedAt: "2025-01-04T11:00:00Z"
  },
  {
    id: "maint-15",
    ticketTitle: "Custom reporting widgets",
    customer: "Analytics Plus",
    ticketType: "Customization",
    numberOfErrors: 1,
    status: "in-progress",
    assignee: "Nick",
    sprintLength: "1.5x",
    startDate: "2025-01-02",
    endDate: "2025-01-13",
    timeTracked: 900, // 15 hours
    priority: 12,
    notes: "Building 3 custom chart components",
    lastActivity: "1 hour ago",
    createdAt: "2024-12-30T10:00:00Z",
    updatedAt: "2025-01-04T15:00:00Z"
  }
]

// Mock data for time entries
export const dummyTimeEntries: TimeEntry[] = [
  // Week of 2025-01-01
  {
    id: "time-1",
    projectId: "dev-1",
    projectType: "development",
    assignee: "Nick",
    startTime: "2025-01-04T09:00:00Z",
    endTime: "2025-01-04T11:30:00Z",
    duration: 150,
    notes: "Implemented OAuth flow",
    weekStartDate: "2024-12-30"
  },
  {
    id: "time-2",
    projectId: "maint-1",
    projectType: "maintenance",
    assignee: "Nick",
    startTime: "2025-01-04T13:00:00Z",
    endTime: "2025-01-04T15:00:00Z",
    duration: 120,
    notes: "Investigated connection pool settings",
    weekStartDate: "2024-12-30"
  },
  {
    id: "time-3",
    projectId: "dev-3",
    projectType: "development",
    assignee: "Nick",
    startTime: "2025-01-02T09:00:00Z",
    endTime: "2025-01-02T12:00:00Z",
    duration: 180,
    notes: "Built chart components for dashboard",
    weekStartDate: "2024-12-30"
  },
  {
    id: "time-4",
    projectId: "dev-6",
    projectType: "development",
    assignee: "Gon",
    startTime: "2025-01-03T10:00:00Z",
    endTime: "2025-01-03T14:00:00Z",
    duration: 240,
    notes: "Implemented REST API endpoints",
    weekStartDate: "2024-12-30"
  },
  {
    id: "time-5",
    projectId: "maint-4",
    projectType: "maintenance",
    assignee: "Gon",
    startTime: "2025-01-04T15:00:00Z",
    endTime: "2025-01-04T17:00:00Z",
    duration: 120,
    notes: "Fixed CSS specificity bug",
    weekStartDate: "2024-12-30"
  },
  {
    id: "time-6",
    projectId: "dev-2",
    projectType: "development",
    assignee: "Gon",
    startTime: "2025-01-02T11:00:00Z",
    endTime: "2025-01-02T14:00:00Z",
    duration: 180,
    notes: "Set up Stripe integration",
    weekStartDate: "2024-12-30"
  },
  {
    id: "time-7",
    projectId: "maint-3",
    projectType: "maintenance",
    assignee: "Nick",
    startTime: "2025-01-03T14:00:00Z",
    endTime: "2025-01-03T17:00:00Z",
    duration: 180,
    notes: "Debugged SMTP settings",
    weekStartDate: "2024-12-30"
  },
  {
    id: "time-8",
    projectId: "dev-5",
    projectType: "development",
    assignee: "Nick",
    startTime: "2025-01-01T09:00:00Z",
    endTime: "2025-01-01T13:00:00Z",
    duration: 240,
    notes: "Integrated Shopify API",
    weekStartDate: "2024-12-30"
  },
  // Week of 2024-12-23
  {
    id: "time-9",
    projectId: "dev-9",
    projectType: "development",
    assignee: "Gon",
    startTime: "2024-12-27T09:00:00Z",
    endTime: "2024-12-27T17:00:00Z",
    duration: 480,
    notes: "Built CRM migration scripts",
    weekStartDate: "2024-12-23"
  },
  {
    id: "time-10",
    projectId: "maint-9",
    projectType: "maintenance",
    assignee: "Nick",
    startTime: "2024-12-26T10:00:00Z",
    endTime: "2024-12-26T16:00:00Z",
    duration: 360,
    notes: "Optimized search with caching",
    weekStartDate: "2024-12-23"
  },
  {
    id: "time-11",
    projectId: "dev-10",
    projectType: "development",
    assignee: "Nick",
    startTime: "2024-12-24T13:00:00Z",
    endTime: "2024-12-24T17:00:00Z",
    duration: 240,
    notes: "Implemented Redis rate limiter",
    weekStartDate: "2024-12-23"
  },
  {
    id: "time-12",
    projectId: "maint-6",
    projectType: "maintenance",
    assignee: "Gon",
    startTime: "2024-12-23T09:00:00Z",
    endTime: "2024-12-23T14:00:00Z",
    duration: 300,
    notes: "Fixed PDF export functionality",
    weekStartDate: "2024-12-23"
  }
]