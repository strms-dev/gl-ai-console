"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DevelopmentProject, MaintenanceTicket, Developer } from "@/lib/dummy-data"
import { KanbanBoard, StageConfig } from "@/components/shared/kanban-board"
import { ListView, ColumnConfig } from "@/components/shared/list-view"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import { useRouter } from "next/navigation"

// ============================================================================
// TYPES
// ============================================================================

export type DeveloperViewType = "active" | "completed"
export type ProjectFilter = "all" | "development" | "maintenance"

export interface DeveloperViewProps {
  developer: Developer
  viewType: DeveloperViewType
  devProjects: DevelopmentProject[]
  maintTickets: MaintenanceTicket[]
  devStages: StageConfig[]
  maintStages: StageConfig[]
  renderDevCard: (project: DevelopmentProject) => React.ReactNode
  renderMaintCard: (ticket: MaintenanceTicket) => React.ReactNode
  devColumns: ColumnConfig<DevelopmentProject>[]
  maintColumns: ColumnConfig<MaintenanceTicket>[]
  onDevStageChange: (projectId: string, newStage: string) => void
  onMaintStageChange: (ticketId: string, newStage: string) => void
  title: string
  description: string
}

// ============================================================================
// DEVELOPER VIEW COMPONENT
// ============================================================================

export function DeveloperView({
  developer,
  viewType,
  devProjects,
  maintTickets,
  devStages,
  maintStages,
  renderDevCard,
  renderMaintCard,
  devColumns,
  maintColumns,
  onDevStageChange,
  onMaintStageChange,
  title,
  description
}: DeveloperViewProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("all")

  // Filter projects and tickets by developer
  const developerDevProjects = useMemo(() => {
    return devProjects.filter(p => p.assignee === developer)
  }, [devProjects, developer])

  const developerMaintTickets = useMemo(() => {
    return maintTickets.filter(t => t.assignee === developer)
  }, [maintTickets, developer])

  // Apply active/completed filter
  const filteredDevProjects = useMemo(() => {
    if (viewType === "active") {
      // Active: exclude complete and cancelled
      return developerDevProjects.filter(p => !["complete", "cancelled"].includes(p.status))
    } else {
      // Completed: only complete and cancelled
      return developerDevProjects.filter(p => ["complete", "cancelled"].includes(p.status))
    }
  }, [developerDevProjects, viewType])

  const filteredMaintTickets = useMemo(() => {
    if (viewType === "active") {
      // Active: exclude errors-logged and closed
      return developerMaintTickets.filter(t => !["errors-logged", "closed"].includes(t.status))
    } else {
      // Completed: only closed
      return developerMaintTickets.filter(t => t.status === "closed")
    }
  }, [developerMaintTickets, viewType])

  // Apply search filter
  const searchFilteredDevProjects = useMemo(() => {
    if (!searchTerm) return filteredDevProjects
    const search = searchTerm.toLowerCase()
    return filteredDevProjects.filter(p =>
      p.projectName.toLowerCase().includes(search) ||
      p.customer.toLowerCase().includes(search)
    )
  }, [filteredDevProjects, searchTerm])

  const searchFilteredMaintTickets = useMemo(() => {
    if (!searchTerm) return filteredMaintTickets
    const search = searchTerm.toLowerCase()
    return filteredMaintTickets.filter(t =>
      t.ticketTitle.toLowerCase().includes(search) ||
      t.customer.toLowerCase().includes(search)
    )
  }, [filteredMaintTickets, searchTerm])

  // Apply project type filter
  const displayDevProjects = useMemo(() => {
    if (projectFilter === "development" || projectFilter === "all") {
      return searchFilteredDevProjects
    }
    return []
  }, [searchFilteredDevProjects, projectFilter])

  const displayMaintTickets = useMemo(() => {
    if (projectFilter === "maintenance" || projectFilter === "all") {
      return searchFilteredMaintTickets
    }
    return []
  }, [searchFilteredMaintTickets, projectFilter])

  // Filter stages based on active/completed view
  const displayDevStages = useMemo(() => {
    if (viewType === "active") {
      return devStages.filter(s => !["complete", "cancelled"].includes(s.id))
    }
    return devStages.filter(s => ["complete", "cancelled"].includes(s.id))
  }, [devStages, viewType])

  const displayMaintStages = useMemo(() => {
    if (viewType === "active") {
      return maintStages.filter(s => !["errors-logged", "closed"].includes(s.id))
    }
    return maintStages.filter(s => s.id === "closed")
  }, [maintStages, viewType])

  // Click handlers
  const handleDevProjectClick = (project: DevelopmentProject) => {
    router.push(`/strms/projects/${project.id}`)
  }

  const handleMaintTicketClick = (ticket: MaintenanceTicket) => {
    router.push(`/strms/tickets/${ticket.id}`)
  }

  // Total counts
  const totalDevCount = displayDevProjects.length
  const totalMaintCount = displayMaintTickets.length
  const totalCount = totalDevCount + totalMaintCount

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#463939] mb-2" style={{fontFamily: 'var(--font-heading)'}}>
          {title}
        </h1>
        <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
          {description}
        </p>
      </div>

      {/* View Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle style={{fontFamily: 'var(--font-heading)'}}>
              {developer}'s {viewType === "active" ? "Active" : "Completed"} Work ({totalCount})
            </CardTitle>
            <ViewToggle currentView={viewMode} onChange={setViewMode} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by project/ticket name or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value as ProjectFilter)}
                className="h-10 w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                style={{fontFamily: 'var(--font-body)'}}
              >
                <option value="all">All Projects</option>
                <option value="development">Development Only</option>
                <option value="maintenance">Maintenance Only</option>
              </select>
            </div>
          </div>

          {/* View Content */}
          {viewMode === "kanban" ? (
            <div className="space-y-8">
              {/* Development Projects Section */}
              {(projectFilter === "all" || projectFilter === "development") && totalDevCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#463939] mb-4" style={{fontFamily: 'var(--font-heading)'}}>
                    Development Projects ({totalDevCount})
                  </h3>
                  <KanbanBoard
                    items={displayDevProjects}
                    stages={displayDevStages}
                    getItemStage={(project) => project.status}
                    getItemId={(project) => project.id}
                    onItemClick={handleDevProjectClick}
                    onStageChange={onDevStageChange}
                    renderCard={renderDevCard}
                    emptyMessage="No projects in this stage"
                  />
                </div>
              )}

              {/* Maintenance Tickets Section */}
              {(projectFilter === "all" || projectFilter === "maintenance") && totalMaintCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#463939] mb-4" style={{fontFamily: 'var(--font-heading)'}}>
                    Maintenance Tickets ({totalMaintCount})
                  </h3>
                  <KanbanBoard
                    items={displayMaintTickets}
                    stages={displayMaintStages}
                    getItemStage={(ticket) => ticket.status}
                    getItemId={(ticket) => ticket.id}
                    onItemClick={handleMaintTicketClick}
                    onStageChange={onMaintStageChange}
                    renderCard={renderMaintCard}
                    emptyMessage="No tickets in this stage"
                  />
                </div>
              )}

              {/* Empty state */}
              {totalCount === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
                    No {viewType} work found for {developer}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Development Projects List */}
              {(projectFilter === "all" || projectFilter === "development") && totalDevCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#463939] mb-4" style={{fontFamily: 'var(--font-heading)'}}>
                    Development Projects ({totalDevCount})
                  </h3>
                  <ListView
                    items={displayDevProjects}
                    columns={devColumns}
                    onItemClick={handleDevProjectClick}
                    emptyMessage="No development projects found"
                  />
                </div>
              )}

              {/* Maintenance Tickets List */}
              {(projectFilter === "all" || projectFilter === "maintenance") && totalMaintCount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#463939] mb-4" style={{fontFamily: 'var(--font-heading)'}}>
                    Maintenance Tickets ({totalMaintCount})
                  </h3>
                  <ListView
                    items={displayMaintTickets}
                    columns={maintColumns}
                    onItemClick={handleMaintTicketClick}
                    emptyMessage="No maintenance tickets found"
                  />
                </div>
              )}

              {/* Empty state */}
              {totalCount === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
                    No {viewType} work found for {developer}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
