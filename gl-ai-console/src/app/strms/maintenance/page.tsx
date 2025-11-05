"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, User, Calendar, Clock, AlertCircle } from "lucide-react"
import { MaintenanceTicket, maintStageLabels, maintStageColors, sprintLengthLabels } from "@/lib/dummy-data"
import { getMaintTickets, updateMaintTicket, addMaintTicket, deleteMaintTicket, formatMinutes } from "@/lib/project-store"
import { KanbanBoard, StageConfig } from "@/components/shared/kanban-board"
import { ListView, ColumnConfig } from "@/components/shared/list-view"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import { TicketCard } from "@/components/maintenance/ticket-card"
import { TicketForm, TicketFormData } from "@/components/maintenance/ticket-form"
import { TicketDetailModal } from "@/components/maintenance/ticket-detail-modal"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SortField = "ticketTitle" | "customer" | "assignee" | "lastActivity"
type SortOrder = "asc" | "desc"

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("lastActivity")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Load tickets on mount
  useEffect(() => {
    const loadTickets = () => {
      const fetchedTickets = getMaintTickets()
      setTickets(fetchedTickets)
    }
    loadTickets()
  }, [])

  // Kanban stage configuration
  const stages: StageConfig[] = [
    { id: "errors-logged", label: maintStageLabels["errors-logged"], color: maintStageColors["errors-logged"] },
    { id: "on-hold", label: maintStageLabels["on-hold"], color: maintStageColors["on-hold"] },
    { id: "fix-requests", label: maintStageLabels["fix-requests"], color: maintStageColors["fix-requests"] },
    { id: "in-progress", label: maintStageLabels["in-progress"], color: maintStageColors["in-progress"] },
    { id: "closed", label: maintStageLabels.closed, color: maintStageColors.closed }
  ]

  // List view column configuration
  const columns: ColumnConfig<MaintenanceTicket>[] = [
    {
      key: "ticketTitle",
      label: "Ticket Title",
      sortable: true,
      width: "w-1/4",
      render: (ticket) => (
        <div className="font-medium text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
          {ticket.ticketTitle}
        </div>
      )
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      width: "w-1/6",
      render: (ticket) => (
        <span className="text-[#666666]">{ticket.customer}</span>
      )
    },
    {
      key: "ticketType",
      label: "Type",
      sortable: false,
      width: "w-32",
      render: (ticket) => (
        <Badge className={cn(
          "text-xs border-none",
          ticket.ticketType === "Maintenance"
            ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90"
            : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90"
        )}>
          {ticket.ticketType}
        </Badge>
      )
    },
    {
      key: "numberOfErrors",
      label: "Errors",
      sortable: false,
      width: "w-20",
      render: (ticket) => (
        ticket.numberOfErrors > 0 ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{ticket.numberOfErrors}</span>
          </div>
        ) : (
          <span className="text-[#999999]">—</span>
        )
      )
    },
    {
      key: "assignee",
      label: "Assignee",
      sortable: true,
      width: "w-24",
      render: (ticket) => (
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <User className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{ticket.assignee}</span>
        </div>
      )
    },
    {
      key: "timeTracked",
      label: "Time Tracked",
      sortable: false,
      width: "w-28",
      render: (ticket) => (
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <Clock className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{formatMinutes(ticket.timeTracked)}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      width: "w-40",
      render: (ticket) => (
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          maintStageColors[ticket.status]
        )}>
          {ticket.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      )
    }
  ]

  // Handle creating a new ticket
  const handleCreateTicket = (ticketData: TicketFormData) => {
    const newTicket = addMaintTicket(ticketData)
    setTickets(getMaintTickets())
  }

  // Handle editing an existing ticket
  const handleEditTicket = (ticketData: TicketFormData) => {
    if (editingTicket) {
      updateMaintTicket(editingTicket.id, ticketData)
      setTickets(getMaintTickets())
      setEditingTicket(null)
    }
  }

  // Open edit form for a specific ticket
  const handleOpenEditForm = (ticket: MaintenanceTicket) => {
    setEditingTicket(ticket)
    setShowTicketForm(true)
  }

  // Handle deleting a ticket
  const handleDeleteTicket = (id: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      deleteMaintTicket(id)
      setTickets(getMaintTickets())
    }
  }

  // Handle stage change from kanban drag-and-drop
  const handleStageChange = (ticketId: string, newStage: string) => {
    updateMaintTicket(ticketId, { status: newStage as MaintenanceTicket["status"] })
    setTickets(getMaintTickets())
  }

  // Handle ticket click (open modal)
  const handleTicketClick = (ticket: MaintenanceTicket) => {
    setSelectedTicketId(ticket.id)
    setDetailModalOpen(true)
  }

  // Handle ticket updated from modal
  const handleTicketUpdated = () => {
    setTickets(getMaintTickets())
  }

  // Handle ticket deleted from modal
  const handleTicketDeleted = () => {
    setDetailModalOpen(false)
    setSelectedTicketId(null)
    setTickets(getMaintTickets())
  }

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = tickets.filter(ticket =>
        ticket.ticketTitle.toLowerCase().includes(search) ||
        ticket.customer.toLowerCase().includes(search) ||
        ticket.assignee.toLowerCase().includes(search)
      )
    }

    // Sort tickets
    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "ticketTitle":
          aValue = a.ticketTitle
          bValue = b.ticketTitle
          break
        case "customer":
          aValue = a.customer
          bValue = b.customer
          break
        case "assignee":
          aValue = a.assignee
          bValue = b.assignee
          break
        case "lastActivity":
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        default:
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue)
        return sortOrder === "asc" ? result : -result
      } else {
        const result = (aValue as number) - (bValue as number)
        return sortOrder === "asc" ? result : -result
      }
    })
  }, [searchTerm, sortField, sortOrder, tickets])

  // Handle list view sorting
  const handleSort = (key: string) => {
    if (key === sortField) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new field with ascending order
      setSortField(key as SortField)
      setSortOrder("asc")
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#463939] mb-2" style={{fontFamily: 'var(--font-heading)'}}>
            Maintenance
          </h1>
          <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            Track maintenance requests and customizations from error logging through resolution
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTicket(null)
            setShowTicketForm(true)
          }}
          className="bg-[#407B9D] hover:bg-[#407B9D]/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {/* View Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle style={{fontFamily: 'var(--font-heading)'}}>
              Maintenance Tickets ({filteredAndSortedTickets.length})
            </CardTitle>
            <ViewToggle currentView={viewMode} onChange={setViewMode} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by ticket title, customer, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            {viewMode === "list" && (
              <div className="flex gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="h-10 w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <option value="lastActivity">Last Activity</option>
                  <option value="ticketTitle">Ticket Title</option>
                  <option value="customer">Customer</option>
                  <option value="assignee">Assignee</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="h-10 w-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
            )}
          </div>

          {/* View Content */}
          {viewMode === "kanban" ? (
            <KanbanBoard
              items={filteredAndSortedTickets}
              stages={stages}
              getItemStage={(ticket) => ticket.status}
              getItemId={(ticket) => ticket.id}
              onItemClick={handleTicketClick}
              onStageChange={handleStageChange}
              renderCard={(ticket) => <TicketCard ticket={ticket} />}
              emptyMessage="No tickets in this stage"
            />
          ) : (
            <ListView
              items={filteredAndSortedTickets}
              columns={columns}
              onItemClick={handleTicketClick}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              emptyMessage="No tickets found"
            />
          )}
        </CardContent>
      </Card>

      {/* Ticket Form Dialog */}
      <TicketForm
        open={showTicketForm}
        onOpenChange={(open) => {
          setShowTicketForm(open)
          if (!open) {
            setEditingTicket(null)
          }
        }}
        onSubmit={editingTicket ? handleEditTicket : handleCreateTicket}
        initialData={editingTicket || undefined}
        mode={editingTicket ? "edit" : "create"}
      />

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onTicketDeleted={handleTicketDeleted}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </div>
  )
}
