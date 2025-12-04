"use client"

import { ArrowUpDown, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface ColumnConfig<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string // e.g., "w-1/4", "w-40"
  render: (item: T) => React.ReactNode
}

export interface ListViewProps<T> {
  items: T[]
  columns: ColumnConfig<T>[]
  onItemClick?: (item: T) => void
  onSort?: (key: string) => void
  sortField?: string
  sortOrder?: "asc" | "desc"
  emptyMessage?: string
  className?: string
  // Selection props
  selectionMode?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  getItemId?: (item: T) => string
  // Delete props
  onItemDelete?: (e: React.MouseEvent, item: T) => void
}

// ============================================================================
// LIST VIEW COMPONENT
// ============================================================================

export function ListView<T>({
  items,
  columns,
  onItemClick,
  onSort,
  sortField,
  sortOrder,
  emptyMessage = "No items to display",
  className,
  selectionMode,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  getItemId,
  onItemDelete
}: ListViewProps<T>) {
  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey)
    }
  }

  // Check if all items are selected
  const allSelected = selectionMode && getItemId && selectedIds && items.length > 0 &&
    items.every(item => selectedIds.has(getItemId(item)))

  // Check if some items are selected (for indeterminate state)
  const someSelected = selectionMode && getItemId && selectedIds && items.length > 0 &&
    items.some(item => selectedIds.has(getItemId(item))) && !allSelected

  // Calculate column count for empty state
  const totalColumns = columns.length + (selectionMode ? 1 : 0) + (onItemDelete ? 1 : 0)

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-[#E5E5E5]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAF9F9]">
              {/* Selection checkbox column */}
              {selectionMode && onSelectAll && (
                <th className="w-10 py-3 px-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected || false
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#407B9D] focus:ring-[#407B9D] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left py-3 px-4 font-semibold text-sm text-[#463939]",
                    column.width
                  )}
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-[#407B9D] transition-colors"
                    >
                      {column.label}
                      <ArrowUpDown
                        className={cn(
                          "w-4 h-4 transition-all",
                          sortField === column.key
                            ? "text-[#407B9D]"
                            : "text-[#999999]",
                          sortField === column.key && sortOrder === "desc" && "rotate-180"
                        )}
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {/* Actions column for delete */}
              {onItemDelete && (
                <th className="w-12 py-3 px-4"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="text-center py-12 text-[#999999]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const itemId = getItemId ? getItemId(item) : String(index)
                const isSelected = selectedIds?.has(itemId)

                return (
                  <tr
                    key={itemId}
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      "border-b border-[#E5E5E5] last:border-b-0 transition-colors duration-150 group",
                      "hover:bg-[#95CBD7]/10",
                      onItemClick && "cursor-pointer",
                      isSelected && "bg-[#407B9D]/5"
                    )}
                  >
                    {/* Selection checkbox */}
                    {selectionMode && onSelectionChange && (
                      <td className="w-10 py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            onSelectionChange(itemId, e.target.checked)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 text-[#407B9D] focus:ring-[#407B9D] cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "py-3 px-4 text-sm text-[#666666]",
                          column.width
                        )}
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        {column.render(item)}
                      </td>
                    ))}
                    {/* Delete button */}
                    {onItemDelete && (
                      <td className="w-12 py-3 px-4">
                        <button
                          onClick={(e) => onItemDelete(e, item)}
                          className="text-[#999999] hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
