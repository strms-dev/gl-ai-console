"use client"

import { DevelopmentProject, devStageColors, sprintLengthLabels } from "@/lib/dummy-data"
import { formatMinutes, formatDate } from "@/lib/services/time-tracking-service"
import { User, Clock, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectCardProps {
  project: DevelopmentProject
}

// ============================================================================
// PROJECT CARD COMPONENT
// ============================================================================

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="p-4 space-y-3">
      {/* Project Name */}
      <h4
        className="font-semibold text-[#463939] line-clamp-2"
        style={{fontFamily: 'var(--font-heading)'}}
      >
        {project.projectName}
      </h4>

      {/* Customer */}
      <p
        className="text-sm text-[#666666] line-clamp-1"
        style={{fontFamily: 'var(--font-body)'}}
      >
        {project.customer}
      </p>

      {/* Sprint Length Badge */}
      <div>
        <Badge className="bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none text-xs">
          {sprintLengthLabels[project.sprintLength]}
        </Badge>
      </div>

      {/* Metadata */}
      <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
        {/* Assignee */}
        <div className="flex items-center gap-2 text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
          <User className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{project.assignee}</span>
        </div>

        {/* Time Tracked */}
        <div className="flex items-center gap-2 text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
          <Clock className="w-3.5 h-3.5 text-[#407B9D]" />
          <span>{formatMinutes(project.timeTracked)} tracked</span>
        </div>

        {/* Dates (if set) */}
        {project.startDate && (
          <div className="flex items-center gap-2 text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            <Calendar className="w-3.5 h-3.5 text-[#407B9D]" />
            <span>{formatDate(project.startDate)}</span>
            {project.endDate && (
              <>
                <span>→</span>
                <span>{formatDate(project.endDate)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="pt-2">
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          devStageColors[project.status]
        )}>
          {project.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      </div>
    </div>
  )
}
