"use client"

import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type ViewMode = "kanban" | "list"

export interface ViewToggleProps {
  currentView: ViewMode
  onChange: (view: ViewMode) => void
  className?: string
}

// ============================================================================
// VIEW TOGGLE COMPONENT
// ============================================================================

export function ViewToggle({ currentView, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("inline-flex items-center rounded-lg bg-[#FAF9F9] p-1 border border-[#E5E5E5]", className)}>
      <button
        onClick={() => onChange("kanban")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          currentView === "kanban"
            ? "bg-[#407B9D] text-white shadow-sm"
            : "text-[#666666] hover:text-[#407B9D] hover:bg-white"
        )}
        style={{fontFamily: 'var(--font-heading)'}}
        title="Kanban View"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Kanban</span>
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          currentView === "list"
            ? "bg-[#407B9D] text-white shadow-sm"
            : "text-[#666666] hover:text-[#407B9D] hover:bg-white"
        )}
        style={{fontFamily: 'var(--font-heading)'}}
        title="List View"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  )
}
