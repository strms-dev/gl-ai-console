"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DevelopmentProject, SprintLength, Developer, DevelopmentStatus } from "@/lib/dummy-data"

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProjectFormData) => void
  initialData?: DevelopmentProject
  mode: "create" | "edit"
}

export interface ProjectFormData {
  projectName: string
  customer: string
  sprintLength: SprintLength
  startDate: string
  endDate: string
  status: DevelopmentStatus
  assignee: Developer
  notes: string
}

// ============================================================================
// PROJECT FORM COMPONENT
// ============================================================================

export function ProjectForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: "",
    customer: "",
    sprintLength: "1x",
    startDate: "",
    endDate: "",
    status: "setup",
    assignee: "Nick",
    notes: ""
  })

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        projectName: initialData.projectName,
        customer: initialData.customer,
        sprintLength: initialData.sprintLength,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        status: initialData.status,
        assignee: initialData.assignee,
        notes: initialData.notes
      })
    } else {
      setFormData({
        projectName: "",
        customer: "",
        sprintLength: "1x",
        startDate: "",
        endDate: "",
        status: "setup",
        assignee: "Nick",
        notes: ""
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.projectName.trim() || !formData.customer.trim()) {
      alert("Project name and customer are required")
      return
    }

    onSubmit(formData)
    onOpenChange(false)
  }

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle style={{fontFamily: 'var(--font-heading)'}}>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName" style={{fontFamily: 'var(--font-body)'}}>
              Project Name *
            </Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => handleChange("projectName", e.target.value)}
              placeholder="Enter project name"
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
                <option value="setup">Setup</option>
                <option value="connections">Connections</option>
                <option value="dev-in-progress">Development In Progress</option>
                <option value="user-testing">User Testing</option>
                <option value="complete">Complete</option>
                <option value="cancelled">Cancelled</option>
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
              placeholder="Add any notes or details about this project"
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
              {mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
