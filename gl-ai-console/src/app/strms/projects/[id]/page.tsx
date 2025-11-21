"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, User, Calendar, Clock, FileText } from "lucide-react"
import { DevelopmentProject, devStageLabels, devStageColors, sprintLengthLabels } from "@/lib/dummy-data"
import { getDevProjectById, updateDevProject, deleteDevProject } from "@/lib/services/project-service"
import { formatMinutes } from "@/lib/services/time-tracking-service"
import { ProjectForm } from "@/components/project-management/project-form"
import { TimeTracker } from "@/components/shared/time-tracker"
import { cn } from "@/lib/utils"

interface ProjectDetailPageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter()
  const [project, setProject] = useState<DevelopmentProject | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      const fetchedProject = await getDevProjectById(params.id)
      setProject(fetchedProject || null)
      setLoading(false)
    }
    loadProject()
  }, [params.id])

  // Handle project update
  const handleUpdateProject = async (projectData: Partial<DevelopmentProject>) => {
    if (project) {
      await updateDevProject(project.id, projectData)
      const updatedProject = await getDevProjectById(project.id)
      setProject(updatedProject || null)
      setShowEditForm(false)
    }
  }

  // Handle project deletion
  const handleDeleteProject = () => {
    if (project && confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteDevProject(project.id)
      router.push("/strms/project-management")
    }
  }

  // Handle time logged callback
  const handleTimeLogged = async () => {
    // Refresh project to update time tracked
    const updatedProject = await getDevProjectById(params.id)
    setProject(updatedProject || null)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            Loading project...
          </p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-[#666666] mb-4" style={{fontFamily: 'var(--font-body)'}}>
              Project not found
            </p>
            <Button
              onClick={() => router.push("/strms/project-management")}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/strms/project-management")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#463939] mb-2" style={{fontFamily: 'var(--font-heading)'}}>
            {project.projectName}
          </h1>
          <p className="text-lg text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            {project.customer}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteProject}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{fontFamily: 'var(--font-heading)'}}>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Status
                </span>
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  devStageColors[project.status]
                )}>
                  {devStageLabels[project.status]}
                </span>
              </div>

              {/* Sprint Length */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Sprint Length
                </span>
                <Badge className="bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none">
                  {sprintLengthLabels[project.sprintLength]}
                </Badge>
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Assignee
                </span>
                <div className="flex items-center gap-2 text-sm text-[#463939]">
                  <User className="w-4 h-4 text-[#407B9D]" />
                  <span style={{fontFamily: 'var(--font-body)'}}>{project.assignee}</span>
                </div>
              </div>

              {/* Time Tracked */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Time Tracked
                </span>
                <div className="flex items-center gap-2 text-sm text-[#463939]">
                  <Clock className="w-4 h-4 text-[#407B9D]" />
                  <span style={{fontFamily: 'var(--font-body)'}}>{formatMinutes(project.timeTracked)}</span>
                </div>
              </div>

              {/* Dates */}
              {project.startDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Project Dates
                  </span>
                  <div className="flex items-center gap-2 text-sm text-[#463939]">
                    <Calendar className="w-4 h-4 text-[#407B9D]" />
                    <span style={{fontFamily: 'var(--font-body)'}}>
                      {new Date(project.startDate).toLocaleDateString()}
                      {project.endDate && (
                        <>
                          {" → "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          {project.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{fontFamily: 'var(--font-heading)'}}>
                  <FileText className="w-5 h-5 text-[#407B9D]" />
                  Project Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666] whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                  {project.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Time Tracker */}
        <div className="lg:col-span-1">
          <TimeTracker
            projectId={project.id}
            projectType="development"
            assignee={project.assignee}
            onTimeLogged={handleTimeLogged}
          />
        </div>
      </div>

      {/* Edit Form Dialog */}
      <ProjectForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSubmit={handleUpdateProject}
        initialData={project}
        mode="edit"
      />
    </div>
  )
}
