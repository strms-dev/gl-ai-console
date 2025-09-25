"use client"

import { useState, useMemo, useEffect } from "react"
import { LeadsTable } from "@/components/leads/leads-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadForm } from "@/components/leads/lead-form"
import { Lead } from "@/lib/dummy-data"
import { getLeads, saveLeads, addLead, updateLead, deleteLead } from "@/lib/leads-store"

type SortField = "stage" | "lastActivity"
type SortOrder = "asc" | "desc"

export default function STRMSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("lastActivity")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [leads, setLeads] = useState<Lead[]>([])
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // State to track collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    leads: false,
    assistant: false
  })

  // Load leads from localStorage on mount
  useEffect(() => {
    setLeads(getLeads())
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
  const handleCreateLead = (leadData: Omit<Lead, "id" | "stage" | "lastActivity">) => {
    const newLead: Lead = {
      ...leadData,
      id: generateLeadId(),
      stage: "demo", // Set to first stage (demo)
      lastActivity: "Just now"
    }
    addLead(newLead)
    setLeads(getLeads()) // Refresh local state
  }

  // Handle editing an existing lead
  const handleEditLead = (leadData: Omit<Lead, "id" | "stage" | "lastActivity">) => {
    if (editingLead) {
      updateLead(editingLead.id, leadData)
      setLeads(getLeads()) // Refresh local state
      setEditingLead(null)
    }
  }

  // Open edit form for a specific lead
  const handleOpenEditForm = (lead: Lead) => {
    setEditingLead(lead)
    setShowLeadForm(true)
  }

  // Handle deleting a lead
  const handleDeleteLead = (id: string) => {
    deleteLead(id)
    setLeads(getLeads()) // Refresh local state
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = leads.filter(lead =>
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
  }, [searchTerm, sortField, sortOrder, parseActivityTime, leads])

  return (
    <div className="p-8 bg-muted/30">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sales Pipeline
          </h1>
          <p className="text-muted-foreground">
            Manage and track all leads through the sales pipeline
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leads</CardTitle>
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
              <div className="mb-4">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowLeadForm(true)}>Add New Lead</Button>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by company, contact, or email..."
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

              <LeadsTable
                leads={filteredAndSortedLeads}
                onEditLead={handleOpenEditForm}
                onDeleteLead={handleDeleteLead}
                searchTerm=""
                setSearchTerm={() => {}}
                sortField="lastActivity"
                setSortField={() => {}}
                sortOrder="desc"
                setSortOrder={() => {}}
                onAddNewLead={() => {}}
                hideCard={true}
              />
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>STRMS AI Assistant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('assistant')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.assistant ? "+" : "−"}
              </Button>
            </div>
          </CardHeader>
          {!collapsedSections.assistant && (
            <ChatInterface title="STRMS AI Assistant" hideHeader={true} />
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
    </div>
  );
}