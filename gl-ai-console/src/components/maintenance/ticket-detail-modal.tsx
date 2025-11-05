"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Trash2, X } from "lucide-react"
import {
  MaintenanceTicket,
  SprintLength,
  Developer,
  MaintenanceStage,
  TicketType,
  TimeEntry
} from "@/lib/dummy-data"
import {
  getMaintTicketById,
  updateMaintTicket,
  deleteMaintTicket,
  formatMinutes,
  getTimeEntriesForProject,
  addTimeEntry,
  deleteTimeEntry,
  getWeekStartDate
} from "@/lib/project-store"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface TicketDetailModalProps {
  ticketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketDeleted?: () => void
  onTicketUpdated?: () => void
}

export function TicketDetailModal({
  ticketId,
  open,
  onOpenChange,
  onTicketDeleted,
  onTicketUpdated
}: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null)
  const [loading, setLoading] = useState(true)

  // Form fields
  const [ticketTitle, setTicketTitle] = useState("")
  const [customer, setCustomer] = useState("")
  const [ticketType, setTicketType] = useState<TicketType>("Maintenance")
  const [numberOfErrors, setNumberOfErrors] = useState(0)
  const [sprintLength, setSprintLength] = useState<SprintLength>("1x")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<MaintenanceStage>("new")
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

  // Load ticket when modal opens or ticketId changes
  useEffect(() => {
    if (open) {
      const loadTicket = () => {
        const fetchedTicket = getMaintTicketById(ticketId)
        setTicket(fetchedTicket || null)
        setLoading(false)

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
      }
      loadTicket()
    }
  }, [ticketId, open])

  // Calculate total time from entries
  const totalTimeTracked = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)

  // Auto-save function
  const saveChanges = () => {
    if (ticket && ticketTitle.trim() && customer.trim()) {
      updateMaintTicket(ticket.id, {
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
    }
  }

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

  const handleAddTime = () => {
    if (!ticket) return

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
    const newEntry = addTimeEntry({
      projectId: ticket.id,
      projectType: "maintenance",
      assignee: assignee,
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      duration: minutes,
      notes: timeEntryNotes.trim() || `Manual entry: ${formatMinutes(minutes)}`,
      weekStartDate: getWeekStartDate(now)
    })

    // Update local state
    setTimeEntries([...timeEntries, newEntry])
    setTimeIncrement("")
    setTimeEntryNotes("")
    saveChanges()
  }

  const handleDeleteTimeEntry = (entryId: string) => {
    setEntryToDelete(entryId)
    setDeleteEntryConfirmOpen(true)
  }

  const confirmDeleteTimeEntry = () => {
    if (entryToDelete) {
      deleteTimeEntry(entryToDelete)
      setTimeEntries(timeEntries.filter(e => e.id !== entryToDelete))
      setEntryToDelete(null)
      saveChanges()
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

  if (!ticket && !loading) {
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
          {loading || !ticket ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                Loading ticket...
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-[#E5E5E5]">
                <h2 className="text-xl font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                  Ticket Details
                </h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-[#666666] hover:text-[#463939] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6 space-y-6">
                {/* Ticket Title - Large editable title */}
                <div className="group">
                  <input
                    type="text"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    onBlur={saveChanges}
                    placeholder="Ticket title"
                    className="text-3xl font-bold text-[#463939] w-full bg-transparent border-none outline-none hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] rounded px-2 py-1 -mx-2 transition-colors"
                    style={{fontFamily: 'var(--font-heading)'}}
                  />
                </div>

                {/* Fields Grid */}
                <div className="space-y-4 pt-4">
                  {/* Customer */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Customer
                    </span>
                    <input
                      type="text"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      onBlur={saveChanges}
                      placeholder="Customer name"
                      className="text-sm text-[#463939] bg-transparent border-none outline-none flex-1"
                      style={{fontFamily: 'var(--font-body)'}}
                    />
                  </div>

                  {/* Status */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Status
                    </span>
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as MaintenanceStage)
                        saveChanges()
                      }}
                      className="text-sm text-[#463939] bg-transparent border-none outline-none cursor-pointer flex-1"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      <option value="new">New</option>
                      <option value="analysis">Analysis</option>
                      <option value="dev-in-progress">Development In Progress</option>
                      <option value="user-testing">User Testing</option>
                      <option value="complete">Complete</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Ticket Type */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Ticket Type
                    </span>
                    <select
                      value={ticketType}
                      onChange={(e) => {
                        setTicketType(e.target.value as TicketType)
                        saveChanges()
                      }}
                      className="text-sm text-[#463939] bg-transparent border-none outline-none cursor-pointer flex-1"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Enhancement">Enhancement</option>
                    </select>
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
                      onBlur={saveChanges}
                      className="text-sm text-[#463939] bg-transparent border-none outline-none flex-1"
                      style={{fontFamily: 'var(--font-body)'}}
                    />
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Assignee
                    </span>
                    <select
                      value={assignee}
                      onChange={(e) => {
                        setAssignee(e.target.value as Developer)
                        saveChanges()
                      }}
                      className="text-sm text-[#463939] bg-transparent border-none outline-none cursor-pointer flex-1"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      <option value="Nick">Nick</option>
                      <option value="Gon">Gon</option>
                    </select>
                  </div>

                  {/* Sprint Length */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Sprint Length
                    </span>
                    <select
                      value={sprintLength}
                      onChange={(e) => {
                        setSprintLength(e.target.value as SprintLength)
                        saveChanges()
                      }}
                      className="text-sm text-[#463939] bg-transparent border-none outline-none cursor-pointer flex-1"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      <option value="0.5x">0.5x Sprint</option>
                      <option value="1x">1x Sprint</option>
                      <option value="1.5x">1.5x Sprint</option>
                      <option value="2x">2x Sprint</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Start Date
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onBlur={saveChanges}
                      className="text-sm text-[#463939] bg-transparent border-none outline-none flex-1 cursor-pointer"
                      style={{fontFamily: 'var(--font-body)'}}
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group">
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      End Date
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onBlur={saveChanges}
                      className="text-sm text-[#463939] bg-transparent border-none outline-none flex-1 cursor-pointer"
                      style={{fontFamily: 'var(--font-body)'}}
                    />
                  </div>

                  {/* Track Time - Clickable to expand */}
                  <div
                    className="flex items-center py-2 hover:bg-[#F5F5F5] rounded px-2 -mx-2 transition-colors group cursor-pointer"
                    onClick={() => setTimeEntriesExpanded(!timeEntriesExpanded)}
                  >
                    <span className="text-sm text-[#666666] w-32 flex-shrink-0" style={{fontFamily: 'var(--font-body)'}}>
                      Track Time
                    </span>
                    <span className="text-sm text-[#463939] font-medium" style={{fontFamily: 'var(--font-body)'}}>
                      {formatMinutes(totalTimeTracked)}
                    </span>
                  </div>
                </div>

                {/* Time Tracking Section - Only visible when expanded */}
                {timeEntriesExpanded && (
                  <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
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
                <div className="space-y-2 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                    Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={saveChanges}
                    placeholder="Add any notes or details about this ticket..."
                    className="w-full min-h-[100px] rounded-md border border-[#E5E5E5] bg-transparent hover:bg-[#F5F5F5] focus:bg-white px-3 py-2 text-sm transition-colors"
                    style={{fontFamily: 'var(--font-body)'}}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-[#E5E5E5] flex justify-end">
                <button
                  onClick={handleDeleteTicket}
                  className="text-[#999999] hover:text-red-600 transition-colors p-2"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
    </>
  )
}
