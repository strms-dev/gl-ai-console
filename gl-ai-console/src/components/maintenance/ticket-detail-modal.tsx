"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Trash2, X, XCircle, CalendarClock } from "lucide-react"
import {
  MaintenanceTicket,
  Developer,
  MaintenanceStatus,
  TicketType,
  Platform,
  TimeEntry
} from "@/lib/types"
import {
  getMaintTicketById,
  updateMaintTicket,
  deleteMaintTicket,
  createMaintTicket
} from "@/lib/services/maintenance-service"
import {
  formatMinutes,
  getWeekStartDate,
  getTimeEntriesForProject,
  createTimeEntry,
  deleteTimeEntry
} from "@/lib/services/time-tracking-service"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { CustomerSelector } from "@/components/ui/customer-selector"
import { DateTimePicker } from "@/components/ui/date-time-picker"

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
  const [platform, setPlatform] = useState<Platform | "">("")
  const [numberOfErrors, setNumberOfErrors] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<MaintenanceStatus>("" as MaintenanceStatus)
  const [assignee, setAssignee] = useState<Developer | "">("")
  const [notes, setNotes] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Time tracking
  const [timeIncrement, setTimeIncrement] = useState("")
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [timeEntryNotes, setTimeEntryNotes] = useState("")
  const [timeEntriesExpanded, setTimeEntriesExpanded] = useState(false)

  // Date/time picker for backdating time entries
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)
  const [entryDate, setEntryDate] = useState("")  // YYYY-MM-DD format
  const [entryTime, setEntryTime] = useState("")  // HH:mm format

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

  // Load ticket when modal opens or ticketId changes
  useEffect(() => {
    const loadTicket = async () => {
      if (open) {
        if (mode === "edit" && ticketId) {
          setLoading(true)
          try {
            const fetchedTicket = await getMaintTicketById(ticketId)
            setTicket(fetchedTicket || null)
            setIsEditing(false) // Start in view mode for edit

            if (fetchedTicket) {
              // Populate form fields
              setTicketTitle(fetchedTicket.ticketTitle)
              setCustomer(fetchedTicket.customer)
              setTicketType(fetchedTicket.ticketType)
              setPlatform(fetchedTicket.platform)
              setNumberOfErrors(fetchedTicket.numberOfErrors)
              setStartDate(fetchedTicket.startDate)
              setEndDate(fetchedTicket.endDate)
              setStatus(fetchedTicket.status)
              setAssignee(fetchedTicket.assignee)
              setNotes(fetchedTicket.notes)
              setErrorMessage(fetchedTicket.errorMessage)

              // Load time entries
              const entries = await getTimeEntriesForProject(fetchedTicket.id, 'maintenance')
              setTimeEntries(entries)
            }
          } catch (error) {
            console.error("Error loading ticket:", error)
          } finally {
            setLoading(false)
          }
        } else if (mode === "create") {
        // Reset to defaults for create mode
        setTicket(null)
        setTicketTitle("")
        setCustomer("")
        setTicketType("" as TicketType)
        setPlatform("")
        setNumberOfErrors(0)
        setStartDate("")
        setEndDate("")
        setStatus("" as MaintenanceStatus)
        setAssignee(initialAssignee || "")
        setNotes("")
        setErrorMessage("")
        setTimeEntries([])
        setIsEditing(true) // Start in edit mode for create
        setLoading(false)
        }
      }
    }
    loadTicket()
  }, [ticketId, open, mode, initialAssignee])

  // Calculate total time from entries
  const totalTimeTracked = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)

  // Save function
  const handleSave = async (): Promise<MaintenanceTicket | null> => {
    if (mode === "create") {
      if (!ticketTitle.trim()) {
        showAlert("Ticket Title Required", "Please enter a ticket title before creating the ticket.")
        return null
      }
      try {
        const newTicket = await createMaintTicket({
        ticketTitle,
        customer,
        ticketType,
        platform,
        numberOfErrors,
        startDate,
        endDate,
        status,
        assignee: assignee || undefined,
        notes,
        errorMessage
      })
        setTicket(newTicket)
        onTicketCreated?.()
        onOpenChange(false)
        return newTicket
      } catch (error) {
        console.error("Error creating ticket:", error)
        showAlert("Error", "Failed to create ticket. Please try again.")
        return null
      }
    } else if (mode === "edit" && ticket) {
      try {
        const updatedTicket = await updateMaintTicket(ticket.id, {
          ticketTitle,
          customer,
          ticketType,
          platform,
          numberOfErrors,
          startDate,
          endDate,
          status,
          assignee: assignee || undefined,
          notes,
          errorMessage
        })
        onTicketUpdated?.()
        setIsEditing(false)
        return updatedTicket
      } catch (error) {
        console.error("Error updating ticket:", error)
        showAlert("Error", "Failed to update ticket. Please try again.")
        return null
      }
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
    if (mode === "create" && !ticket) {
      showAlert("Ticket Not Created", "Please click 'Create Ticket' before adding time entries")
      return
    }

    // Edit mode - ticket already exists
    if (!ticket) return

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
        projectId: ticket.id,
        projectType: "maintenance",
        assignee: assignee as Developer,
        duration: minutes,
        notes: timeEntryNotes.trim() || "",
        weekStartDate: getWeekStartDate(targetDate),
        createdAt: createdAtString  // Only passed if backdating
      })

      // Update local state
      const updatedEntries = [...timeEntries, newEntry]
      setTimeEntries(updatedEntries)
      setTimeIncrement("")
      setTimeEntryNotes("")

      // Reset date/time picker
      setEntryDate("")
      setEntryTime("")
      setShowDateTimePicker(false)
    } catch (error) {
      console.error("Error adding time entry:", error)
      showAlert("Error", "Failed to add time entry. Please try again.")
    }
  }

  const handleDeleteTimeEntry = (entryId: string) => {
    setEntryToDelete(entryId)
    setDeleteEntryConfirmOpen(true)
  }

  const confirmDeleteTimeEntry = async () => {
    if (entryToDelete && ticket) {
      deleteTimeEntry(entryToDelete)
      const updatedEntries = timeEntries.filter(e => e.id !== entryToDelete)
      setTimeEntries(updatedEntries)
      setEntryToDelete(null)
    }
  }

  const handleDeleteTicket = () => {
    setDeleteTicketConfirmOpen(true)
  }

  const confirmDeleteTicket = async () => {
    if (ticket) {
      try {
        await deleteMaintTicket(ticket.id)
        onOpenChange(false)
        onTicketDeleted?.()
      } catch (error) {
        console.error("Error deleting ticket:", error)
        showAlert("Error", "Failed to delete ticket. Please try again.")
      }
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
                  {/* Row 1: Customer | Status */}
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

                  {/* Row 2: Assignee | Start Date */}
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

                  {/* Row 3: Ticket Type | End Date */}
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

                  {/* Row 4: Platform | Number of Errors */}
                  {/* Platform */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Platform
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <select
                        disabled={!isEditing}
                        value={platform}
                        onChange={(e) => {
                          setPlatform(e.target.value as Platform)

                        }}
                        className={`text-sm text-[#463939] px-3 py-1.5 outline-none flex-1 transition-all ${
                          isEditing
                            ? 'bg-white border border-[#E5E5E5] rounded-md cursor-pointer hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20'
                            : 'border-none bg-transparent cursor-default'
                        }`}
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        <option value="">Select platform...</option>
                        <option value="n8n">n8n</option>
                        <option value="Make">Make</option>
                        <option value="Zapier">Zapier</option>
                        <option value="Prismatic">Prismatic</option>
                      </select>
                      {platform && isEditing && (
                        <button
                          onClick={() => {
                            setPlatform("")

                          }}
                          className="text-[#666666] hover:text-[#407B9D] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear selection"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
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
                                  {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                {/* Error Message Section */}
                <div className="col-span-2 space-y-2 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                    Error Message
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={errorMessage}
                      onChange={(e) => setErrorMessage(e.target.value)}
                      className="w-full min-h-[100px] rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20 transition-all resize-y"
                      style={{fontFamily: 'var(--font-body)'}}
                    />
                  ) : (
                    <div
                      className="w-full min-h-[100px] rounded-md border border-[#E5E5E5] bg-[#F5F5F5] px-3 py-2 text-sm whitespace-pre-wrap"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      {errorMessage ? linkifyText(errorMessage) : (
                        <span className="text-[#999999]">No error message</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="col-span-2 space-y-2 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                    Notes
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes or details about this ticket..."
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
