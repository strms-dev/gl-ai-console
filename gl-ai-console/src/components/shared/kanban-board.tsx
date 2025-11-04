"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface StageConfig {
  id: string
  label: string
  color: string // Tailwind color classes like "bg-blue-100 text-blue-800"
}

export interface KanbanBoardProps<T> {
  items: T[]
  stages: StageConfig[]
  getItemStage: (item: T) => string
  getItemId: (item: T) => string
  onItemClick?: (item: T) => void
  onStageChange: (itemId: string, newStage: string) => void
  renderCard: (item: T) => React.ReactNode
  emptyMessage?: string
  className?: string
}

// ============================================================================
// KANBAN BOARD COMPONENT
// ============================================================================

export function KanbanBoard<T>({
  items,
  stages,
  getItemStage,
  getItemId,
  onItemClick,
  onStageChange,
  renderCard,
  emptyMessage = "No items to display",
  className
}: KanbanBoardProps<T>) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  // Group items by stage
  const itemsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = items.filter(item => getItemStage(item) === stage.id)
    return acc
  }, {} as Record<string, T[]>)

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, item: T) => {
    const itemId = getItemId(item)
    setDraggedItemId(itemId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", itemId)
  }

  const handleDragEnd = () => {
    setDraggedItemId(null)
    setDragOverStage(null)
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData("text/plain")

    if (itemId && itemId !== "") {
      onStageChange(itemId, stageId)
    }

    setDraggedItemId(null)
    setDragOverStage(null)
  }

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {stages.map((stage) => {
        const stageItems = itemsByStage[stage.id] || []
        const isDragOver = dragOverStage === stage.id

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 bg-[#FAF9F9] rounded-lg"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="p-4 border-b border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="font-semibold text-[#463939]"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  {stage.label}
                </h3>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    stage.color
                  )}
                >
                  {stageItems.length}
                </span>
              </div>
            </div>

            {/* Stage Content */}
            <div
              className={cn(
                "p-3 min-h-[200px] transition-colors duration-200",
                isDragOver && "bg-[#95CBD7]/10"
              )}
            >
              {stageItems.length === 0 ? (
                <div className="text-center py-8 text-[#999999] text-sm" style={{fontFamily: 'var(--font-body)'}}>
                  {emptyMessage}
                </div>
              ) : (
                <div className="space-y-3">
                  {stageItems.map((item) => {
                    const itemId = getItemId(item)
                    const isDragging = draggedItemId === itemId

                    return (
                      <div
                        key={itemId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onItemClick?.(item)}
                        className={cn(
                          "bg-white rounded-lg shadow-sm border border-[#E5E5E5] transition-all duration-200 cursor-grab active:cursor-grabbing",
                          "hover:shadow-md hover:scale-[1.02]",
                          isDragging && "opacity-50",
                          onItemClick && "cursor-pointer"
                        )}
                      >
                        {renderCard(item)}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
