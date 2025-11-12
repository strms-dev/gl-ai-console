"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Trash2, X, XCircle } from "lucide-react"
import {
  MaintenanceTicket,
  SprintLength,
  Developer,
  MaintenanceStatus,
  TicketType,
  TimeEntry
} from "@/lib/dummy-data"
import {
  getMaintTicketById,
  updateMaintTicket,
  deleteMaintTicket,
  addMaintTicket,
  formatMinutes,
  getTimeEntriesForProject,
  addTimeEntry,
  deleteTimeEntry,
  getWeekStartDate
} from "@/lib/project-store"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { CustomerSelector } from "@/components/ui/customer-selector"
import { ChevronDown } from "lucide-react"

interface TicketDetailModalProps {
  ticketId?: string | null
  mode: "create" | "edit"
  initialAssignee?: Developer
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketDeleted?: () => void
  onTicketUpdated?: () => void
  onTicketCreated?: () => void
}

export function TicketDetailModal({
  ticketId,
  mode,
  initialAssignee,
  open,
  onOpenChange,
  onTicketDeleted,
  onTicketUpdated,
  onTicketCreated
}: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(mode === "create")

  // Form fields
  const [ticketTitle, setTicketTitle] = useState("")
  const [customer, setCustomer] = useState("")
  const [ticketType, setTicketType] = useState<TicketType>("" as TicketType)
  const [numberOfErrors, setNumberOfErrors] = useState(0)
  const [sprintLength, setSprintLength] = useState<SprintLength>("1x")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<MaintenanceStatus>("" as MaintenanceStatus)
  const [assignee, setAssignee] = useState<Developer>("Nick")
  const [notes, setNotes] = useState("")

  // Time tracking
  const [timeIncrement, setTimeIncrement] = useState("")
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [timeEntryNotes, setTimeEntryNotes] = useState("")
  const [timeEntriesExpanded, setTimeEntriesExpanded] = useState(false)

  // Confirmation dialogs
  const [deleteTicketConfirmOpen, setDeleteTicketConfirmOpen] = useState(false)
  const [deleteEntryConfirmOpen, setDeleteEntryConfirmOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  // Alert dialog
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertDescription, setAlertDescription] = useState("")
  const [alertVariant, setAlertVariant] = useState<"default" | "warning" | "info">("warning")

  // Refs for date inputs
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  // Show alert helper
  const showAlert = (title: string, description: string, variant: "default" | "warning" | "info" = "warning") => {
    setAlertTitle(title)
    setAlertDescription(description)
    setAlertVariant(variant)
    setAlertOpen(true)
  }

  // Load ticket when modal opens or ticketId changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && ticketId) {
        const fetchedTicket = getMaintTicketById(ticketId)
        setTicket(fetchedTicket || null)
        setLoading(false)
        setIsEditing(false) // Start in view mode for edit

        if (fetchedTicket) {
          // Populate form fields
          setTicketTitle(fetchedTicket.ticketTitle)
          setCustomer(fetchedTicket.customer)
          setTicketType(fetchedTicket.ticketType)
          setNumberOfErrors(fetchedTicket.numberOfErrors)
          setSprintLength(fetchedTicket.sprintLength)
          setStartDate(fetchedTicket.startDate)
          setEndDate(fetchedTicket.endDate)
          setStatus(fetchedTicket.status)
          setAssignee(fetchedTicket.assignee)
          setNotes(fetchedTicket.notes)

          // Load time entries
          const entries = getTimeEntriesForProject(fetchedTicket.id)
          setTimeEntries(entries)
        }
      } else if (mode === "create") {
        // Reset to defaults for create mode
        setTicket(null)
        setTicketTitle("")
        setCustomer("")
        setTicketType("" as TicketType)
        setNumberOfErrors(0)
        setSprintLength("" as SprintLength)
        setStartDate("")
        setEndDate("")
        setStatus("" as MaintenanceStatus)
        setAssignee(initialAssignee || "Nick")
        setNotes("")
        setTimeEntries([])
        setIsEditing(true) // Start in edit mode for create
        setLoading(false)
      }
    }
  }, [ticketId, open, mode, initialAssignee])

  // Calculate total time from entries
  const totalTimeTracked = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)

  // Save function
  const handleSave = (): MaintenanceTicket | null => {
    if (mode === "create") {
      if (!ticketTitle.trim()) {
        showAlert("Ticket Title Required", "Please enter a ticket title before creating the ticket.")
        return null
      }
      const newTicket = addMaintTicket({
        ticketTitle,
        customer,
        ticketType,
        numberOfErrors,
        sprintLength,
        startDate,
        endDate,
        status,
        assignee,
        notes,
        timeTracked: totalTimeTracked
      })
      setTicket(newTicket)
      onTicketCreated?.()
      onOpenChange(false)
      return newTicket
    } else if (mode === "edit" && ticket) {
      const updatedTicket = updateMaintTicket(ticket.id, {
        ticketTitle,
        customer,
        ticketType,
        numberOfErrors,
        sprintLength,
        startDate,
        endDate,
        status,
        assignee,
        notes,
        timeTracked: totalTimeTracked
      })
      onTicketUpdated?.()
      setIsEditing(false)
      return updatedTicket
    }
    return null
  }

  // Parse time increment string and return minutes
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

  const handleAddTime = () => {
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
    if (mode === "create" && !ticket) {
      showAlert("Ticket Not Created", "Please click 'Create Ticket' before adding time entries")
      return
    }

    // Edit mode - ticket already exists
    if (!ticket) return

    const now = new Date()
    const newEntry = addTimeEntry({
      projectId: ticket.id,
      projectType: "maintenance",
      assignee: assignee,
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      duration: minutes,
      notes: timeEntryNotes.trim() || "",
      weekStartDate: getWeekStartDate(now)
    })

    // Update local state and update ticket's total time
    const updatedEntries = [...timeEntries, newEntry]
    setTimeEntries(updatedEntries)
    setTimeIncrement("")
    setTimeEntryNotes("")

    // Update ticket with new total time
    const newTotalTime = updatedEntries.reduce((sum, entry) => sum + entry.duration, 0)
    updateMaintTicket(ticket.id, { timeTracked: newTotalTime })
  }

  const handleDeleteTimeEntry = (entryId: string) => {
    setEntryToDelete(entryId)
    setDeleteEntryConfirmOpen(true)
  }

  const confirmDeleteTimeEntry = () => {
    if (entryToDelete && ticket) {
      deleteTimeEntry(entryToDelete)
      const updatedEntries = timeEntries.filter(e => e.id !== entryToDelete)
      setTimeEntries(updatedEntries)
      setEntryToDelete(null)

      // Update ticket with new total time
      const newTotalTime = updatedEntries.reduce((sum, entry) => sum + entry.duration, 0)
      updateMaintTicket(ticket.id, { timeTracked: newTotalTime })
    }
  }

  const handleDeleteTicket = () => {
    setDeleteTicketConfirmOpen(true)
  }

  const confirmDeleteTicket = () => {
    if (ticket) {
      deleteMaintTicket(ticket.id)
      onOpenChange(false)
      onTicketDeleted?.()
    }
  }

  if (mode === "edit" && !ticket && !loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[1400px]">
          <div className="text-center py-8">
            <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Ticket not found
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[1400px] max-h-[90vh] p-0 rounded-xl overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                Loading ticket...
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-[#666666] hover:text-[#463939] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-8 space-y-6">
                {/* Ticket Title - Large editable title */}
                <div className="group">
                  <input
                    type="text"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ticket title"
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
                          onChange={(value) => {
                            setCustomer(value)
                            // Only auto-save in edit mode
                            if (mode === "edit") {

                            }
                          }}
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

                  {/* Number of Errors */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Number of Errors
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={numberOfErrors}
                      onChange={(e) => setNumberOfErrors(parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      className={`text-sm text-[#463939] outline-none flex-1 px-3 py-1.5 transition-all ${
                        isEditing
                          ? 'bg-white border border-[#E5E5E5] rounded-md hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                          : 'border-none bg-transparent cursor-default'
                      }`}
                      style={{fontFamily: 'var(--font-body)'}}
                    />
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

                  {/* Ticket Type */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Ticket Type
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <select
                        disabled={!isEditing}
                        value={ticketType}
                        onChange={(e) => {
                          setTicketType(e.target.value as TicketType)

                        }}
                        className={`text-sm text-[#463939] px-3 py-1.5 outline-none flex-1 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        <option value="">Select type...</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Customization">Customization</option>
                      </select>
                      {ticketType && isEditing && (
                        <button
                          onClick={() => {
                            setTicketType("Maintenance")

                          }}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear selection"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
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
                          const newStatus = e.target.value as MaintenanceStatus
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
                        <option value="errors-logged">Errors Logged</option>
                        <option value="on-hold">On Hold</option>
                        <option value="fix-requests">Fix Requests</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                      {status && isEditing && (
                        <button
                          onClick={() => {
                            setStatus("errors-logged")

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
                        onChange={(e) => {
                          setStartDate(e.target.value)
                          if (mode === "edit") {

                          }
                        }}
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
                          onClick={() => {
                            setStartDate("")

                          }}
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
                        onChange={(e) => {
                          setEndDate(e.target.value)
                          if (mode === "edit") {

                          }
                        }}
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
                          onClick={() => {
                            setEndDate("")

                          }}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear date"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time Tracking Section - Only editable when isEditing is true */}
                {mode === "edit" && isEditing && timeEntriesExpanded && (
                  <div className="col-span-2 space-y-3 pt-4 border-t border-[#E5E5E5]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#407B9D]" />
                      <h3 className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                        Time Entries
                      </h3>
                    </div>

                    {/* Time Entries List */}
                    {timeEntries.length > 0 && (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
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
                                  {new Date(entry.startTime).toLocaleDateString()} at {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {entry.notes && (
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

                    {/* Add Time Section */}
                    <div className="space-y-2 pt-2">
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
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Add any notes or details about this ticket..."
                    className="w-full min-h-[100px] rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20 transition-all resize-y disabled:cursor-not-allowed disabled:opacity-70"
                    style={{fontFamily: 'var(--font-body)'}}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-[#E5E5E5] flex justify-between items-center">
                <div>
                  {mode === "edit" && !isEditing && (
                    <button
                      onClick={handleDeleteTicket}
                      className="text-[#999999] hover:text-red-600 transition-colors p-2"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {mode === "create" ? (
                    <Button
                      onClick={handleSave}
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Create Ticket
                    </Button>
                  ) : isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
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
        open={deleteEntryConfirmOpen}
        onOpenChange={setDeleteEntryConfirmOpen}
        onConfirm={confirmDeleteTimeEntry}
        title="Delete Time Entry"
        description="Are you sure you want to delete this time entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Ticket Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteTicketConfirmOpen}
        onOpenChange={setDeleteTicketConfirmOpen}
        onConfirm={confirmDeleteTicket}
        title="Delete Ticket"
        description="Are you sure you want to delete this ticket? This action cannot be undone and will remove all associated time entries."
        confirmText="Delete"
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
