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
import { Check, Pencil, Plus, Trash2, UserPlus, AlertTriangle, FileText, X, Filter, ExternalLink, Loader2 } from "lucide-react"
import {
  FunnelLead,
  getFunnelLeads,
  addFunnelLead,
  updateFunnelLead,
  deleteFunnelLead,
} from "@/lib/revops-funnel-store"

type FilterOption = "all" | "yes" | "no"

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
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [editingLead, setEditingLead] = useState<FunnelLead | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<FunnelLead | null>(null)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [notesLead, setNotesLead] = useState<FunnelLead | null>(null)
  const [hsContactFilter, setHsContactFilter] = useState<FilterOption>("all")
  const [hsSequenceFilter, setHsSequenceFilter] = useState<FilterOption>("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Check if any filters are active
  const hasActiveFilters = hsContactFilter !== "all" || hsSequenceFilter !== "all"

  // Clear all filters
  const clearAllFilters = () => {
    setHsContactFilter("all")
    setHsSequenceFilter("all")
  }

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

  // HubSpot contact creation states (per lead)
  const [hsCreatingLeadId, setHsCreatingLeadId] = useState<string | null>(null)
  const [hsFailedLeadId, setHsFailedLeadId] = useState<string | null>(null)

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
      filtered = filtered.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(search) ||
          lead.lastName.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search) ||
          lead.companyName.toLowerCase().includes(search) ||
          lead.companyDomain.toLowerCase().includes(search)
      )
    }

    // Filter by HS Contact status
    if (hsContactFilter !== "all") {
      filtered = filtered.filter((lead) =>
        hsContactFilter === "yes" ? lead.hsContactCreated : !lead.hsContactCreated
      )
    }

    // Filter by HS Sequence status
    if (hsSequenceFilter !== "all") {
      filtered = filtered.filter((lead) =>
        hsSequenceFilter === "yes" ? lead.hsSequenceEnrolled : !lead.hsSequenceEnrolled
      )
    }

    // Sort by most recently updated (descending)
    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [searchTerm, leads, hsContactFilter, hsSequenceFilter])

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

  // Handle HubSpot contact creation via n8n webhook
  const handleCreateHsContact = async (lead: FunnelLead) => {
    setHsFailedLeadId(null)
    setHsCreatingLeadId(lead.id)

    try {
      const response = await fetch(
        "https://n8n.srv1055749.hstgr.cloud/webhook/revops-create-hubspot-contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            companyName: lead.companyName,
            companyDomain: lead.companyDomain,
            notes: lead.notes,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        const updatedLeads = await getFunnelLeads()
        setLeads(updatedLeads)
      } else {
        setHsFailedLeadId(lead.id)
        setTimeout(() => {
          setHsFailedLeadId(null)
        }, 2000)
      }
    } catch {
      setHsFailedLeadId(lead.id)
      setTimeout(() => {
        setHsFailedLeadId(null)
      }, 2000)
    } finally {
      setHsCreatingLeadId(null)
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
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Search Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`flex items-center gap-2 ${hasActiveFilters ? "border-[#407B9D] text-[#407B9D]" : ""}`}
                  >
                    <Filter className="w-4 h-4" />
                    Add Filter
                    {hasActiveFilters && (
                      <span className="ml-1 bg-[#407B9D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {(hsContactFilter !== "all" ? 1 : 0) + (hsSequenceFilter !== "all" ? 1 : 0)}
                      </span>
                    )}
                  </Button>

                  {/* Filter Dropdown Menu */}
                  {showFilterMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#463939] mb-2">
                            HS Contact
                          </label>
                          <select
                            value={hsContactFilter}
                            onChange={(e) => setHsContactFilter(e.target.value as FilterOption)}
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            <option value="all">All</option>
                            <option value="yes">Created</option>
                            <option value="no">Not Created</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#463939] mb-2">
                            HS Sequence Status
                          </label>
                          <select
                            value={hsSequenceFilter}
                            onChange={(e) => setHsSequenceFilter(e.target.value as FilterOption)}
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            <option value="all">All</option>
                            <option value="yes">Enrolled</option>
                            <option value="no">Not Enrolled</option>
                          </select>
                        </div>
                        <div className="flex justify-end pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilterMenu(false)}
                            className="text-[#407B9D]"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {hsContactFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/20">
                      HS Contact: {hsContactFilter === "yes" ? "Created" : "Not Created"}
                      <button
                        onClick={() => setHsContactFilter("all")}
                        className="ml-1 hover:bg-[#407B9D]/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {hsSequenceFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/20">
                      HS Sequence: {hsSequenceFilter === "yes" ? "Enrolled" : "Not Enrolled"}
                      <button
                        onClick={() => setHsSequenceFilter("all")}
                        className="ml-1 hover:bg-[#407B9D]/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-muted-foreground hover:text-[#407B9D] underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
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
                  {searchTerm || hsContactFilter !== "all" || hsSequenceFilter !== "all"
                    ? "No leads found matching your filters."
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
                      <th className="text-center py-3 px-4 font-medium">HS Sequence Status</th>
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
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-[#C8E4BB] flex items-center justify-center">
                                <Check className="w-4 h-4 text-[#463939]" />
                              </div>
                              {lead.hsContactUrl && (
                                <a
                                  href={lead.hsContactUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#407B9D] hover:text-[#407B9D]/70 transition-colors"
                                  title="Open in HubSpot"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          ) : hsCreatingLeadId === lead.id ? (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-[#407B9D] animate-spin" />
                              </div>
                            </div>
                          ) : hsFailedLeadId === lead.id ? (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                <X className="w-4 h-4 text-red-600" />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateHsContact(lead)}
                              className="h-7 text-xs"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Create
                            </Button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              lead.hsSequenceEnrolled
                                ? "bg-[#C8E4BB] text-[#463939]"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {lead.hsSequenceEnrolled ? "Enrolled" : "Not Enrolled"}
                          </span>
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
