"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, User, Clock, Calendar } from "lucide-react"
import { DevelopmentProject, devStageLabels, devStageColors, Developer, sprintLengthLabels } from "@/lib/types"
import { getDevProjects, updateDevProject } from "@/lib/services/project-service"
import { formatMinutes, formatDate } from "@/lib/services/time-tracking-service"
import { KanbanBoard, StageConfig } from "@/components/shared/kanban-board"
import { ListView, ColumnConfig } from "@/components/shared/list-view"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import { ProjectCard } from "@/components/project-management/project-card"
// import { ProjectForm, ProjectFormData } from "@/components/project-management/project-form" // No longer needed
import { ProjectDetailModal } from "@/components/project-management/project-detail-modal"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "active" | "completed"

export default function ProjectManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [projects, setProjects] = useState<DevelopmentProject[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        const fetchedProjects = await getDevProjects()
        setProjects(fetchedProjects)
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  // Kanban stage configuration
  const stages: StageConfig[] = [
    { id: "setup", label: devStageLabels.setup, color: devStageColors.setup },
    { id: "connections", label: devStageLabels.connections, color: devStageColors.connections },
    { id: "dev-in-progress", label: devStageLabels["dev-in-progress"], color: devStageColors["dev-in-progress"] },
    { id: "user-testing", label: devStageLabels["user-testing"], color: devStageColors["user-testing"] },
    { id: "complete", label: devStageLabels.complete, color: devStageColors.complete },
    { id: "cancelled", label: devStageLabels.cancelled, color: devStageColors.cancelled }
  ]

  // List view column configuration
  const columns: ColumnConfig<DevelopmentProject>[] = [
    {
      key: "projectName",
      label: "Project Name",
      sortable: true,
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
      sortable: true,
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
      key: "assignee",
      label: "Assignee",
      sortable: true,
      width: "w-24",
      render: (project) => (
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <User className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{project.assignee}</span>
        </div>
      )
    },
    {
      key: "timeTracked",
      label: "Time Tracked",
      sortable: false,
      width: "w-28",
      render: (project) => (
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <Clock className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{formatMinutes(project.timeTracked)}</span>
        </div>
      )
    },
    {
      key: "dates",
      label: "Dates",
      sortable: false,
      width: "w-44",
      render: (project) => (
        <div className="flex items-center gap-2 text-xs text-[#666666]">
          {project.startDate && (
            <>
              <Calendar className="w-3.5 h-3.5 text-[#407B9D]" />
              <span>{formatDate(project.startDate)}</span>
              {project.endDate && (
                <>
                  <span>→</span>
                  <span>{formatDate(project.endDate)}</span>
                </>
              )}
            </>
          )}
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

  // Handle creating a new project
  const handleProjectCreated = async () => {
    try {
      const fetchedProjects = await getDevProjects()
      setProjects(fetchedProjects)
    } catch (error) {
      console.error("Error reloading projects:", error)
    }
  }

  // Handle project updated
  const handleProjectUpdated = async () => {
    try {
      const fetchedProjects = await getDevProjects()
      setProjects(fetchedProjects)
    } catch (error) {
      console.error("Error reloading projects:", error)
    }
  }

  // Handle project deleted
  const handleProjectDeleted = async () => {
    try {
      const fetchedProjects = await getDevProjects()
      setProjects(fetchedProjects)
      setSelectedProjectId(null)
      setDetailModalOpen(false)
    } catch (error) {
      console.error("Error reloading projects:", error)
    }
  }

  // Handle stage change from kanban drag-and-drop
  const handleStageChange = async (projectId: string, newStage: string) => {
    try {
      await updateDevProject(projectId, { status: newStage as DevelopmentProject["status"] })
      const fetchedProjects = await getDevProjects()
      setProjects(fetchedProjects)
    } catch (error) {
      console.error("Error updating project status:", error)
    }
  }

  // Handle project click (open modal)
  const handleProjectClick = (project: DevelopmentProject) => {
    setSelectedProjectId(project.id)
    setDetailModalOpen(true)
  }

  // Filter projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects

    // Filter by assignee
    if (assigneeFilter !== "all") {
      filtered = filtered.filter(project => project.assignee === assigneeFilter)
    }

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter(project =>
        project.status === "setup" ||
        project.status === "connections" ||
        project.status === "dev-in-progress" ||
        project.status === "user-testing"
      )
    } else if (statusFilter === "completed") {
      filtered = filtered.filter(project =>
        project.status === "complete" ||
        project.status === "cancelled"
      )
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(search) ||
        project.customer.toLowerCase().includes(search)
      )
    }

    // Sort by last activity (most recent first)
    return filtered.sort((a, b) => {
      const aValue = new Date(a.updatedAt).getTime()
      const bValue = new Date(b.updatedAt).getTime()
      return bValue - aValue // Descending order (newest first)
    })
  }, [searchTerm, assigneeFilter, statusFilter, projects])


  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#463939] mb-2" style={{fontFamily: 'var(--font-heading)'}}>
            Project Management
          </h1>
          <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            Track development projects from setup through completion
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-[#407B9D] hover:bg-[#407B9D]/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* View Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle style={{fontFamily: 'var(--font-heading)'}}>
              Development Projects ({filteredAndSortedProjects.length})
            </CardTitle>
            <ViewToggle currentView={viewMode} onChange={setViewMode} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by project name or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                style={{fontFamily: 'var(--font-body)'}}
              >
                <option value="all">All Assignees</option>
                <option value="Nick">Nick</option>
                <option value="Gon">Gon</option>
              </select>
              {viewMode === "list" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>

          {/* View Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                Loading projects...
              </div>
            </div>
          ) : viewMode === "kanban" ? (
            <KanbanBoard
              items={filteredAndSortedProjects}
              stages={stages}
              getItemStage={(project) => project.status}
              getItemId={(project) => project.id}
              onItemClick={handleProjectClick}
              onStageChange={handleStageChange}
              renderCard={(project) => <ProjectCard project={project} />}
              emptyMessage="No projects in this stage"
            />
          ) : (
            <ListView
              items={filteredAndSortedProjects}
              columns={columns}
              onItemClick={handleProjectClick}
              emptyMessage="No projects found"
            />
          )}
        </CardContent>
      </Card>

      {/* Create Project Modal */}
      <ProjectDetailModal
        projectId={null}
        mode="create"
        initialAssignee={assigneeFilter !== "all" ? assigneeFilter as Developer : undefined}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onProjectCreated={handleProjectCreated}
      />

      {/* Project Detail Modal (Edit) */}
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          mode="edit"
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onProjectUpdated={handleProjectUpdated}
          onProjectDeleted={handleProjectDeleted}
        />
      )}
    </div>
  )
}
