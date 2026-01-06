"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Plus, Trash2, AlertTriangle, Search, ExternalLink } from "lucide-react"
import {
  PipelineDeal,
  getPipelineDeals,
  addPipelineDeal,
  updatePipelineDeal,
  deletePipelineDeal,
} from "@/lib/revops-pipeline-store"

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

// Automation stage options (matches Sales Pipeline Timeline stages)
const automationStageOptions = [
  "Demo Call",
  "Sales Intake",
  "Follow-Up Email",
  "Reminder Sequence",
  "Internal Team Assignment",
  "General Ledger Review",
  "GL Review Comparison",
  "Create Quote",
  "Quote Sent",
  "Quote Approved",
  "Prepare Engagement Walkthrough",
  "EA Internal Review",
  "Send Engagement",
  "Closed Won",
  "Closed Lost",
]

// HubSpot stage options (used for sorting)
const hsStageOptions = [
  "MQO - Meeting Booked",
  "MQO - Financial Review",
  "SQL - Need Info",
  "SQL - Create Quote",
  "SQO - Quote Sent",
  "Prepare EA",
  "EA Ready for Review",
  "EA Sent",
  "Closed won",
  "Closed lost",
]

export default function SalesPipelinePage() {
  const router = useRouter()
  const [deals, setDeals] = useState<PipelineDeal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showDealForm, setShowDealForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState<PipelineDeal | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<PipelineDeal | null>(null)

  // Sort state: 'updated' = by last updated, 'automationStage' = by timeline stage order, 'hsStage' = by HS Stage order
  const [sortBy, setSortBy] = useState<'updated' | 'hsStage' | 'automationStage'>('updated')

  // Form state (stage and hsStage are auto-filled, not user-editable)
  const [formData, setFormData] = useState({
    dealName: "",
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
  })

  // Loading state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load deals from Supabase on mount
  useEffect(() => {
    const loadDeals = async () => {
      setIsLoading(true)
      const data = await getPipelineDeals()
      setDeals(data)
      setIsLoading(false)
    }
    loadDeals()
  }, [])

  // Reset form when dialog closes or editing deal changes
  useEffect(() => {
    if (editingDeal) {
      setFormData({
        dealName: editingDeal.dealName,
        companyName: editingDeal.companyName,
        firstName: editingDeal.firstName || "",
        lastName: editingDeal.lastName || "",
        email: editingDeal.email || "",
      })
    } else {
      setFormData({
        dealName: "",
        companyName: "",
        firstName: "",
        lastName: "",
        email: "",
      })
    }
  }, [editingDeal, showDealForm])

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (deal) =>
          deal.dealName.toLowerCase().includes(search) ||
          deal.companyName.toLowerCase().includes(search) ||
          deal.stage.toLowerCase().includes(search) ||
          (deal.hsStage && deal.hsStage.toLowerCase().includes(search))
      )
    }

    // Sort based on sortBy state
    if (sortBy === 'hsStage') {
      // Sort by HS Stage order (based on hsStageOptions array index)
      return filtered.sort((a, b) => {
        const aIndex = a.hsStage ? hsStageOptions.indexOf(a.hsStage) : hsStageOptions.length
        const bIndex = b.hsStage ? hsStageOptions.indexOf(b.hsStage) : hsStageOptions.length
        return aIndex - bIndex
      })
    }

    if (sortBy === 'automationStage') {
      // Sort by Automation Stage order (based on automationStageOptions array index)
      return filtered.sort((a, b) => {
        const aIndex = a.stage ? automationStageOptions.indexOf(a.stage) : automationStageOptions.length
        const bIndex = b.stage ? automationStageOptions.indexOf(b.stage) : automationStageOptions.length
        return aIndex - bIndex
      })
    }

    // Default: Sort by most recently updated (descending)
    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [searchTerm, deals, sortBy])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingDeal) {
        // Update existing deal (stage and hsStage are not editable via form)
        await updatePipelineDeal(editingDeal.id, {
          dealName: formData.dealName,
          companyName: formData.companyName,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          email: formData.email || null,
        })
      } else {
        // Add new deal with default stage values (auto-filled)
        await addPipelineDeal({
          dealName: formData.dealName,
          companyName: formData.companyName,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          email: formData.email || null,
          stage: "Demo Call", // Default automation stage (first stage in timeline)
          hsStage: "MQO - Meeting Booked", // Default HubSpot stage
        })
      }

      // Refresh deals list
      const updatedDeals = await getPipelineDeals()
      setDeals(updatedDeals)
      setShowDealForm(false)
      setEditingDeal(null)
    } catch (error) {
      console.error("Error saving deal:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete click
  const handleDeleteClick = (deal: PipelineDeal) => {
    setDealToDelete(deal)
    setDeleteDialogOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (dealToDelete) {
      await deletePipelineDeal(dealToDelete.id)
      const updatedDeals = await getPipelineDeals()
      setDeals(updatedDeals)
    }
    setDeleteDialogOpen(false)
    setDealToDelete(null)
  }

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setDealToDelete(null)
  }

  // Open edit form
  const handleEdit = (deal: PipelineDeal) => {
    setEditingDeal(deal)
    setShowDealForm(true)
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
            Sales Pipeline
          </h1>
          <p
            className="text-[#666666]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Track and manage your sales pipeline deals
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
                Deals
              </CardTitle>
              <Button
                onClick={() => {
                  setEditingDeal(null)
                  setShowDealForm(true)
                }}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Sort */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by deal name, company, or stage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'updated' | 'hsStage' | 'automationStage')}
                  className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="updated">Last Updated</option>
                  <option value="automationStage">Automation Stage</option>
                  <option value="hsStage">HS Stage</option>
                </select>
              </div>
            </div>

            {/* Deals Table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p
                  className="text-[#666666]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Loading deals...
                </p>
              </div>
            ) : filteredAndSortedDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p
                  className="text-[#666666]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {searchTerm
                    ? "No deals found matching your search."
                    : "No deals yet. Add your first deal to get started."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Deal Name</th>
                      <th className="text-left py-3 px-4 font-medium">Company Name</th>
                      <th className="text-left py-3 px-4 font-medium">Automation Stage</th>
                      <th className="text-left py-3 px-4 font-medium">HS Stage</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-left py-3 px-4 font-medium">Updated</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedDeals.map((deal) => (
                      <tr
                        key={deal.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={(e) => {
                          // Prevent navigation when clicking on buttons or links
                          if ((e.target as HTMLElement).closest('button, a')) {
                            return
                          }
                          router.push(`/revops/sales-pipeline/deals/${deal.id}`)
                        }}
                      >
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-2">
                            {deal.dealName}
                            <a
                              href="https://app.hubspot.com/contacts/4723689/objects/0-3/views/all/board"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#407B9D] hover:text-[#407B9D]/80 transition-colors"
                              title="View in HubSpot"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </td>
                        <td className="py-3 px-4">{deal.companyName}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#95CBD7]/30 text-[#407B9D]">
                            {deal.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {deal.hsStage ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C8E4BB]/50 text-[#463939]">
                              {deal.hsStage}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(deal.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(deal.updatedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(deal)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(deal)}
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

        {/* Add/Edit Deal Dialog */}
        <Dialog open={showDealForm} onOpenChange={setShowDealForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                {editingDeal ? "Edit Deal" : "Add New Deal"}
              </DialogTitle>
              <DialogDescription>
                {editingDeal
                  ? "Update the deal information below."
                  : "Enter the details for the new deal."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dealName">Deal Name *</Label>
                  <Input
                    id="dealName"
                    value={formData.dealName}
                    onChange={(e) =>
                      setFormData({ ...formData, dealName: e.target.value })
                    }
                    required
                  />
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDealForm(false)
                    setEditingDeal(null)
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
                    ? (editingDeal ? "Saving..." : "Adding...")
                    : (editingDeal ? "Save Changes" : "Add Deal")}
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
                  Delete Deal
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="py-4" style={{ fontFamily: "var(--font-body)" }}>
              <p className="text-base mb-3">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#407B9D]">
                  {dealToDelete?.dealName}
                </span>
                ?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. This will permanently delete the
                deal and all associated data.
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
                  Delete Deal
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
