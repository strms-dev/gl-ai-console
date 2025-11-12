"use client"

import { useState, useEffect } from "react"
import {
  DevelopmentProject,
  MaintenanceTicket,
  Developer,
  devStageLabels,
  maintStageLabels
} from "@/lib/dummy-data"
import {
  getDevProjects,
  getMaintTickets,
  updateDevProjectPriority,
  updateMaintTicketPriority,
  deleteDevProject,
  deleteMaintTicket
} from "@/lib/project-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, GripVertical, Clock, Calendar, Plus, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { cn } from "@/lib/utils"
import { ProjectDetailModal } from "@/components/project-management/project-detail-modal"
import { TicketDetailModal } from "@/components/maintenance/ticket-detail-modal"

interface DeveloperUnifiedViewProps {
  developer: Developer
  onDeveloperChange?: (developer: Developer) => void
}

type WorkItemType = "dev" | "maint"

interface UnifiedWorkItem {
  id: string
  type: WorkItemType
  name: string
  customer: string
  status: string
  statusLabel: string
  timeTracked: number
  startDate: string
  endDate: string
  priority: number
  completedDate?: string
  data: DevelopmentProject | MaintenanceTicket
}

export function DeveloperUnifiedView({ developer, onDeveloperChange }: DeveloperUnifiedViewProps) {
  const [viewMode, setViewMode] = useState<"active" | "completed">("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [workItems, setWorkItems] = useState<UnifiedWorkItem[]>([])
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<UnifiedWorkItem | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null)
  const [selectedItem, setSelectedItem] = useState<UnifiedWorkItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)
  const [createTicketModalOpen, setCreateTicketModalOpen] = useState(false)

  // Load and combine work items
  useEffect(() => {
    const devProjects = getDevProjects()
    const maintTickets = getMaintTickets()

    // Filter by developer
    const devFiltered = devProjects.filter(p => p.assignee === developer)
    const maintFiltered = maintTickets.filter(t => t.assignee === developer)

    // Filter by view mode
    let devForView: DevelopmentProject[]
    let maintForView: MaintenanceTicket[]

    if (viewMode === "active") {
      // Active: exclude completed/cancelled dev projects, exclude errors-logged/closed tickets
      devForView = devFiltered.filter(p =>
        p.status !== "complete" && p.status !== "cancelled"
      )
      maintForView = maintFiltered.filter(t =>
        t.status !== "errors-logged" && t.status !== "closed"
      )
    } else {
      // Completed: only completed/cancelled dev projects, only closed tickets
      devForView = devFiltered.filter(p =>
        p.status === "complete" || p.status === "cancelled"
      )
      maintForView = maintFiltered.filter(t =>
        t.status === "closed"
      )
    }

    // Convert to unified format
    const devItems: UnifiedWorkItem[] = devForView.map(p => ({
      id: p.id,
      type: "dev" as WorkItemType,
      name: p.projectName,
      customer: p.customer,
      status: p.status,
      statusLabel: devStageLabels[p.status],
      timeTracked: p.timeTracked,
      startDate: p.startDate,
      endDate: p.endDate,
      priority: p.priority,
      completedDate: p.completedDate,
      data: p
    }))

    const maintItems: UnifiedWorkItem[] = maintForView.map(t => ({
      id: t.id,
      type: "maint" as WorkItemType,
      name: t.ticketTitle,
      customer: t.customer,
      status: t.status,
      statusLabel: maintStageLabels[t.status],
      timeTracked: t.timeTracked,
      startDate: t.startDate,
      endDate: t.endDate,
      priority: t.priority,
      completedDate: t.completedDate,
      data: t
    }))

    // Combine and sort
    let combined = [...devItems, ...maintItems]

    // Sort by completion date (most recent first) for completed view, or by priority for active view
    if (viewMode === "completed") {
      combined.sort((a, b) => {
        // Sort by completion date descending (most recent first)
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0
        return dateB - dateA
      })
    } else {
      combined.sort((a, b) => a.priority - b.priority)
    }

    setWorkItems(combined)
  }, [developer, viewMode])

  // Filter by search query
  const filteredItems = workItems.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      (item.customer && item.customer.toLowerCase().includes(query))
    )
  })

  // Format time tracked
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  // Format date range
  const formatDateRange = (start: string, end: string): string => {
    if (!start || !end) return "Not scheduled"
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  // Format completion date
  const formatCompletedDate = (date?: string): string => {
    if (!date) return "Unknown"
    const completedDate = new Date(date)
    return completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Handle item click
  const handleItemClick = (item: UnifiedWorkItem) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedItem(null)
  }

  // Handle item updated
  const handleItemUpdated = () => {
    console.log('handleItemUpdated called - reloading work items')
    // Reload work items to reflect changes
    const devProjects = getDevProjects()
    const maintTickets = getMaintTickets()
    console.log('Loaded projects:', devProjects.length, 'tickets:', maintTickets.length)

    const devFiltered = devProjects.filter(p => p.assignee === developer)
    const maintFiltered = maintTickets.filter(t => t.assignee === developer)

    let devForView: DevelopmentProject[]
    let maintForView: MaintenanceTicket[]

    if (viewMode === "active") {
      devForView = devFiltered.filter(p =>
        p.status !== "complete" && p.status !== "cancelled"
      )
      maintForView = maintFiltered.filter(t =>
        t.status !== "errors-logged" && t.status !== "closed"
      )
    } else {
      devForView = devFiltered.filter(p =>
        p.status === "complete" || p.status === "cancelled"
      )
      maintForView = maintFiltered.filter(t =>
        t.status === "closed"
      )
    }

    const devItems: UnifiedWorkItem[] = devForView.map(p => ({
      id: p.id,
      type: "dev" as WorkItemType,
      name: p.projectName,
      customer: p.customer,
      status: p.status,
      statusLabel: devStageLabels[p.status],
      timeTracked: p.timeTracked,
      startDate: p.startDate,
      endDate: p.endDate,
      priority: p.priority,
      completedDate: p.completedDate,
      data: p
    }))

    const maintItems: UnifiedWorkItem[] = maintForView.map(t => ({
      id: t.id,
      type: "maint" as WorkItemType,
      name: t.ticketTitle,
      customer: t.customer,
      status: t.status,
      statusLabel: maintStageLabels[t.status],
      timeTracked: t.timeTracked,
      startDate: t.startDate,
      endDate: t.endDate,
      priority: t.priority,
      completedDate: t.completedDate,
      data: t
    }))

    // Combine and sort
    let combined = [...devItems, ...maintItems]

    // Sort by completion date (most recent first) for completed view, or by priority for active view
    if (viewMode === "completed") {
      combined.sort((a, b) => {
        // Sort by completion date descending (most recent first)
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0
        return dateB - dateA
      })
    } else {
      combined.sort((a, b) => a.priority - b.priority)
    }

    setWorkItems(combined)
  }

  // Handle item deleted
  const handleItemDeleted = () => {
    handleModalClose()
    handleItemUpdated()
  }

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent, item: UnifiedWorkItem) => {
    e.stopPropagation() // Prevent opening the modal
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === "dev") {
        deleteDevProject(itemToDelete.id)
      } else {
        deleteMaintTicket(itemToDelete.id)
      }
      setItemToDelete(null)
      handleItemUpdated()
    }
  }

  // Handle project created
  const handleProjectCreated = () => {
    handleItemUpdated()
  }

  // Handle ticket created
  const handleTicketCreated = () => {
    handleItemUpdated()
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setDraggedItemId(null)
    setDragOverItemId(null)
    setDropPosition(null)
  }

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"

    if (draggedItemId === itemId) return

    // Calculate if hovering over top or bottom half
    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const position = e.clientY < midpoint ? 'above' : 'below'

    setDragOverItemId(itemId)
    setDropPosition(position)
  }

  const handleDragLeave = () => {
    setDragOverItemId(null)
    setDropPosition(null)
  }

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault()

    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null)
      setDragOverItemId(null)
      setDropPosition(null)
      return
    }

    const draggedIndex = filteredItems.findIndex(item => item.id === draggedItemId)
    const targetIndex = filteredItems.findIndex(item => item.id === targetItemId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Reorder items
    const newItems = [...filteredItems]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    // Update priorities
    newItems.forEach((item, index) => {
      const newPriority = index + 1
      if (item.type === "dev") {
        updateDevProjectPriority(item.id, newPriority)
      } else {
        updateMaintTicketPriority(item.id, newPriority)
      }
    })

    // Refresh the list
    setWorkItems(prev => {
      const updated = [...prev]
      newItems.forEach((item, index) => {
        const itemIndex = updated.findIndex(i => i.id === item.id)
        if (itemIndex !== -1) {
          updated[itemIndex].priority = index + 1
        }
      })
      return updated.sort((a, b) => a.priority - b.priority)
    })

    setDraggedItemId(null)
    setDragOverItemId(null)
    setDropPosition(null)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold text-[#463939] mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Developer Work
        </h1>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          Manage and prioritize your development projects and maintenance tickets
        </p>
      </div>

      {/* Developer Selector (if callback provided) */}
      {onDeveloperChange && (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onDeveloperChange("Nick")}
            variant={developer === "Nick" ? "default" : "outline"}
            className={cn(
              "transition-all px-6 py-2",
              developer === "Nick" && "bg-[#407B9D] hover:bg-[#407B9D]/90"
            )}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Nick
          </Button>
          <Button
            onClick={() => onDeveloperChange("Gon")}
            variant={developer === "Gon" ? "default" : "outline"}
            className={cn(
              "transition-all px-6 py-2",
              developer === "Gon" && "bg-[#407B9D] hover:bg-[#407B9D]/90"
            )}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Gon
          </Button>
        </div>
      )}

      {/* Active/Completed Toggle and Create Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode("active")}
            variant={viewMode === "active" ? "default" : "outline"}
            className={cn(
              "transition-all px-6 py-2",
              viewMode === "active" && "bg-[#407B9D] hover:bg-[#407B9D]/90"
            )}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Active Work
          </Button>
          <Button
            onClick={() => setViewMode("completed")}
            variant={viewMode === "completed" ? "default" : "outline"}
            className={cn(
              "transition-all px-6 py-2",
              viewMode === "completed" && "bg-[#407B9D] hover:bg-[#407B9D]/90"
            )}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Completed Work
          </Button>
        </div>

        {/* Create Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreateProjectModalOpen(true)}
            className="bg-[#407B9D] hover:bg-[#407B9D]/90 transition-all"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <Button
            onClick={() => setCreateTicketModalOpen(true)}
            className="bg-[#95CBD7] hover:bg-[#95CBD7]/90 text-[#463939] transition-all"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search projects and tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>

      {/* Work Items List */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              {searchQuery
                ? "No items match your search"
                : `No ${viewMode} work items`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                draggable={viewMode === "active"}
                onDragStart={(e) => viewMode === "active" ? handleDragStart(e, item.id) : undefined}
                onDragEnd={viewMode === "active" ? handleDragEnd : undefined}
                onDragOver={(e) => viewMode === "active" ? handleDragOver(e, item.id) : undefined}
                onDragLeave={viewMode === "active" ? handleDragLeave : undefined}
                onDrop={(e) => viewMode === "active" ? handleDrop(e, item.id) : undefined}
                className={cn(
                  "flex items-center gap-4 p-4 transition-all relative group",
                  viewMode === "active" ? "cursor-move" : "cursor-default",
                  "hover:bg-[#95CBD7]/10",
                  draggedItemId === item.id && "opacity-30 bg-gray-100"
                )}
              >
                {/* Drop indicator line - above */}
                {dragOverItemId === item.id && dropPosition === 'above' && draggedItemId !== item.id && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#407B9D] z-10 shadow-lg">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#407B9D] rounded-full -translate-x-1/2" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#407B9D] rounded-full translate-x-1/2" />
                  </div>
                )}
                {/* Drop indicator line - below */}
                {dragOverItemId === item.id && dropPosition === 'below' && draggedItemId !== item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#407B9D] z-10 shadow-lg">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#407B9D] rounded-full -translate-x-1/2" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#407B9D] rounded-full translate-x-1/2" />
                  </div>
                )}

                {/* Drag Handle (only show for active items) */}
                {viewMode === "active" && (
                  <div className="flex-shrink-0">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                {/* Content */}
                <div
                  className="flex-1 grid grid-cols-12 gap-4 items-center cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Type Badge */}
                  <div className="col-span-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        item.type === "dev"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-orange-100 text-orange-800 border-orange-200"
                      )}
                    >
                      {item.type === "dev" ? "Dev" : "Maint"}
                    </Badge>
                  </div>

                  {/* Name */}
                  <div className="col-span-4">
                    <p
                      className="font-medium text-[#463939] truncate"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {item.name}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="col-span-2">
                    <p
                      className="text-sm text-muted-foreground truncate"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {item.customer}
                    </p>
                  </div>

                  {/* Time Tracked */}
                  <div className="col-span-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {formatTime(item.timeTracked)}
                    </span>
                  </div>

                  {/* Date Range or Completion Date */}
                  <div className="col-span-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {viewMode === "completed"
                        ? formatCompletedDate(item.completedDate)
                        : formatDateRange(item.startDate, item.endDate)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <Badge variant="secondary" className="font-medium">
                      {item.statusLabel}
                    </Badge>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteClick(e, item)}
                  className="flex-shrink-0 text-[#999999] hover:text-red-600 transition-colors p-2 opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        <span>{filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}</span>
        <span>
          {viewMode === "completed"
            ? "Sorted by completion date (most recent first)"
            : "Drag items to reorder by priority"}
        </span>
      </div>

      {/* Detail Modals */}
      {selectedItem && selectedItem.type === "dev" && (
        <ProjectDetailModal
          projectId={selectedItem.id}
          mode="edit"
          open={modalOpen}
          onOpenChange={setModalOpen}
          onProjectDeleted={handleItemDeleted}
          onProjectUpdated={handleItemUpdated}
        />
      )}
      {selectedItem && selectedItem.type === "maint" && (
        <TicketDetailModal
          ticketId={selectedItem.id}
          mode="edit"
          open={modalOpen}
          onOpenChange={setModalOpen}
          onTicketDeleted={handleItemDeleted}
          onTicketUpdated={handleItemUpdated}
        />
      )}

      {/* Create Project Modal */}
      <ProjectDetailModal
        projectId={null}
        mode="create"
        initialAssignee={developer}
        open={createProjectModalOpen}
        onOpenChange={setCreateProjectModalOpen}
        onProjectCreated={handleProjectCreated}
      />

      {/* Create Ticket Modal */}
      <TicketDetailModal
        ticketId={null}
        mode="create"
        initialAssignee={developer}
        open={createTicketModalOpen}
        onOpenChange={setCreateTicketModalOpen}
        onTicketCreated={handleTicketCreated}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title={`Delete ${itemToDelete?.type === "dev" ? "Project" : "Ticket"}`}
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone and all associated time entries will be lost.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
