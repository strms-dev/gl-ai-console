"use client"

import { MaintenanceTicket, maintStageColors } from "@/lib/dummy-data"
import { formatMinutes, formatDate } from "@/lib/services/time-tracking-service"
import { User, Clock, Calendar, AlertCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface TicketCardProps {
  ticket: MaintenanceTicket
  selected?: boolean
  selectionMode?: boolean
  onSelect?: (id: string, selected: boolean) => void
  onDelete?: (e: React.MouseEvent, ticket: MaintenanceTicket) => void
}

// ============================================================================
// TICKET CARD COMPONENT
// ============================================================================

export function TicketCard({
  ticket,
  selected,
  selectionMode,
  onSelect,
  onDelete
}: TicketCardProps) {
  return (
    <div className="p-4 space-y-3 group relative">
      {/* Selection checkbox (visible in selection mode) */}
      {selectionMode && onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect(ticket.id, e.target.checked)
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-gray-300 text-[#407B9D] focus:ring-[#407B9D] cursor-pointer"
          />
        </div>
      )}

      {/* Hover delete button */}
      {onDelete && (
        <button
          onClick={(e) => onDelete(e, ticket)}
          className="absolute top-2 right-2 z-10 text-[#999999] hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {/* Ticket Title */}
      <h4
        className="font-semibold text-[#463939] line-clamp-2"
        style={{fontFamily: 'var(--font-heading)'}}
      >
        {ticket.ticketTitle}
      </h4>

      {/* Customer */}
      <p
        className="text-sm text-[#666666] line-clamp-1"
        style={{fontFamily: 'var(--font-body)'}}
      >
        {ticket.customer}
      </p>

      {/* Ticket Type & Platform Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge className={cn(
          "text-xs border-none",
          ticket.ticketType === "Maintenance"
            ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90"
            : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90"
        )}>
          {ticket.ticketType}
        </Badge>
        {ticket.platform && (
          <Badge className="bg-[#407B9D] text-white hover:bg-[#407B9D]/90 border-none text-xs">
            {ticket.platform}
          </Badge>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
        {/* Number of Errors (if applicable) */}
        {ticket.numberOfErrors > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span>{ticket.numberOfErrors} error{ticket.numberOfErrors !== 1 ? 's' : ''} logged</span>
          </div>
        )}

        {/* Assignee */}
        <div className="flex items-center gap-2 text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
          <User className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{ticket.assignee}</span>
        </div>

        {/* Time Tracked */}
        <div className="flex items-center gap-2 text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
          <Clock className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{formatMinutes(ticket.timeTracked)} tracked</span>
        </div>

        {/* Dates (if set) */}
        {ticket.startDate && (
          <div className="flex items-center gap-2 text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            <Calendar className="w-3.5 h-3.5 text-[#407B9D]" />
            <span>{formatDate(ticket.startDate)}</span>
            {ticket.endDate && (
              <>
                <span>→</span>
                <span>{formatDate(ticket.endDate)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="pt-2">
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          maintStageColors[ticket.status]
        )}>
          {ticket.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      </div>
    </div>
  )
}
