"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, Pencil, Plus, Trash2, UserPlus, Mail, AlertTriangle, FileText } from "lucide-react"
import {
  FunnelLead,
  getFunnelLeads,
  addFunnelLead,
  updateFunnelLead,
  deleteFunnelLead,
  toggleHsContactCreated,
  toggleHsSequenceEnrolled,
} from "@/lib/revops-funnel-store"

type SortField = "firstName" | "lastName" | "companyName" | "createdAt"
type SortOrder = "asc" | "desc"

// Helper function to format date/time
function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export default function SalesFunnelPage() {
  const [leads, setLeads] = useState<FunnelLead[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [editingLead, setEditingLead] = useState<FunnelLead | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<FunnelLead | null>(null)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [notesLead, setNotesLead] = useState<FunnelLead | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    companyDomain: "",
    notes: "",
  })

  // Loading state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load leads from Supabase on mount
  useEffect(() => {
    const loadLeads = async () => {
      setIsLoading(true)
      const data = await getFunnelLeads()
      setLeads(data)
      setIsLoading(false)
    }
    loadLeads()
  }, [])

  // Reset form when dialog closes or editing lead changes
  useEffect(() => {
    if (editingLead) {
      setFormData({
        firstName: editingLead.firstName,
        lastName: editingLead.lastName,
        email: editingLead.email,
        companyName: editingLead.companyName,
        companyDomain: editingLead.companyDomain,
        notes: editingLead.notes,
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        companyName: "",
        companyDomain: "",
        notes: "",
      })
    }
  }, [editingLead, showLeadForm])

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = leads.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(search) ||
          lead.lastName.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search) ||
          lead.companyName.toLowerCase().includes(search) ||
          lead.companyDomain.toLowerCase().includes(search)
      )
    }

    // Sort leads
    return filtered.sort((a, b) => {
      let aValue: string
      let bValue: string

      switch (sortField) {
        case "firstName":
          aValue = a.firstName.toLowerCase()
          bValue = b.firstName.toLowerCase()
          break
        case "lastName":
          aValue = a.lastName.toLowerCase()
          bValue = b.lastName.toLowerCase()
          break
        case "companyName":
          aValue = a.companyName.toLowerCase()
          bValue = b.companyName.toLowerCase()
          break
        case "createdAt":
          aValue = a.createdAt
          bValue = b.createdAt
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      const result = aValue.localeCompare(bValue)
      return sortOrder === "asc" ? result : -result
    })
  }, [searchTerm, sortField, sortOrder, leads])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingLead) {
        // Update existing lead
        await updateFunnelLead(editingLead.id, formData)
      } else {
        // Add new lead
        await addFunnelLead(formData)
      }

      // Refresh leads list
      const updatedLeads = await getFunnelLeads()
      setLeads(updatedLeads)
      setShowLeadForm(false)
      setEditingLead(null)
    } catch (error) {
      console.error("Error saving lead:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete click
  const handleDeleteClick = (lead: FunnelLead) => {
    setLeadToDelete(lead)
    setDeleteDialogOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      await deleteFunnelLead(leadToDelete.id)
      const updatedLeads = await getFunnelLeads()
      setLeads(updatedLeads)
    }
    setDeleteDialogOpen(false)
    setLeadToDelete(null)
  }

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setLeadToDelete(null)
  }

  // Handle HubSpot contact creation toggle
  const handleToggleHsContact = async (id: string) => {
    const result = await toggleHsContactCreated(id)
    if (result) {
      const updatedLeads = await getFunnelLeads()
      setLeads(updatedLeads)
    }
  }

  // Handle HubSpot sequence enrollment toggle
  const handleToggleHsSequence = async (id: string) => {
    const result = await toggleHsSequenceEnrolled(id)
    if (result) {
      const updatedLeads = await getFunnelLeads()
      setLeads(updatedLeads)
    }
  }

  // Open edit form
  const handleEdit = (lead: FunnelLead) => {
    setEditingLead(lead)
    setShowLeadForm(true)
  }

  // Open notes dialog
  const handleViewNotes = (lead: FunnelLead) => {
    setNotesLead(lead)
    setNotesDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sales Funnel
          </h1>
          <p
            className="text-[#666666]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Track and manage your sales funnel
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Leads
              </CardTitle>
              <Button
                onClick={() => {
                  setEditingLead(null)
                  setShowLeadForm(true)
                }}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="h-9 w-[140px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="createdAt">Date Added</option>
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                  <option value="companyName">Company</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="h-9 w-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
            </div>

            {/* Leads Table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p
                  className="text-[#666666]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Loading leads...
                </p>
              </div>
            ) : filteredAndSortedLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p
                  className="text-[#666666]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {searchTerm
                    ? "No leads found matching your search."
                    : "No leads yet. Add your first lead to get started."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">First Name</th>
                      <th className="text-left py-3 px-4 font-medium">Last Name</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Company Name</th>
                      <th className="text-left py-3 px-4 font-medium">Company Domain</th>
                      <th className="text-left py-3 px-4 font-medium">Notes</th>
                      <th className="text-center py-3 px-4 font-medium">HS Contact</th>
                      <th className="text-center py-3 px-4 font-medium">HS Sequence</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-left py-3 px-4 font-medium">Updated</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedLeads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{lead.firstName}</td>
                        <td className="py-3 px-4">{lead.lastName}</td>
                        <td className="py-3 px-4">{lead.email}</td>
                        <td className="py-3 px-4">{lead.companyName}</td>
                        <td className="py-3 px-4">{lead.companyDomain || "-"}</td>
                        <td className="py-3 px-4">
                          {lead.notes ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewNotes(lead)}
                              className="h-7 text-xs text-[#407B9D] hover:text-[#407B9D] hover:bg-[#407B9D]/10"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View Notes
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {lead.hsContactCreated ? (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-[#C8E4BB] flex items-center justify-center">
                                <Check className="w-4 h-4 text-[#463939]" />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleHsContact(lead.id)}
                              className="h-7 text-xs"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Create
                            </Button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {lead.hsSequenceEnrolled ? (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-[#C8E4BB] flex items-center justify-center">
                                <Check className="w-4 h-4 text-[#463939]" />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleHsSequence(lead.id)}
                              className="h-7 text-xs"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Enroll
                            </Button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(lead.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(lead.updatedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(lead)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(lead)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Lead Dialog */}
        <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                {editingLead ? "Edit Lead" : "Add New Lead"}
              </DialogTitle>
              <DialogDescription>
                {editingLead
                  ? "Update the lead information below."
                  : "Enter the details for the new lead."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyDomain">Company Domain</Label>
                    <Input
                      id="companyDomain"
                      placeholder="example.com"
                      value={formData.companyDomain}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyDomain: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any relevant notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowLeadForm(false)
                    setEditingLead(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                  disabled={isSaving}
                >
                  {isSaving
                    ? (editingLead ? "Saving..." : "Adding...")
                    : (editingLead ? "Save Changes" : "Add Lead")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-heading)" }}>
                  Delete Lead
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="py-4" style={{ fontFamily: "var(--font-body)" }}>
              <p className="text-base mb-3">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#407B9D]">
                  {leadToDelete?.firstName} {leadToDelete?.lastName}
                </span>
                ?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. This will permanently delete the
                lead and all associated data.
              </p>
            </div>

            <DialogFooter>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
                >
                  Delete Lead
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Notes for {notesLead?.firstName} {notesLead?.lastName}
              </DialogTitle>
              <DialogDescription>
                {notesLead?.companyName}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div
                className="bg-[#FAF9F9] rounded-lg p-4 text-sm whitespace-pre-wrap"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {notesLead?.notes || "No notes available."}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setNotesDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
