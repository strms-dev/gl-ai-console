"use client"

import {
  DevelopmentProject,
  MaintenanceTicket,
  TimeEntry,
  dummyDevProjects,
  dummyMaintTickets,
  dummyTimeEntries
} from "@/lib/dummy-data"

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  DEV_PROJECTS: 'strms_dev_projects',
  MAINT_TICKETS: 'strms_maint_tickets',
  TIME_ENTRIES: 'strms_time_entries',
  INITIALIZED: 'strms_data_initialized'
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize localStorage with dummy data if not already initialized
 */
function initializeStorage(): void {
  if (typeof window === 'undefined') return

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)

  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEYS.DEV_PROJECTS, JSON.stringify(dummyDevProjects))
    localStorage.setItem(STORAGE_KEYS.MAINT_TICKETS, JSON.stringify(dummyMaintTickets))
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(dummyTimeEntries))
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeStorage()
}

// ============================================================================
// DEVELOPMENT PROJECTS
// ============================================================================

/**
 * Get all development projects from localStorage
 */
export function getDevProjects(): DevelopmentProject[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEYS.DEV_PROJECTS)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error parsing dev projects from localStorage:", error)
    return []
  }
}

/**
 * Get a single development project by ID
 */
export function getDevProjectById(id: string): DevelopmentProject | undefined {
  const projects = getDevProjects()
  return projects.find(p => p.id === id)
}

/**
 * Add a new development project
 */
export function addDevProject(project: Omit<DevelopmentProject, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity'>): DevelopmentProject {
  const projects = getDevProjects()

  // Generate new ID
  const existingIds = projects.map(p => parseInt(p.id.replace('dev-', '')) || 0)
  const maxId = Math.max(...existingIds, 0)
  const newId = `dev-${maxId + 1}`

  const now = new Date().toISOString()
  const newProject: DevelopmentProject = {
    ...project,
    id: newId,
    lastActivity: "Just now",
    createdAt: now,
    updatedAt: now
  }

  projects.push(newProject)
  localStorage.setItem(STORAGE_KEYS.DEV_PROJECTS, JSON.stringify(projects))

  return newProject
}

/**
 * Update an existing development project
 */
export function updateDevProject(id: string, updates: Partial<Omit<DevelopmentProject, 'id' | 'createdAt'>>): DevelopmentProject {
  const projects = getDevProjects()
  const index = projects.findIndex(p => p.id === id)

  if (index === -1) {
    throw new Error(`Development project with id ${id} not found`)
  }

  const updatedProject: DevelopmentProject = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    lastActivity: "Just now"
  }

  projects[index] = updatedProject
  localStorage.setItem(STORAGE_KEYS.DEV_PROJECTS, JSON.stringify(projects))

  return updatedProject
}

/**
 * Delete a development project
 */
export function deleteDevProject(id: string): void {
  const projects = getDevProjects()
  const filtered = projects.filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.DEV_PROJECTS, JSON.stringify(filtered))
}

/**
 * Update priority for a development project
 */
export function updateDevProjectPriority(id: string, newPriority: number): void {
  const projects = getDevProjects()
  const index = projects.findIndex(p => p.id === id)

  if (index === -1) {
    throw new Error(`Development project with id ${id} not found`)
  }

  projects[index].priority = newPriority
  projects[index].updatedAt = new Date().toISOString()

  localStorage.setItem(STORAGE_KEYS.DEV_PROJECTS, JSON.stringify(projects))
}

// ============================================================================
// MAINTENANCE TICKETS
// ============================================================================

/**
 * Get all maintenance tickets from localStorage
 */
export function getMaintTickets(): MaintenanceTicket[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEYS.MAINT_TICKETS)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error parsing maintenance tickets from localStorage:", error)
    return []
  }
}

/**
 * Get a single maintenance ticket by ID
 */
export function getMaintTicketById(id: string): MaintenanceTicket | undefined {
  const tickets = getMaintTickets()
  return tickets.find(t => t.id === id)
}

/**
 * Add a new maintenance ticket
 */
export function addMaintTicket(ticket: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity'>): MaintenanceTicket {
  const tickets = getMaintTickets()

  // Generate new ID
  const existingIds = tickets.map(t => parseInt(t.id.replace('maint-', '')) || 0)
  const maxId = Math.max(...existingIds, 0)
  const newId = `maint-${maxId + 1}`

  const now = new Date().toISOString()
  const newTicket: MaintenanceTicket = {
    ...ticket,
    id: newId,
    lastActivity: "Just now",
    createdAt: now,
    updatedAt: now
  }

  tickets.push(newTicket)
  localStorage.setItem(STORAGE_KEYS.MAINT_TICKETS, JSON.stringify(tickets))

  return newTicket
}

/**
 * Update an existing maintenance ticket
 */
export function updateMaintTicket(id: string, updates: Partial<Omit<MaintenanceTicket, 'id' | 'createdAt'>>): MaintenanceTicket {
  const tickets = getMaintTickets()
  const index = tickets.findIndex(t => t.id === id)

  if (index === -1) {
    throw new Error(`Maintenance ticket with id ${id} not found`)
  }

  const updatedTicket: MaintenanceTicket = {
    ...tickets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    lastActivity: "Just now"
  }

  tickets[index] = updatedTicket
  localStorage.setItem(STORAGE_KEYS.MAINT_TICKETS, JSON.stringify(tickets))

  return updatedTicket
}

/**
 * Delete a maintenance ticket
 */
export function deleteMaintTicket(id: string): void {
  const tickets = getMaintTickets()
  const filtered = tickets.filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.MAINT_TICKETS, JSON.stringify(filtered))
}

/**
 * Update priority for a maintenance ticket
 */
export function updateMaintTicketPriority(id: string, newPriority: number): void {
  const tickets = getMaintTickets()
  const index = tickets.findIndex(t => t.id === id)

  if (index === -1) {
    throw new Error(`Maintenance ticket with id ${id} not found`)
  }

  tickets[index].priority = newPriority
  tickets[index].updatedAt = new Date().toISOString()

  localStorage.setItem(STORAGE_KEYS.MAINT_TICKETS, JSON.stringify(tickets))
}

// ============================================================================
// TIME ENTRIES
// ============================================================================

/**
 * Get all time entries from localStorage
 */
export function getTimeEntries(): TimeEntry[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error parsing time entries from localStorage:", error)
    return []
  }
}

/**
 * Get time entries for a specific project
 */
export function getTimeEntriesForProject(projectId: string): TimeEntry[] {
  const entries = getTimeEntries()
  return entries.filter(e => e.projectId === projectId)
}

/**
 * Get time entries for a specific week
 */
export function getTimeEntriesForWeek(weekStartDate: string): TimeEntry[] {
  const entries = getTimeEntries()
  return entries.filter(e => e.weekStartDate === weekStartDate)
}

/**
 * Add a new time entry
 */
export function addTimeEntry(entry: Omit<TimeEntry, 'id'>): TimeEntry {
  const entries = getTimeEntries()

  // Generate new ID
  const existingIds = entries.map(e => parseInt(e.id.replace('time-', '')) || 0)
  const maxId = Math.max(...existingIds, 0)
  const newId = `time-${maxId + 1}`

  const newEntry: TimeEntry = {
    ...entry,
    id: newId
  }

  entries.push(newEntry)
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries))

  return newEntry
}

/**
 * Update an existing time entry
 */
export function updateTimeEntry(id: string, updates: Partial<Omit<TimeEntry, 'id'>>): TimeEntry {
  const entries = getTimeEntries()
  const index = entries.findIndex(e => e.id === id)

  if (index === -1) {
    throw new Error(`Time entry with id ${id} not found`)
  }

  const updatedEntry: TimeEntry = {
    ...entries[index],
    ...updates
  }

  entries[index] = updatedEntry
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries))

  return updatedEntry
}

/**
 * Delete a time entry
 */
export function deleteTimeEntry(id: string): void {
  const entries = getTimeEntries()
  const filtered = entries.filter(e => e.id !== id)
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(filtered))
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
 * Clear all data (useful for testing)
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEYS.DEV_PROJECTS)
  localStorage.removeItem(STORAGE_KEYS.MAINT_TICKETS)
  localStorage.removeItem(STORAGE_KEYS.TIME_ENTRIES)
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED)

  // Reinitialize with dummy data
  initializeStorage()
}
