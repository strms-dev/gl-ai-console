"use client"

import { useState, useEffect } from "react"
import { DevelopmentProject, MaintenanceTicket, devStageLabels, devStageColors, maintStageLabels, maintStageColors, sprintLengthLabels, Developer } from "@/lib/dummy-data"
import { getDevProjects, getMaintTickets, updateDevProject, updateMaintTicket, formatMinutes } from "@/lib/project-store"
import { DeveloperView, DeveloperViewType } from "@/components/shared/developer-view"
import { StageConfig } from "@/components/shared/kanban-board"
import { ColumnConfig } from "@/components/shared/list-view"
import { ProjectCard } from "@/components/project-management/project-card"
import { TicketCard } from "@/components/maintenance/ticket-card"
import { Badge } from "@/components/ui/badge"
import { User, Clock, Calendar, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface DeveloperViewWrapperProps {
  developer: Developer
  viewType: DeveloperViewType
  initialViewMode?: "kanban" | "list"
}

// ============================================================================
// DEVELOPER VIEW WRAPPER COMPONENT
// ============================================================================

export function DeveloperViewWrapper({
  developer,
  viewType,
  initialViewMode = "kanban"
}: DeveloperViewWrapperProps) {
  const [devProjects, setDevProjects] = useState<DevelopmentProject[]>([])
  const [maintTickets, setMaintTickets] = useState<MaintenanceTicket[]>([])

  // Load data on mount
  useEffect(() => {
    setDevProjects(getDevProjects())
    setMaintTickets(getMaintTickets())
  }, [])

  // Stage configurations
  const devStages: StageConfig[] = [
    { id: "setup", label: devStageLabels.setup, color: devStageColors.setup },
    { id: "connections", label: devStageLabels.connections, color: devStageColors.connections },
    { id: "dev-in-progress", label: devStageLabels["dev-in-progress"], color: devStageColors["dev-in-progress"] },
    { id: "user-testing", label: devStageLabels["user-testing"], color: devStageColors["user-testing"] },
    { id: "complete", label: devStageLabels.complete, color: devStageColors.complete },
    { id: "cancelled", label: devStageLabels.cancelled, color: devStageColors.cancelled }
  ]

  const maintStages: StageConfig[] = [
    { id: "errors-logged", label: maintStageLabels["errors-logged"], color: maintStageColors["errors-logged"] },
    { id: "on-hold", label: maintStageLabels["on-hold"], color: maintStageColors["on-hold"] },
    { id: "fix-requests", label: maintStageLabels["fix-requests"], color: maintStageColors["fix-requests"] },
    { id: "in-progress", label: maintStageLabels["in-progress"], color: maintStageColors["in-progress"] },
    { id: "closed", label: maintStageLabels.closed, color: maintStageColors.closed }
  ]

  // Development columns for list view
  const devColumns: ColumnConfig<DevelopmentProject>[] = [
    {
      key: "projectName",
      label: "Project Name",
      sortable: false,
      width: "w-1/4",
      render: (project) => (
        <div className="font-medium text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
          {project.projectName}
        </div>
      )
    },
    {
      key: "customer",
      label: "Customer",
      sortable: false,
      width: "w-1/6",
      render: (project) => (
        <span className="text-[#666666]">{project.customer}</span>
      )
    },
    {
      key: "sprintLength",
      label: "Sprint",
      sortable: false,
      width: "w-24",
      render: (project) => (
        <Badge className="bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none text-xs">
          {sprintLengthLabels[project.sprintLength]}
        </Badge>
      )
    },
    {
      key: "timeTracked",
      label: "Time",
      sortable: false,
      width: "w-24",
      render: (project) => (
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <Clock className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{formatMinutes(project.timeTracked)}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      width: "w-40",
      render: (project) => (
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          devStageColors[project.status]
        )}>
          {project.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      )
    }
  ]

  // Maintenance columns for list view
  const maintColumns: ColumnConfig<MaintenanceTicket>[] = [
    {
      key: "ticketTitle",
      label: "Ticket Title",
      sortable: false,
      width: "w-1/4",
      render: (ticket) => (
        <div className="font-medium text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
          {ticket.ticketTitle}
        </div>
      )
    },
    {
      key: "customer",
      label: "Customer",
      sortable: false,
      width: "w-1/6",
      render: (ticket) => (
        <span className="text-[#666666]">{ticket.customer}</span>
      )
    },
    {
      key: "ticketType",
      label: "Type",
      sortable: false,
      width: "w-32",
      render: (ticket) => (
        <Badge className={cn(
          "text-xs border-none",
          ticket.ticketType === "Maintenance"
            ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90"
            : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90"
        )}>
          {ticket.ticketType}
        </Badge>
      )
    },
    {
      key: "numberOfErrors",
      label: "Errors",
      sortable: false,
      width: "w-20",
      render: (ticket) => (
        ticket.numberOfErrors > 0 ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{ticket.numberOfErrors}</span>
          </div>
        ) : (
          <span className="text-[#999999]">—</span>
        )
      )
    },
    {
      key: "timeTracked",
      label: "Time",
      sortable: false,
      width: "w-24",
      render: (ticket) => (
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <Clock className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{formatMinutes(ticket.timeTracked)}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      width: "w-40",
      render: (ticket) => (
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          maintStageColors[ticket.status]
        )}>
          {ticket.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      )
    }
  ]

  // Handle stage changes
  const handleDevStageChange = (projectId: string, newStage: string) => {
    updateDevProject(projectId, { status: newStage as DevelopmentProject["status"] })
    setDevProjects(getDevProjects())
  }

  const handleMaintStageChange = (ticketId: string, newStage: string) => {
    updateMaintTicket(ticketId, { status: newStage as MaintenanceTicket["status"] })
    setMaintTickets(getMaintTickets())
  }

  // Title and description based on view type
  const title = viewType === "active"
    ? `${developer}'s Active Work`
    : `${developer}'s Completed Work`

  const description = viewType === "active"
    ? `View all active projects and tickets assigned to ${developer}`
    : `View all completed and closed work assigned to ${developer}`

  return (
    <DeveloperView
      developer={developer}
      viewType={viewType}
      devProjects={devProjects}
      maintTickets={maintTickets}
      devStages={devStages}
      maintStages={maintStages}
      renderDevCard={(project) => <ProjectCard project={project} />}
      renderMaintCard={(ticket) => <TicketCard ticket={ticket} />}
      devColumns={devColumns}
      maintColumns={maintColumns}
      onDevStageChange={handleDevStageChange}
      onMaintStageChange={handleMaintStageChange}
      title={title}
      description={description}
    />
  )
}
