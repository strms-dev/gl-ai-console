"use client"

import { useState, useMemo, useEffect } from "react"
import { LeadsTable } from "@/components/leads/leads-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { LeadForm } from "@/components/leads/lead-form"
import { Lead, stageLabels, stageColors } from "@/lib/dummy-data"
import { getLeads, saveLeads, addLead, updateLead, deleteLead, archiveLead, restoreLead } from "@/lib/leads-store"
import { Archive, RotateCcw, CheckCircle2, Briefcase, Pencil, Trash2, AlertTriangle } from "lucide-react"

type SortField = "stage" | "lastActivity"
type SortOrder = "asc" | "desc"
type TabView = "active" | "completed" | "archived"

export default function SalesPipelinePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("lastActivity")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [leads, setLeads] = useState<Lead[]>([])
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [activeTab, setActiveTab] = useState<TabView>("active")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)

  // State to track collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    leads: false
  })

  // Load leads from Supabase on mount
  useEffect(() => {
    const loadLeads = async () => {
      const fetchedLeads = await getLeads()
      setLeads(fetchedLeads)
    }
    loadLeads()
  }, [])

  // Helper function to convert relative time to sortable number
  const parseActivityTime = (activity: string): number => {
    const now = Date.now()
    if (activity.includes("hour")) {
      const hours = parseInt(activity.match(/\d+/)?.[0] || "0")
      return now - (hours * 60 * 60 * 1000)
    }
    if (activity.includes("day")) {
      const days = parseInt(activity.match(/\d+/)?.[0] || "0")
      return now - (days * 24 * 60 * 60 * 1000)
    }
    return now
  }

  // Generate unique ID for new leads
  const generateLeadId = () => {
    const existingIds = leads.map(lead => parseInt(lead.id.replace('lead-', '')) || 0)
    const maxId = Math.max(...existingIds, 0)
    return `lead-${maxId + 1}`
  }

  // Handle creating a new lead
  const handleCreateLead = async (leadData: Omit<Lead, "id" | "stage" | "lastActivity">) => {
    try {
      const newLead = await addLead({
        ...leadData,
        stage: "demo", // Set to first stage (demo)
        lastActivity: "Just now"
      })
      const updatedLeads = await getLeads()
      setLeads(updatedLeads)
    } catch (error) {
      console.error("Failed to create lead:", error)
      alert("Failed to create project. Please try again.")
    }
  }

  // Handle editing an existing lead
  const handleEditLead = async (leadData: Omit<Lead, "id" | "stage" | "lastActivity">) => {
    if (editingLead) {
      try {
        await updateLead(editingLead.id, leadData)
        const updatedLeads = await getLeads()
        setLeads(updatedLeads)
        setEditingLead(null)
      } catch (error) {
        console.error("Failed to update lead:", error)
        alert("Failed to update project. Please try again.")
      }
    }
  }

  // Open edit form for a specific lead
  const handleOpenEditForm = (lead: Lead) => {
    setEditingLead(lead)
    setShowLeadForm(true)
  }

  // Open delete confirmation dialog
  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead)
    setDeleteDialogOpen(true)
  }

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      try {
        await deleteLead(leadToDelete.id)
        const updatedLeads = await getLeads()
        setLeads(updatedLeads)
      } catch (error) {
        console.error("Failed to delete lead:", error)
        alert("Failed to delete project. Please try again.")
      }
    }
    setDeleteDialogOpen(false)
    setLeadToDelete(null)
  }

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setLeadToDelete(null)
  }

  // Handle archiving a lead
  const handleArchiveLead = async (id: string) => {
    try {
      await archiveLead(id)
      const updatedLeads = await getLeads()
      setLeads(updatedLeads)
    } catch (error) {
      console.error("Failed to archive lead:", error)
      alert("Failed to archive project. Please try again.")
    }
  }

  // Handle restoring an archived lead
  const handleRestoreLead = async (id: string) => {
    try {
      await restoreLead(id)
      const updatedLeads = await getLeads()
      setLeads(updatedLeads)
    } catch (error) {
      console.error("Failed to restore lead:", error)
      alert("Failed to restore project. Please try again.")
    }
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Helper to check if a project is "completed" (terminal state)
  const isProjectCompleted = (lead: Lead): boolean => {
    // Terminal states: not-a-fit, proposal-declined, or kickoff stage completed (onboarding-complete)
    const terminalStatuses = ['not-a-fit', 'proposal-declined', 'onboarding-complete']
    if (lead.projectStatus && terminalStatuses.includes(lead.projectStatus)) {
      return true
    }
    // Also check if stage is kickoff (final stage)
    if (lead.stage === 'kickoff' && lead.projectStatus === 'onboarding-complete') {
      return true
    }
    return false
  }

  // Filter leads by tab
  const getFilteredLeadsByTab = useMemo(() => {
    return leads.filter(lead => {
      // Archived tab: show only archived projects
      if (activeTab === "archived") {
        return lead.archived === true
      }

      // For active and completed tabs, exclude archived projects
      if (lead.archived) {
        return false
      }

      // Completed tab: terminal states (not-a-fit, proposal-declined, onboarding-complete)
      if (activeTab === "completed") {
        return isProjectCompleted(lead)
      }

      // Active tab: everything that's not archived and not completed
      if (activeTab === "active") {
        return !isProjectCompleted(lead)
      }

      return true
    })
  }, [leads, activeTab])

  // Count projects in each tab
  const tabCounts = useMemo(() => {
    const active = leads.filter(lead => !lead.archived && !isProjectCompleted(lead)).length
    const completed = leads.filter(lead => !lead.archived && isProjectCompleted(lead)).length
    const archived = leads.filter(lead => lead.archived === true).length
    return { active, completed, archived }
  }, [leads])

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = getFilteredLeadsByTab

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(lead =>
        lead.projectName.toLowerCase().includes(search) ||
        lead.company.toLowerCase().includes(search) ||
        lead.contact.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search)
      )
    }

    // Sort leads
    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "stage":
          aValue = a.stage
          bValue = b.stage
          break
        case "lastActivity":
          // Convert relative time to sortable number (approximate)
          aValue = parseActivityTime(a.lastActivity)
          bValue = parseActivityTime(b.lastActivity)
          break
        default:
          aValue = a.lastActivity
          bValue = b.lastActivity
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue)
        return sortOrder === "asc" ? result : -result
      } else {
        const result = (aValue as number) - (bValue as number)
        return sortOrder === "asc" ? result : -result
      }
    })
  }, [searchTerm, sortField, sortOrder, parseActivityTime, getFilteredLeadsByTab])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{fontFamily: 'var(--font-heading)'}}>
            Sales Pipeline
          </h1>
          <p className="text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
            Manage and track all projects through the sales pipeline
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('leads')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.leads ? "+" : "−"}
              </Button>
            </div>
          </CardHeader>
          {!collapsedSections.leads && (
            <CardContent className="pt-0">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "active"
                      ? "border-[#407B9D] text-[#407B9D]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Active
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "active"
                      ? "bg-[#407B9D]/10 text-[#407B9D]"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tabCounts.active}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "completed"
                      ? "border-[#407B9D] text-[#407B9D]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "completed"
                      ? "bg-[#407B9D]/10 text-[#407B9D]"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tabCounts.completed}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "archived"
                      ? "border-[#407B9D] text-[#407B9D]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  Archived
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "archived"
                      ? "bg-[#407B9D]/10 text-[#407B9D]"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tabCounts.archived}
                  </span>
                </button>
              </div>

              <div className="mb-4">
                <div className="flex justify-end mb-4">
                  {activeTab !== "archived" && (
                    <Button onClick={() => {
                      setEditingLead(null)
                      setShowLeadForm(true)
                    }}>Add New Project</Button>
                  )}
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by project name, company, contact, or email..."
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
                      <option value="lastActivity">Last Activity</option>
                      <option value="stage">Stage</option>
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
              </div>

              {/* Custom table with archive/restore actions */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Project Name</th>
                      <th className="text-left py-3 px-4 font-medium">Company</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 font-medium">Stage</th>
                      <th className="text-left py-3 px-4 font-medium">Last Activity</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          {activeTab === "archived"
                            ? "No archived projects"
                            : activeTab === "completed"
                            ? "No completed projects"
                            : "No active projects"}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => window.location.href = `/strms/sales-pipeline/projects/${lead.id}`}
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium">{lead.projectName || "—"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{lead.company || "—"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{lead.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{lead.contact || "—"}</p>
                          </td>
                          <td className="py-3 px-4">
                            {(() => {
                              const status = lead.projectStatus || 'active'

                              // Show status-based badges for terminal states
                              if (status === 'not-a-fit') {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Not a Fit
                                  </span>
                                )
                              }
                              if (status === 'proposal-declined') {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Declined Proposal
                                  </span>
                                )
                              }
                              if (status === 'onboarding-complete') {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Onboarding Complete
                                  </span>
                                )
                              }

                              // For active projects, show the stage with proper label and color
                              const stageLabel = stageLabels[lead.stage] || lead.stage
                              const stageColor = stageColors[lead.stage] || "bg-blue-100 text-blue-800"
                              return (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor}`}>
                                  {stageLabel}
                                </span>
                              )
                            })()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{lead.lastActivity}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {/* Edit button - all tabs */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenEditForm(lead)
                                }}
                                className="h-8 w-8 p-0"
                                title="Edit project"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {/* Archive or Restore button based on tab */}
                              {activeTab === "archived" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRestoreLead(lead.id)
                                  }}
                                  className="h-8 w-8 p-0 text-[#407B9D] hover:text-[#407B9D] hover:bg-[#407B9D]/10"
                                  title="Restore project"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleArchiveLead(lead.id)
                                  }}
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                  title="Archive project"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Delete button - all tabs */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(lead)
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete project"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <LeadForm
        open={showLeadForm}
        onOpenChange={(open) => {
          setShowLeadForm(open)
          if (!open) {
            setEditingLead(null)
          }
        }}
        onSubmit={editingLead ? handleEditLead : handleCreateLead}
        initialData={editingLead || undefined}
        mode={editingLead ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl" style={{fontFamily: 'var(--font-heading)'}}>
                Delete Project
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="py-4" style={{fontFamily: 'var(--font-body)'}}>
            <p className="text-base mb-3">
              Are you sure you want to delete <span className="font-semibold text-[#407B9D]">{leadToDelete?.company}</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the project and all associated data.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
