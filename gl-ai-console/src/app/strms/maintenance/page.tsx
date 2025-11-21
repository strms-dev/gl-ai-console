"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, User, Clock, AlertCircle } from "lucide-react"
import { MaintenanceTicket, maintStageLabels, maintStageColors, Developer } from "@/lib/types"
import { getMaintTickets, updateMaintTicket } from "@/lib/services/maintenance-service"
import { formatMinutes } from "@/lib/services/time-tracking-service"
import { KanbanBoard, StageConfig } from "@/components/shared/kanban-board"
import { ListView, ColumnConfig } from "@/components/shared/list-view"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import { TicketCard } from "@/components/maintenance/ticket-card"
// import { TicketForm, TicketFormData } from "@/components/maintenance/ticket-form" // No longer needed
import { TicketDetailModal } from "@/components/maintenance/ticket-detail-modal"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "active" | "completed"

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Load tickets on mount
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true)
        const fetchedTickets = await getMaintTickets()
        setTickets(fetchedTickets)
      } catch (error) {
        console.error("Error loading tickets:", error)
      } finally {
        setLoading(false)
      }
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
  const handleTicketCreated = async () => {
    try {
      const fetchedTickets = await getMaintTickets()
      setTickets(fetchedTickets)
    } catch (error) {
      console.error("Error reloading tickets:", error)
    }
  }

  // Handle ticket updated
  const handleTicketUpdated = async () => {
    try {
      const fetchedTickets = await getMaintTickets()
      setTickets(fetchedTickets)
    } catch (error) {
      console.error("Error reloading tickets:", error)
    }
  }

  // Handle ticket deleted
  const handleTicketDeleted = async () => {
    try {
      const fetchedTickets = await getMaintTickets()
      setTickets(fetchedTickets)
      setSelectedTicketId(null)
      setDetailModalOpen(false)
    } catch (error) {
      console.error("Error reloading tickets:", error)
    }
  }

  // Handle stage change from kanban drag-and-drop
  const handleStageChange = async (ticketId: string, newStage: string) => {
    try {
      await updateMaintTicket(ticketId, { status: newStage as MaintenanceTicket["status"] })
      const fetchedTickets = await getMaintTickets()
      setTickets(fetchedTickets)
    } catch (error) {
      console.error("Error updating ticket status:", error)
    }
  }

  // Handle ticket click (open modal)
  const handleTicketClick = (ticket: MaintenanceTicket) => {
    setSelectedTicketId(ticket.id)
    setDetailModalOpen(true)
  }

  // Filter tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets

    // Filter by assignee
    if (assigneeFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.assignee === assigneeFilter)
    }

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter(ticket =>
        ticket.status === "errors-logged" ||
        ticket.status === "on-hold" ||
        ticket.status === "fix-requests" ||
        ticket.status === "in-progress"
      )
    } else if (statusFilter === "completed") {
      filtered = filtered.filter(ticket =>
        ticket.status === "closed"
      )
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(ticket =>
        ticket.ticketTitle.toLowerCase().includes(search) ||
        ticket.customer.toLowerCase().includes(search)
      )
    }

    // Sort by last activity (most recent first)
    return filtered.sort((a, b) => {
      const aValue = new Date(a.updatedAt).getTime()
      const bValue = new Date(b.updatedAt).getTime()
      return bValue - aValue // Descending order (newest first)
    })
  }, [searchTerm, assigneeFilter, statusFilter, tickets])


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
          onClick={() => setCreateModalOpen(true)}
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
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by ticket title or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                style={{fontFamily: 'var(--font-body)'}}
              >
                <option value="all">All Assignees</option>
                <option value="Nick">Nick</option>
                <option value="Gon">Gon</option>
              </select>
              {viewMode === "list" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>

          {/* View Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                Loading tickets...
              </div>
            </div>
          ) : viewMode === "kanban" ? (
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
              emptyMessage="No tickets found"
            />
          )}
        </CardContent>
      </Card>

      {/* Ticket Form Dialog */}
      {/* Create Ticket Modal */}
      <TicketDetailModal
        ticketId={null}
        mode="create"
        initialAssignee={assigneeFilter !== "all" ? assigneeFilter as Developer : undefined}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onTicketCreated={handleTicketCreated}
      />

      {/* Ticket Detail Modal (Edit) */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          mode="edit"
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onTicketUpdated={handleTicketUpdated}
          onTicketDeleted={handleTicketDeleted}
        />
      )}
    </div>
  )
}
