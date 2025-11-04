"use client"

import { ArrowUpDown } from "lucide-react"
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
  className
}: ListViewProps<T>) {
  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey)
    }
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-[#E5E5E5]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAF9F9]">
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
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-[#999999]"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onItemClick?.(item)}
                  className={cn(
                    "border-b border-[#E5E5E5] last:border-b-0 transition-colors duration-150",
                    "hover:bg-[#95CBD7]/10",
                    onItemClick && "cursor-pointer"
                  )}
                >
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
