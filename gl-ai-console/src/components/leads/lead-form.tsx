"use client"

import { useState, useEffect } from "react"
import { Lead } from "@/lib/dummy-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LeadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (leadData: Omit<Lead, "id" | "stage" | "lastActivity">) => void
  initialData?: Partial<Lead>
  mode: "create" | "edit"
}

export function LeadForm({ open, onOpenChange, onSubmit, initialData, mode }: LeadFormProps) {
  const [formData, setFormData] = useState({
    projectName: initialData?.projectName || "",
    company: initialData?.company || "",
    contact: initialData?.contact || "",
    email: initialData?.email || "",
    notes: initialData?.notes || ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when initialData changes or when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          projectName: initialData.projectName || "",
          company: initialData.company || "",
          contact: initialData.contact || "",
          email: initialData.email || "",
          notes: initialData.notes || ""
        })
      } else {
        // Reset form for create mode
        setFormData({
          projectName: "",
          company: "",
          contact: "",
          email: "",
          notes: ""
        })
      }
    }
  }, [initialData, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Only email is required
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
      onOpenChange(false)
      setErrors({})
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-foreground mb-1">
              Project Name <span className="text-gray-500">(optional)</span>
            </label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className={errors.projectName ? "border-red-500" : ""}
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
            )}
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1">
              Company Name <span className="text-gray-500">(optional)</span>
            </label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={errors.company ? "border-red-500" : ""}
            />
            {errors.company && (
              <p className="text-red-500 text-sm mt-1">{errors.company}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-foreground mb-1">
              Contact Name <span className="text-gray-500">(optional)</span>
            </label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className={errors.contact ? "border-red-500" : ""}
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
              Notes <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes or details about this project..."
              className="w-full min-h-[100px] rounded-md border border-input bg-white px-3 py-2 text-sm outline-none hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20 transition-all resize-y"
              style={{fontFamily: 'var(--font-body)'}}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}