"use client"

import { useState, useMemo, useEffect } from "react"
import { LeadsTable } from "@/components/leads/leads-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadForm } from "@/components/leads/lead-form"
import { Lead } from "@/lib/dummy-data"
import { getLeads, saveLeads, addLead, updateLead } from "@/lib/leads-store"

type SortField = "stage" | "lastActivity"
type SortOrder = "asc" | "desc"

export default function STRMSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("lastActivity")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [leads, setLeads] = useState<Lead[]>([])
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

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
            All Leads
          </h1>
          <p className="text-muted-foreground">
            Manage and track all leads through the onboarding pipeline
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowLeadForm(true)}>Add New Lead</Button>
        </div>
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

      <div className="space-y-8">
        <LeadsTable leads={filteredAndSortedLeads} onEditLead={handleOpenEditForm} />

        <ChatInterface title="STRMS AI Assistant" />
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