"use client"

import { useState } from "react"
import { OffboardingTimelineEvent } from "@/lib/offboarding-data"
import { updateCustomer, getCustomerById, updateCompletionDate } from "@/lib/offboarding-store"
import { getNextStage } from "@/lib/offboarding-data"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  RotateCw,
  AlertTriangle,
  XCircle,
  User,
  PowerOff,
  ShieldOff,
  Database,
  Mail,
  LucideIcon,
  Calendar,
  Zap
} from "lucide-react"

// Icon mapping function for timeline stage icons
const getStageIcon = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'power-off': PowerOff,
    'x-circle': XCircle,
    'shield-off': ShieldOff,
    'database': Database,
    'mail': Mail
  }
  return iconMap[iconName] || Circle
}

interface OffboardingTimelineProps {
  events: OffboardingTimelineEvent[]
  customerId: string
  hideHeader?: boolean
  customerStage?: string
  completionDates?: Record<string, string>
}

const getStatusColor = (status: OffboardingTimelineEvent["status"]) => {
  switch (status) {
    case "completed":
      return "bg-[#C8E4BB]/20 text-[#5A8A4A] border border-[#C8E4BB]/40"
    case "in_progress":
      return "bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30"
    case "action-required":
      return "bg-amber-50 text-amber-700 border border-amber-200"
    case "pending":
      return "bg-gray-50 text-gray-600 border border-gray-200"
    case "failed":
      return "bg-red-50 text-red-700 border border-red-200"
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200"
  }
}

const getStatusIcon = (status: OffboardingTimelineEvent["status"]) => {
  const iconClass = "w-4 h-4"

  switch (status) {
    case "completed":
      return <CheckCircle2 className={iconClass} />
    case "in_progress":
      return <Circle className={iconClass} />
    case "action-required":
      return <AlertTriangle className={iconClass} />
    case "pending":
      return <Circle className={iconClass} />
    case "failed":
      return <XCircle className={iconClass} />
    default:
      return <Circle className={iconClass} />
  }
}

const getConnectorStyles = (currentStatus: OffboardingTimelineEvent["status"], nextStatus?: OffboardingTimelineEvent["status"]) => {
  if (currentStatus === "completed") {
    return "bg-[#C8E4BB]"
  }
  if (currentStatus === "in_progress") {
    return "bg-[#407B9D]"
  }
  return "bg-gray-300"
}

export function OffboardingTimeline({
  events,
  customerId,
  hideHeader = false,
  customerStage,
  completionDates = {}
}: OffboardingTimelineProps) {
  // Initialize with all stages collapsed except the first in_progress one
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(() => {
    const collapsed = new Set<string>()
    events.forEach((event) => {
      // Collapse all stages except the first in_progress one
      if (event.status !== 'in_progress') {
        collapsed.add(event.id)
      }
    })
    return collapsed
  })
  const [completingStage, setCompletingStage] = useState<string | null>(null)

  const toggleCollapse = (stageId: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stageId)) {
        newSet.delete(stageId)
      } else {
        newSet.add(stageId)
      }
      return newSet
    })
  }

  const handleMarkComplete = async (event: OffboardingTimelineEvent) => {
    if (!customerId) return

    setCompletingStage(event.id)

    try {
      // Get current customer
      const customer = await getCustomerById(customerId)
      if (!customer) {
        throw new Error("Customer not found")
      }

      // Get next stage
      const nextStage = getNextStage(customer.stage)

      // Update customer stage
      if (nextStage) {
        await updateCustomer(customerId, {
          stage: nextStage,
          lastActivity: "Just now"
        })
      }

      // Update completion date for this stage
      const completionDate = new Date().toISOString()
      await updateCompletionDate(customerId, event.id, completionDate)

      // Reload page to get updated data from store
      window.location.reload()
    } catch (error) {
      console.error("Failed to mark stage complete:", error)
      alert("Failed to mark stage as complete. Please try again.")
    } finally {
      setCompletingStage(null)
    }
  }

  // Update events with collapse state
  const updatedEvents = events.map(event => ({
    ...event,
    isCollapsed: collapsedItems.has(event.id)
  }))

  return (
    <CardContent>
      <div className="space-y-8">
        {updatedEvents.map((event, index) => {
          const isLast = index === updatedEvents.length - 1
          const nextEvent = updatedEvents[index + 1]
          const completionDate = completionDates[event.id]
          const StageIcon = getStageIcon(event.icon)
          const isActive = event.status === "in_progress" || event.status === "action-required"

          return (
            <div
              key={event.id}
              className={cn(
                "relative transition-all duration-300",
                isActive && "ring-2 ring-blue-200 ring-opacity-50 rounded-lg"
              )}
            >
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-6 top-12 w-px transition-all duration-300",
                    "h-[calc(100%-3rem+2rem)]",
                    getConnectorStyles(event.status, nextEvent?.status)
                  )}
                />
              )}

              <div className="flex items-start space-x-4">
                {/* Status Circle */}
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background relative z-10 transition-all duration-300",
                  event.status === "completed" ? "border-[#C8E4BB] bg-[#C8E4BB]/20" :
                  event.status === "in_progress" ? "border-[#407B9D] bg-[#407B9D]/20" :
                  event.status === "action-required" ? "border-amber-500 bg-amber-50" :
                  event.status === "failed" ? "border-red-500 bg-red-50" :
                  "border-gray-300 bg-gray-50",
                  isActive && "animate-pulse"
                )}>
                  <StageIcon className="w-6 h-6" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "p-4 border-2 rounded-lg bg-background transition-all duration-300",
                    event.status === "completed" && event.isCollapsed ? "border-border bg-[#C8E4BB]/20" :
                    isActive ? "border-[#407B9D] bg-[#407B9D]/10" :
                    "border-border"
                  )}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-foreground">
                          {event.title}
                        </h3>
                        {/* Automation Level Badge */}
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          event.automationLevel === "fully-automated"
                            ? "bg-[#C8E4BB]/20 text-[#5A8A4A] border-[#C8E4BB]/40"
                            : "bg-[#407B9D]/10 text-[#407B9D] border-[#407B9D]/30"
                        )}>
                          {event.automationLevel === "fully-automated" ?
                            <><Zap className="w-4 h-4 inline mr-1" /> Automated</> :
                            <><User className="w-4 h-4 inline mr-1" /> Manual</>
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCollapse(event.id)}
                          className="h-6 w-6 p-0"
                        >
                          {event.isCollapsed ? "+" : "−"}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          getStatusColor(event.status)
                        )}>
                          {getStatusIcon(event.status)} {event.status.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                        </span>
                        {/* Completion Date Icon with Tooltip */}
                        {event.status === "completed" && completionDate && (
                          <div className="group relative">
                            <Calendar className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-max max-w-xs">
                              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                                Completed: {new Date(completionDate).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content - show when not collapsed */}
                    {!event.isCollapsed && (
                      <>
                        <p className="text-sm mb-3 text-muted-foreground">
                          {event.description}
                        </p>

                        {/* Owner Badge */}
                        {event.owner && (
                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span className="font-medium">Owner:</span> {event.owner}
                            </span>
                          </div>
                        )}

                        {/* Details List */}
                        {event.details && event.details.length > 0 && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Steps:
                            </h4>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              {event.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-[#407B9D] mt-0.5">•</span>
                                  <span className="flex-1">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Button - Only show for stages that are not completed */}
                        {event.actions?.manual && event.status !== "completed" && (
                          <div className="pt-2">
                            <Button
                              onClick={() => handleMarkComplete(event)}
                              disabled={event.status !== "in_progress" || completingStage === event.id}
                              className="w-full sm:w-auto bg-[#407B9D] hover:bg-[#356780] text-white transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                            >
                              {completingStage === event.id ? (
                                <>
                                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                                  Marking Complete...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  {event.actions.manual.label}
                                </>
                              )}
                            </Button>
                            {event.status === "pending" && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Complete previous stages first
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </CardContent>
  )
}
