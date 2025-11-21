"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MaintenanceTicket, Developer, MaintenanceStatus, TicketType, TimeEntry } from "@/lib/dummy-data"
import { formatMinutes, getTimeEntriesForProject, createTimeEntry, deleteTimeEntry, getWeekStartDate } from "@/lib/services/time-tracking-service"
import { Clock, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { CustomerSelector } from "@/components/ui/customer-selector"

// ============================================================================
// TYPES
// ============================================================================

export interface TicketFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TicketFormData) => void
  initialData?: MaintenanceTicket
  mode: "create" | "edit"
}

export interface TicketFormData {
  ticketTitle: string
  customer: string
  ticketType: TicketType
  numberOfErrors: number
  status: MaintenanceStatus
  assignee: Developer
  startDate: string
  endDate: string
  notes: string
}

// ============================================================================
// TICKET FORM COMPONENT
// ============================================================================

export function TicketForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}: TicketFormProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    ticketTitle: "",
    customer: "",
    ticketType: "Maintenance",
    numberOfErrors: 0,
    status: "errors-logged",
    assignee: initialData?.assignee || "Nick",
    startDate: "",
    endDate: "",
    notes: ""
  })

  const [timeIncrement, setTimeIncrement] = useState("")
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [timeEntryNotes, setTimeEntryNotes] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  // Load time entries when editing a ticket
  useEffect(() => {
    const loadEntries = async () => {
      if (initialData && open) {
        const entries = await getTimeEntriesForProject(initialData.id, "maintenance")
        setTimeEntries(entries)
      } else {
        setTimeEntries([])
      }
    }
    loadEntries()
  }, [initialData, open])

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ticketTitle: initialData.ticketTitle,
        customer: initialData.customer,
        ticketType: initialData.ticketType,
        numberOfErrors: initialData.numberOfErrors,
        status: initialData.status,
        assignee: initialData.assignee,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        notes: initialData.notes
      })
    } else {
      setFormData({
        ticketTitle: "",
        customer: "",
        ticketType: "Maintenance",
        numberOfErrors: 0,
        status: "errors-logged",
        assignee: "Nick",
        startDate: "",
        endDate: "",
        notes: ""
      })
    }
    setTimeIncrement("")
    setTimeEntryNotes("")
  }, [initialData, open])

  // Calculate total time from entries
  const totalTimeTracked = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)

  // Parse time increment string and return minutes
  const parseTimeIncrement = (input: string): number | null => {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return null

    // Match patterns like: 1hr, 1h, 30m, 30min, 1.5h, 1.5hr
    const hourMatch = trimmed.match(/^(\d+\.?\d*)\s*(h|hr|hour|hours)$/i)
    const minMatch = trimmed.match(/^(\d+)\s*(m|min|minute|minutes)$/i)

    if (hourMatch) {
      const hours = parseFloat(hourMatch[1])
      return Math.round(hours * 60)
    }

    if (minMatch) {
      return parseInt(minMatch[1])
    }

    return null
  }

  const handleAddTime = async () => {
    if (!initialData) return // Can't add time to unsaved ticket

    const minutes = parseTimeIncrement(timeIncrement)

    if (minutes === null) {
      alert("Invalid time format. Use formats like: 1hr, 30m, 1.5h")
      return
    }

    if (minutes <= 0) {
      alert("Time increment must be greater than 0")
      return
    }

    // Create a new time entry
    const now = new Date()
    const newEntry = await createTimeEntry({
      projectId: initialData.id,
      projectType: "maintenance",
      assignee: initialData.assignee,
      duration: minutes,
      notes: timeEntryNotes.trim() || `Manual entry: ${formatMinutes(minutes)}`,
      weekStartDate: getWeekStartDate(now)
    })

    // Update local state
    setTimeEntries([...timeEntries, newEntry])
    setTimeIncrement("")
    setTimeEntryNotes("")
  }

  const handleDeleteTimeEntry = (entryId: string) => {
    setEntryToDelete(entryId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteTimeEntry = () => {
    if (entryToDelete) {
      deleteTimeEntry(entryToDelete)
      setTimeEntries(timeEntries.filter(e => e.id !== entryToDelete))
      setEntryToDelete(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.ticketTitle.trim()) {
      alert("Ticket title is required")
      return
    }

    // Include calculated time tracked in submission
    const submitData = {
      ...formData,
      timeTracked: totalTimeTracked
    }

    onSubmit(submitData as Partial<MaintenanceTicket>)
    onOpenChange(false)
  }

  const handleChange = (field: keyof TicketFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle style={{fontFamily: 'var(--font-heading)'}}>
            {mode === "create" ? "Create New Ticket" : "Edit Ticket"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Ticket Title */}
          <div className="space-y-2">
            <Label htmlFor="ticketTitle" style={{fontFamily: 'var(--font-body)'}}>
              Ticket Title *
            </Label>
            <Input
              id="ticketTitle"
              value={formData.ticketTitle}
              onChange={(e) => handleChange("ticketTitle", e.target.value)}
              placeholder="Enter ticket title"
              required
            />
          </div>

          {/* Customer */}
          <div className="space-y-2">
            <CustomerSelector
              value={formData.customer}
              onChange={(value) => handleChange("customer", value)}
              required={false}
            />
          </div>

          {/* Ticket Type & Number of Errors Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticketType" style={{fontFamily: 'var(--font-body)'}}>
                Ticket Type
              </Label>
              <select
                id="ticketType"
                value={formData.ticketType}
                onChange={(e) => handleChange("ticketType", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Customization">Customization</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfErrors" style={{fontFamily: 'var(--font-body)'}}>
                Number of Errors
              </Label>
              <Input
                id="numberOfErrors"
                type="number"
                min="0"
                value={formData.numberOfErrors}
                onChange={(e) => handleChange("numberOfErrors", parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Assignee Row */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee" style={{fontFamily: 'var(--font-body)'}}>
                Assignee *
              </Label>
              <select
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleChange("assignee", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                disabled={mode === "create"}
              >
                <option value="Nick">Nick</option>
                <option value="Gon">Gon</option>
              </select>
            </div>
          </div>

          {/* Start Date & End Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" style={{fontFamily: 'var(--font-body)'}}>
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" style={{fontFamily: 'var(--font-body)'}}>
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Status (only show in edit mode) */}
          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="status" style={{fontFamily: 'var(--font-body)'}}>
                Status
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                <option value="errors-logged">Errors Logged</option>
                <option value="on-hold">On Hold</option>
                <option value="fix-requests">Fix Requests</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}

          {/* Time Tracking (only show in edit mode) */}
          {mode === "edit" && (
            <div className="space-y-3 p-4 bg-[#95CBD7]/10 rounded-lg border border-[#95CBD7]/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#407B9D]" />
                <Label style={{fontFamily: 'var(--font-body)', fontWeight: 600}}>
                  Time Tracking
                </Label>
              </div>

              {/* Total Time Tracked */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <span className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Total Time Tracked:
                </span>
                <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(totalTimeTracked)}
                </span>
              </div>

              {/* Time Entries List */}
              {timeEntries.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  <Label className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Time Entries ({timeEntries.length})
                  </Label>
                  {timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-[#E5E5E5] hover:border-[#407B9D] transition-colors"
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
                        {entry.notes && (
                          <p className="text-xs text-[#666666] mt-1 line-clamp-1" style={{fontFamily: 'var(--font-body)'}}>
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTimeEntry(entry.id)}
                        className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Time Section */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                <Label htmlFor="timeIncrement" style={{fontFamily: 'var(--font-body)'}}>
                  Add Time Entry
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="timeIncrement"
                    value={timeIncrement}
                    onChange={(e) => setTimeIncrement(e.target.value)}
                    placeholder="e.g., 1hr, 30m, 1.5h"
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
                    type="button"
                    onClick={handleAddTime}
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Formats: 1hr, 30m, 1.5h, 2hours, 45min
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" style={{fontFamily: 'var(--font-body)'}}>
              Notes
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add any notes or details about this ticket"
              className="w-full min-h-[80px] rounded-md border border-input bg-white px-3 py-2 text-sm"
              style={{fontFamily: 'var(--font-body)'}}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              {mode === "create" ? "Create Ticket" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
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
  </>
  )
}
