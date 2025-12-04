"use client"

import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusOption<TStatus extends string> {
  value: TStatus
  label: string
}

interface BulkActionBarProps<TStatus extends string> {
  selectedCount: number
  onClearSelection: () => void
  onBulkDelete: () => void
  onBulkStatusChange: (status: TStatus) => void
  statusOptions: StatusOption<TStatus>[]
  deleteLoading?: boolean
  statusLoading?: boolean
  className?: string
}

export function BulkActionBar<TStatus extends string>({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  statusOptions,
  deleteLoading,
  statusLoading,
  className
}: BulkActionBarProps<TStatus>) {
  if (selectedCount === 0) return null

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
      "bg-white border border-[#E5E5E5] rounded-lg shadow-lg",
      "px-4 py-3 flex items-center gap-4",
      className
    )}>
      {/* Selection count */}
      <span className="text-sm font-medium text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
        {selectedCount} selected
      </span>

      {/* Clear selection */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-[#666666] hover:text-[#463939]"
      >
        <X className="w-4 h-4 mr-1" />
        Clear
      </Button>

      <div className="h-6 w-px bg-[#E5E5E5]" />

      {/* Status change dropdown */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            onBulkStatusChange(e.target.value as TStatus)
            e.target.value = "" // Reset after selection
          }
        }}
        disabled={statusLoading}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D]"
        style={{fontFamily: 'var(--font-body)'}}
        defaultValue=""
      >
        <option value="" disabled>Change Status...</option>
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Bulk delete */}
      <Button
        variant="outline"
        size="sm"
        onClick={onBulkDelete}
        disabled={deleteLoading}
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Delete
      </Button>
    </div>
  )
}
