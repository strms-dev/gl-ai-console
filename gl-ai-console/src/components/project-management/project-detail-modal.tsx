"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Clock, X, XCircle, ChevronDown, CalendarClock } from "lucide-react"
import { DevelopmentProject, SprintLength, Developer, DevelopmentStatus, TimeEntry } from "@/lib/types"
import { getDevProjectById, updateDevProject, deleteDevProject, createDevProject } from "@/lib/services/project-service"
import { formatMinutes, getWeekStartDate, getTimeEntriesForProject, createTimeEntry, deleteTimeEntry } from "@/lib/services/time-tracking-service"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { CustomerSelector } from "@/components/ui/customer-selector"
import { DateTimePicker } from "@/components/ui/date-time-picker"

interface ProjectDetailModalProps {
  projectId?: string | null
  mode: "create" | "edit"
  initialAssignee?: Developer
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectDeleted?: () => void
  onProjectUpdated?: () => void
  onProjectCreated?: () => void
}

export function ProjectDetailModal({
  projectId,
  mode,
  initialAssignee,
  open,
  onOpenChange,
  onProjectDeleted,
  onProjectUpdated,
  onProjectCreated
}: ProjectDetailModalProps) {
  const [project, setProject] = useState<DevelopmentProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(mode === "create")

  // Form fields
  const [projectName, setProjectName] = useState("")
  const [customer, setCustomer] = useState("")
  const [sprintLength, setSprintLength] = useState<SprintLength>("1x")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<DevelopmentStatus>("setup")
  const [assignee, setAssignee] = useState<Developer | "">("")
  const [notes, setNotes] = useState("")

  // Time tracking
  const [timeIncrement, setTimeIncrement] = useState("")
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [timeEntryNotes, setTimeEntryNotes] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const [deleteProjectConfirmOpen, setDeleteProjectConfirmOpen] = useState(false)
  const [timeEntriesExpanded, setTimeEntriesExpanded] = useState(false)
  const [timeEntriesListExpanded, setTimeEntriesListExpanded] = useState(false)

  // Date/time picker for backdating time entries
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)
  const [entryDate, setEntryDate] = useState("")  // YYYY-MM-DD format
  const [entryTime, setEntryTime] = useState("")  // HH:mm format

  // Alert dialog state
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertDescription, setAlertDescription] = useState("")
  const [alertVariant, setAlertVariant] = useState<"default" | "warning" | "info">("default")

  // Refs for date inputs
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  // Load project when modal opens
  useEffect(() => {
    const loadProject = async () => {
      if (open) {
        if (mode === "edit" && projectId) {
          setIsEditing(false) // Start in view mode for existing projects
          setLoading(true)
          try {
            const fetchedProject = await getDevProjectById(projectId)
            if (fetchedProject) {
              setProject(fetchedProject)
              setProjectName(fetchedProject.projectName)
              setCustomer(fetchedProject.customer)
              setSprintLength(fetchedProject.sprintLength)
              setStartDate(fetchedProject.startDate)
          setEndDate(fetchedProject.endDate)
          setStatus(fetchedProject.status)
          setAssignee(fetchedProject.assignee)
          setNotes(fetchedProject.notes)

              // Load time entries
              const entries = await getTimeEntriesForProject(fetchedProject.id, 'development')
              setTimeEntries(entries)
            }
          } catch (error) {
            console.error("Error loading project:", error)
          } finally {
            setLoading(false)
          }
        } else if (mode === "create") {
          // Reset to defaults for create mode
          setIsEditing(true) // Start in edit mode for new projects
          setProject(null)
          setProjectName("")
          setCustomer("")
          setSprintLength("" as SprintLength)
          setStartDate("")
          setEndDate("")
          setStatus("" as DevelopmentStatus)
          setAssignee(initialAssignee || "")
          setNotes("")
          setTimeEntries([])
          setLoading(false)
        }
      }
    }
    loadProject()
  }, [projectId, open, mode, initialAssignee])

  // Calculate total time from entries
  const totalTimeTracked = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)

  // Helper to show alert
  const showAlert = (title: string, description: string, variant: "default" | "warning" | "info" = "warning") => {
    setAlertTitle(title)
    setAlertDescription(description)
    setAlertVariant(variant)
    setAlertOpen(true)
  }

  // Convert URLs in text to clickable links
  const linkifyText = (text: string) => {
    if (!text) return null

    // Regular expression to match URLs (with or without http/https)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        // Add https:// if the URL doesn't have a protocol
        const href = part.match(/^https?:\/\//) ? part : `https://${part}`
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#407B9D] hover:text-[#407B9D]/80 underline"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  // Save function (called on button click only)
  const handleSave = async (): Promise<DevelopmentProject | null> => {
    if (mode === "create") {
      // Create new project
      if (!projectName.trim()) {
        showAlert("Project Name Required", "Please enter a project name before creating the project.")
        return null
      }

      console.log('Creating new project')
      try {
        const newProject = await createDevProject({
          projectName,
          customer,
          sprintLength,
          startDate,
          endDate,
          status,
          assignee: assignee || undefined,
          notes,
          priority: 0
        })
        setProject(newProject)
        onProjectCreated?.()
        onOpenChange(false)
        return newProject
      } catch (error) {
        console.error("Error creating project:", error)
        showAlert("Error", "Failed to create project. Please try again.")
        return null
      }
    } else if (mode === "edit" && project) {
      // Update existing project
      console.log('Updating project', project.id)
      try {
        const updatedProject = await updateDevProject(project.id, {
          projectName,
          customer,
          sprintLength,
          startDate,
          endDate,
          status,
          assignee: assignee || undefined,
          notes
        })
        console.log('Project updated')
        onProjectUpdated?.()
        setIsEditing(false) // Exit edit mode after save
        return updatedProject
      } catch (error) {
        console.error("Error updating project:", error)
        showAlert("Error", "Failed to update project. Please try again.")
        return null
      }
    }
    return null
  }

  // Parse time increment string
  const parseTimeIncrement = (input: string): number | null => {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return null

    // Check for combined format: "1h30m" or "1h 30m"
    const combinedMatch = trimmed.match(/^(\d+\.?\d*)\s*(h|hr|hour|hours)\s*(\d+)\s*(m|min|minute|minutes)$/i)
    if (combinedMatch) {
      const hours = parseFloat(combinedMatch[1])
      const minutes = parseInt(combinedMatch[3])
      return Math.round(hours * 60) + minutes
    }

    // Check for hours only
    const hourMatch = trimmed.match(/^(\d+\.?\d*)\s*(h|hr|hour|hours)$/i)
    if (hourMatch) {
      const hours = parseFloat(hourMatch[1])
      return Math.round(hours * 60)
    }

    // Check for minutes only
    const minMatch = trimmed.match(/^(\d+)\s*(m|min|minute|minutes)$/i)
    if (minMatch) {
      return parseInt(minMatch[1])
    }

    return null
  }

  const handleAddTime = async () => {
    const minutes = parseTimeIncrement(timeIncrement)

    if (minutes === null) {
      showAlert("Invalid Time Format", "Please use formats like: 1hr, 30m, 1.5h, 1h30m, or 1h 30m")
      return
    }

    if (minutes <= 0) {
      showAlert("Invalid Time Entry", "Time increment must be greater than 0")
      return
    }

    // In create mode, time entries will be saved when the Create button is clicked
    // For now, just store them in state
    if (mode === "create" && !project) {
      showAlert("Project Not Created", "Please click 'Create Project' before adding time entries")
      return
    }

    // Edit mode - project already exists
    if (!project) return

    // Determine the date to use for weekStartDate and createdAt
    let targetDate = new Date()
    let createdAtString: string | undefined = undefined

    if (entryDate) {
      // Parse date parts to avoid timezone issues
      const [year, month, day] = entryDate.split('-').map(Number)

      if (entryTime) {
        const [hours, mins] = entryTime.split(':').map(Number)
        targetDate = new Date(year, month - 1, day, hours, mins)
      } else {
        // If only date is provided, use noon to avoid timezone edge cases
        targetDate = new Date(year, month - 1, day, 12, 0)
      }

      // Create ISO string for database
      createdAtString = targetDate.toISOString()
    }

    try {
      const newEntry = await createTimeEntry({
        projectId: project.id,
        projectType: "development",
        assignee: project.assignee,
        duration: minutes,
        notes: timeEntryNotes.trim() || "",
        weekStartDate: getWeekStartDate(targetDate),
        createdAt: createdAtString  // Only passed if backdating
      })

      setTimeEntries([...timeEntries, newEntry])
      setTimeIncrement("")
      setTimeEntryNotes("")

      // Reset date/time picker
      setEntryDate("")
      setEntryTime("")
      setShowDateTimePicker(false)

      // Refresh project to get updated totals
      const updatedProject = await getDevProjectById(project.id)
      if (updatedProject) {
        setProject(updatedProject)
      }
    } catch (error) {
      console.error("Error adding time entry:", error)
      showAlert("Error", "Failed to add time entry. Please try again.")
    }
  }

  const handleDeleteTimeEntry = (entryId: string) => {
    setEntryToDelete(entryId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteTimeEntry = async () => {
    if (entryToDelete && project) {
      try {
        await deleteTimeEntry(entryToDelete)
        setTimeEntries(timeEntries.filter(e => e.id !== entryToDelete))
        setEntryToDelete(null)
        // Refresh project to get updated totals
        const updatedProject = await getDevProjectById(project.id)
        if (updatedProject) {
          setProject(updatedProject)
        }
      } catch (error) {
        console.error("Error deleting time entry:", error)
        showAlert("Error", "Failed to delete time entry. Please try again.")
      }
    }
  }

  const handleDeleteProject = () => {
    setDeleteProjectConfirmOpen(true)
  }

  const confirmDeleteProject = async () => {
    if (project) {
      try {
        await deleteDevProject(project.id)
        onOpenChange(false)
        onProjectDeleted?.()
      } catch (error) {
        console.error("Error deleting project:", error)
        showAlert("Error", "Failed to delete project. Please try again.")
      }
    }
  }

  if (mode === "edit" && !project && !loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Project not found
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Handle modal close
  const handleModalClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-[1400px] max-h-[90vh] p-0 rounded-xl overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                Loading project...
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => handleModalClose(false)}
                  className="text-[#666666] hover:text-[#463939] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-8 space-y-6">
                {/* Project Name - Large editable title */}
                <div className="group">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                    disabled={!isEditing}
                    className={`text-3xl font-bold text-[#463939] w-full border-none outline-none rounded px-2 py-1 -mx-2 transition-colors ${
                      isEditing ? 'bg-transparent hover:bg-[#F5F5F5] focus:bg-[#F5F5F5]' : 'bg-transparent cursor-default'
                    }`}
                    style={{fontFamily: 'var(--font-heading)'}}
                  />
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
                  {/* Customer */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Customer
                    </span>
                    <div className="flex-1">
                      {isEditing ? (
                        <CustomerSelector
                          value={customer}
                          onChange={setCustomer}
                          required={false}
                          showLabel={false}
                        />
                      ) : (
                        <div className="text-sm text-[#463939] px-3 py-1.5" style={{fontFamily: 'var(--font-body)'}}>
                          {customer || "Not set"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Status
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <select
                        disabled={!isEditing}
                        value={status}
                        onChange={(e) => {
                          const newStatus = e.target.value as DevelopmentStatus
                          console.log('Status changed to:', newStatus)
                          setStatus(newStatus)

                        }}
                        className={`text-sm text-[#463939] px-3 py-1.5 outline-none flex-1 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        <option value="">Select status...</option>
                        <option value="setup">Setup</option>
                        <option value="connections">Connections</option>
                        <option value="dev-in-progress">Development In Progress</option>
                        <option value="user-testing">User Testing</option>
                        <option value="complete">Complete</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {status && isEditing && (
                        <button
                          onClick={() => {
                            setStatus("setup")

                          }}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear selection"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Assignee
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <select
                        disabled={!isEditing}
                        value={assignee}
                        onChange={(e) => {
                          setAssignee(e.target.value as Developer)

                        }}
                        className={`text-sm text-[#463939] px-3 py-1.5 outline-none flex-1 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        <option value="">Select assignee...</option>
                        <option value="Nick">Nick</option>
                        <option value="Gon">Gon</option>
                      </select>
                      {assignee && isEditing && (
                        <button
                          onClick={() => {
                            setAssignee("Nick")

                          }}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear selection"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Start Date
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        ref={startDateRef}
                        type="date"
                        disabled={!isEditing}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onClick={() => {
                          if (isEditing) startDateRef.current?.showPicker()
                        }}
                        className={`text-sm text-[#463939] px-3 py-1.5 outline-none flex-1 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                      />
                      {startDate && isEditing && (
                        <button
                          onClick={() => setStartDate("")}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear date"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sprint Length */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Sprint Length
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <select
                        disabled={!isEditing}
                        value={sprintLength}
                        onChange={(e) => {
                          setSprintLength(e.target.value as SprintLength)

                        }}
                        className={`text-sm text-[#463939] px-3 py-1.5 outline-none flex-1 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        <option value="">Select sprint length...</option>
                        <option value="0.5x">0.5x Sprint</option>
                        <option value="1x">1x Sprint</option>
                        <option value="1.5x">1.5x Sprint</option>
                        <option value="2x">2x Sprint</option>
                      </select>
                      {sprintLength && isEditing && (
                        <button
                          onClick={() => {
                            setSprintLength("" as SprintLength)

                          }}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear selection"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      End Date
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        ref={endDateRef}
                        type="date"
                        disabled={!isEditing}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onClick={() => {
                          if (isEditing) endDateRef.current?.showPicker()
                        }}
                        className={`text-sm text-[#463939] px-3 py-1.5 outline-none flex-1 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                      />
                      {endDate && isEditing && (
                        <button
                          onClick={() => setEndDate("")}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear date"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Track Time - Always visible in edit mode, shows total time */}
                  {mode === "edit" && (
                    <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                      <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                        Track Time
                      </span>
                      <div
                        className={`flex-1 text-sm text-[#463939] px-3 py-1.5 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D]'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                        onClick={isEditing ? () => setTimeEntriesExpanded(!timeEntriesExpanded) : undefined}
                      >
                        {formatMinutes(totalTimeTracked)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Tracking Section - Only editable when isEditing is true */}
                {mode === "edit" && isEditing && timeEntriesExpanded && (
                  <div className="col-span-2 space-y-3 pt-4 border-t border-[#E5E5E5]">
                    {/* Time Entries List - Collapsible */}
                    {timeEntries.length > 0 && (
                      <div>
                        <button
                          onClick={() => setTimeEntriesListExpanded(!timeEntriesListExpanded)}
                          className="flex items-center gap-2 text-sm font-semibold text-[#463939] hover:text-[#407B9D] transition-colors"
                          style={{fontFamily: 'var(--font-body)'}}
                        >
                          <Clock className="w-4 h-4" />
                          <span>Time Entries ({timeEntries.length})</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${timeEntriesListExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {timeEntriesListExpanded && (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto mt-2">
                            {timeEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between p-2 bg-[#F5F5F5] rounded hover:bg-[#E5E5E5] transition-colors group"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                                      {formatMinutes(entry.duration)}
                                    </span>
                                    <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                                      {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  {entry.notes && !entry.notes.startsWith('Manual entry:') && (
                                    <p className="text-xs text-[#666666] mt-1 line-clamp-1" style={{fontFamily: 'var(--font-body)'}}>
                                      {entry.notes}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteTimeEntry(entry.id)}
                                  className="ml-2 text-[#666666] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add Time Section */}
                    <div className="space-y-3 pt-2">
                      {/* Backdate Toggle */}
                      <div className="flex items-center">
                        <button
                          onClick={() => setShowDateTimePicker(!showDateTimePicker)}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            showDateTimePicker || entryDate
                              ? "text-[#407B9D]"
                              : "text-[#666666] hover:text-[#407B9D]"
                          }`}
                          title={showDateTimePicker ? "Hide date/time options" : "Set custom date/time"}
                          type="button"
                        >
                          <CalendarClock className="w-4 h-4" />
                          <span style={{ fontFamily: 'var(--font-body)' }}>
                            {entryDate
                              ? `Backdated: ${new Date(entryDate + 'T12:00').toLocaleDateString()}${entryTime ? ` at ${entryTime}` : ''}`
                              : "Backdate entry"
                            }
                          </span>
                        </button>
                      </div>

                      {/* Date/Time Picker (shown when toggle is active) */}
                      {showDateTimePicker && (
                        <DateTimePicker
                          date={entryDate}
                          time={entryTime}
                          onDateChange={setEntryDate}
                          onTimeChange={setEntryTime}
                          onClear={() => {
                            setEntryDate("")
                            setEntryTime("")
                          }}
                        />
                      )}

                      {/* Time Duration and Notes Row */}
                      <div className="flex gap-2">
                        <Input
                          value={timeIncrement}
                          onChange={(e) => setTimeIncrement(e.target.value)}
                          placeholder="e.g., 1hr, 30m"
                          className="w-32"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTime()
                            }
                          }}
                        />
                        <Input
                          value={timeEntryNotes}
                          onChange={(e) => setTimeEntryNotes(e.target.value)}
                          placeholder="Optional notes..."
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTime()
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddTime}
                          className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="col-span-2 space-y-2 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                    Notes
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes or details about this project..."
                      className="w-full min-h-[100px] rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20 transition-all resize-y"
                      style={{fontFamily: 'var(--font-body)'}}
                    />
                  ) : (
                    <div
                      className="w-full min-h-[100px] rounded-md border border-[#E5E5E5] bg-[#F5F5F5] px-3 py-2 text-sm whitespace-pre-wrap"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      {notes ? linkifyText(notes) : (
                        <span className="text-[#999999]">No notes</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-[#E5E5E5] flex justify-between items-center">
                {/* Delete button (only show in edit mode for existing projects) */}
                {mode === "edit" && !isEditing && (
                  <button
                    onClick={handleDeleteProject}
                    className="text-[#999999] hover:text-red-600 transition-colors p-2"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {mode === "edit" && isEditing && <div />}
                {mode === "create" && <div />}

                {/* Action buttons */}
                <div className="flex gap-2">
                  {mode === "create" ? (
                    <Button
                      onClick={handleSave}
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Create Project
                    </Button>
                  ) : isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          // Reset fields to project values
                          if (project) {
                            setProjectName(project.projectName)
                            setCustomer(project.customer)
                            setSprintLength(project.sprintLength)
                            setStartDate(project.startDate)
                            setEndDate(project.endDate)
                            setStatus(project.status)
                            setAssignee(project.assignee)
                            setNotes(project.notes)
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Time Entry Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteTimeEntry}
        title="Delete Time Entry"
        description="Are you sure you want to delete this time entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Project Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteProjectConfirmOpen}
        onOpenChange={setDeleteProjectConfirmOpen}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and all associated time entries will be lost."
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertTitle}
        description={alertDescription}
        variant={alertVariant}
      />
    </>
  )
}
