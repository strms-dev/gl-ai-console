"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MaintenanceTicket, SprintLength, Developer, MaintenanceStatus, TicketType } from "@/lib/dummy-data"

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
  sprintLength: SprintLength
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
    assignee: "Nick",
    sprintLength: "1x",
    startDate: "",
    endDate: "",
    notes: ""
  })

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
        sprintLength: initialData.sprintLength,
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
        sprintLength: "1x",
        startDate: "",
        endDate: "",
        notes: ""
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.ticketTitle.trim() || !formData.customer.trim()) {
      alert("Ticket title and customer are required")
      return
    }

    onSubmit(formData)
    onOpenChange(false)
  }

  const handleChange = (field: keyof TicketFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
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
            <Label htmlFor="customer" style={{fontFamily: 'var(--font-body)'}}>
              Customer *
            </Label>
            <Input
              id="customer"
              value={formData.customer}
              onChange={(e) => handleChange("customer", e.target.value)}
              placeholder="Enter customer name"
              required
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
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          {/* Sprint Length & Assignee Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sprintLength" style={{fontFamily: 'var(--font-body)'}}>
                Sprint Length
              </Label>
              <select
                id="sprintLength"
                value={formData.sprintLength}
                onChange={(e) => handleChange("sprintLength", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="0.5x">0.5x Sprint</option>
                <option value="1x">1x Sprint</option>
                <option value="1.5x">1.5x Sprint</option>
                <option value="2x">2x Sprint</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" style={{fontFamily: 'var(--font-body)'}}>
                Assignee
              </Label>
              <select
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleChange("assignee", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="errors-logged">Errors Logged</option>
                <option value="on-hold">On Hold</option>
                <option value="fix-requests">Fix Requests</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
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
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
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
  )
}
