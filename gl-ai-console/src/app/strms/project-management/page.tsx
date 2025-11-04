"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, User, Calendar, Clock } from "lucide-react"
import { DevelopmentProject, devStageLabels, devStageColors, sprintLengthLabels } from "@/lib/dummy-data"
import { getDevProjects, updateDevProject, addDevProject, deleteDevProject, formatMinutes } from "@/lib/project-store"
import { KanbanBoard, StageConfig } from "@/components/shared/kanban-board"
import { ListView, ColumnConfig } from "@/components/shared/list-view"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import { ProjectCard } from "@/components/project-management/project-card"
import { ProjectForm, ProjectFormData } from "@/components/project-management/project-form"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type SortField = "projectName" | "customer" | "assignee" | "lastActivity"
type SortOrder = "asc" | "desc"

export default function ProjectManagementPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("lastActivity")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [projects, setProjects] = useState<DevelopmentProject[]>([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<DevelopmentProject | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")

  // Load projects on mount
  useEffect(() => {
    const loadProjects = () => {
      const fetchedProjects = getDevProjects()
      setProjects(fetchedProjects)
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
              <span>{new Date(project.startDate).toLocaleDateString()}</span>
              {project.endDate && (
                <>
                  <span>→</span>
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
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
  const handleCreateProject = (projectData: ProjectFormData) => {
    const newProject = addDevProject(projectData)
    setProjects(getDevProjects())
  }

  // Handle editing an existing project
  const handleEditProject = (projectData: ProjectFormData) => {
    if (editingProject) {
      updateDevProject(editingProject.id, projectData)
      setProjects(getDevProjects())
      setEditingProject(null)
    }
  }

  // Open edit form for a specific project
  const handleOpenEditForm = (project: DevelopmentProject) => {
    setEditingProject(project)
    setShowProjectForm(true)
  }

  // Handle deleting a project
  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteDevProject(id)
      setProjects(getDevProjects())
    }
  }

  // Handle stage change from kanban drag-and-drop
  const handleStageChange = (projectId: string, newStage: string) => {
    updateDevProject(projectId, { status: newStage as DevelopmentProject["status"] })
    setProjects(getDevProjects())
  }

  // Handle project click (navigate to detail page)
  const handleProjectClick = (project: DevelopmentProject) => {
    router.push(`/strms/projects/${project.id}`)
  }

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = projects.filter(project =>
        project.projectName.toLowerCase().includes(search) ||
        project.customer.toLowerCase().includes(search) ||
        project.assignee.toLowerCase().includes(search)
      )
    }

    // Sort projects
    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "projectName":
          aValue = a.projectName
          bValue = b.projectName
          break
        case "customer":
          aValue = a.customer
          bValue = b.customer
          break
        case "assignee":
          aValue = a.assignee
          bValue = b.assignee
          break
        case "lastActivity":
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        default:
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue)
        return sortOrder === "asc" ? result : -result
      } else {
        const result = (aValue as number) - (bValue as number)
        return sortOrder === "asc" ? result : -result
      }
    })
  }, [searchTerm, sortField, sortOrder, projects])

  // Handle list view sorting
  const handleSort = (key: string) => {
    if (key === sortField) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new field with ascending order
      setSortField(key as SortField)
      setSortOrder("asc")
    }
  }

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
          onClick={() => {
            setEditingProject(null)
            setShowProjectForm(true)
          }}
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
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by project name, customer, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            {viewMode === "list" && (
              <div className="flex gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="h-10 w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <option value="lastActivity">Last Activity</option>
                  <option value="projectName">Project Name</option>
                  <option value="customer">Customer</option>
                  <option value="assignee">Assignee</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="h-10 w-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
            )}
          </div>

          {/* View Content */}
          {viewMode === "kanban" ? (
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
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              emptyMessage="No projects found"
            />
          )}
        </CardContent>
      </Card>

      {/* Project Form Dialog */}
      <ProjectForm
        open={showProjectForm}
        onOpenChange={(open) => {
          setShowProjectForm(open)
          if (!open) {
            setEditingProject(null)
          }
        }}
        onSubmit={editingProject ? handleEditProject : handleCreateProject}
        initialData={editingProject || undefined}
        mode={editingProject ? "edit" : "create"}
      />
    </div>
  )
}
