"use client"

import { MaintenanceTicket, maintStageColors, sprintLengthLabels } from "@/lib/dummy-data"
import { formatMinutes, formatDate } from "@/lib/project-store"
import { User, Clock, Calendar, AlertCircle, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface TicketCardProps {
  ticket: MaintenanceTicket
}

// ============================================================================
// TICKET CARD COMPONENT
// ============================================================================

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="p-4 space-y-3">
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

      {/* Ticket Type & Sprint Length Badges */}
      <div className="flex gap-2">
        <Badge className={cn(
          "text-xs border-none",
          ticket.ticketType === "Maintenance"
            ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90"
            : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90"
        )}>
          {ticket.ticketType}
        </Badge>
        <Badge className="bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none text-xs">
          {sprintLengthLabels[ticket.sprintLength]}
        </Badge>
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
