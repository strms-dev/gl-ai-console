"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  RotateCw,
  AlertTriangle,
  Video,
  Zap,
  User,
  Calendar,
  ClipboardList,
  Mail,
  Repeat,
  Users
} from "lucide-react"
import {
  SalesPipelineTimelineState,
  SalesPipelineStageId,
  SalesPipelineStageStatus,
  SalesIntakeFormData,
  SALES_PIPELINE_STAGES
} from "@/lib/sales-pipeline-timeline-types"
import {
  getOrCreateTimelineState,
  uploadDemoTranscript,
  clearDemoTranscript,
  getFileFromStorage,
  autoFillSalesIntake,
  updateSalesIntakeForm,
  confirmSalesIntake,
  resetSalesIntake,
  initializeFollowUpEmail,
  updateFollowUpEmail,
  markFollowUpEmailSent,
  markHubspotDealMoved,
  resetFollowUpEmail,
  enrollInSequence,
  unenrollFromSequence,
  markContactResponded,
  markAccessReceived,
  initializeInternalReview,
  updateInternalReviewEmail,
  markInternalReviewSent
} from "@/lib/sales-pipeline-timeline-store"
import { SalesIntakeForm } from "@/components/revops/sales-intake-form"
import { FollowUpEmail } from "@/components/revops/follow-up-email"
import { ReminderSequence } from "@/components/revops/reminder-sequence"
import { InternalReview } from "@/components/revops/internal-review"
import { PipelineDeal } from "@/lib/revops-pipeline-store"
import { FileUpload } from "@/components/leads/file-upload"
import { getFileTypeById, UploadedFile } from "@/lib/file-types"

// Timeline Event interface (similar to STRMS)
interface TimelineEvent {
  id: string
  type: string
  title: string
  description: string
  status: SalesPipelineStageStatus
  icon: string
  automationLevel: "fully-automated" | "manual-intervention"
  owner?: string
  actions?: {
    automated?: { label: string }
    manual?: { label: string }
  }
  isCollapsed?: boolean
}

// Status color mapping
const getStatusColor = (status: SalesPipelineStageStatus) => {
  switch (status) {
    case "completed":
      return "bg-[#C8E4BB]/20 text-[#5A8A4A] border border-[#C8E4BB]/40"
    case "in_progress":
      return "bg-gray-50 text-gray-600 border border-gray-200"
    case "action-required":
      return "bg-amber-50 text-amber-700 border border-amber-200"
    case "pending":
      return "bg-gray-50 text-gray-600 border border-gray-200"
    case "skipped":
      return "bg-gray-50 text-gray-400 border border-gray-200"
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200"
  }
}

// Status label mapping - show "Pending" for in_progress
const getStatusLabel = (status: SalesPipelineStageStatus) => {
  switch (status) {
    case "in_progress":
      return "Pending"
    default:
      return status.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  }
}

// Status icon mapping
const getStatusIcon = (status: SalesPipelineStageStatus) => {
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
    case "skipped":
      return <Circle className={`${iconClass} opacity-50`} />
    default:
      return <Circle className={iconClass} />
  }
}

// Connector line styles
const getConnectorStyles = (currentStatus: SalesPipelineStageStatus, nextStatus?: SalesPipelineStageStatus) => {
  if (currentStatus === "completed") {
    return "bg-[#C8E4BB]"
  }
  if (currentStatus === "in_progress") {
    return "bg-[#407B9D]"
  }
  if (currentStatus === "skipped") {
    return "bg-gray-300 border-l-2 border-dashed border-gray-400"
  }
  return "bg-gray-300"
}

// Stage icon mapping
const getStageIcon = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    "video": Video,
    "repeat": Repeat,
    "clipboard-list": ClipboardList,
    "mail": Mail,
    "users": Users
  }
  return iconMap[iconName] || Circle
}

interface SalesPipelineTimelineProps {
  deal: PipelineDeal
  onDealUpdate?: (deal: PipelineDeal) => void
}

export function SalesPipelineTimeline({ deal, onDealUpdate }: SalesPipelineTimelineProps) {
  const [timelineState, setTimelineState] = useState<SalesPipelineTimelineState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set())
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | undefined>(undefined)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [isAutoFillLoading, setIsAutoFillLoading] = useState(false)

  // Load timeline state
  useEffect(() => {
    const loadState = async () => {
      setIsLoading(true)
      const state = await getOrCreateTimelineState(deal.id)
      setTimelineState(state)

      // Single-stage expansion: only expand the current stage, collapse all others
      const collapsed = new Set<string>()
      for (const stageConfig of SALES_PIPELINE_STAGES) {
        if (stageConfig.id !== state.currentStage) {
          collapsed.add(stageConfig.id)
        }
      }
      setCollapsedItems(collapsed)

      // If transcript was already uploaded, restore from localStorage
      if (state.stages["demo-call"].data.transcriptUploaded && state.stages["demo-call"].data.transcriptFileName) {
        const storedFile = getFileFromStorage(deal.id, 'revops-demo-call-transcript')
        if (storedFile) {
          // Create a File object from the stored blob for download functionality
          const file = new File([storedFile.blob], storedFile.fileName, { type: storedFile.blob.type })
          setUploadedFile({
            id: `${deal.id}-demo-transcript`,
            fileTypeId: 'revops-demo-call-transcript',
            fileName: storedFile.fileName,
            uploadDate: storedFile.uploadedAt,
            fileSize: storedFile.fileSize,
            uploadedBy: 'User',
            fileData: file
          })
        } else {
          // Fallback if file data not found in localStorage
          setUploadedFile({
            id: `${deal.id}-demo-transcript`,
            fileTypeId: 'revops-demo-call-transcript',
            fileName: state.stages["demo-call"].data.transcriptFileName,
            uploadDate: state.stages["demo-call"].data.transcriptUploadedAt || new Date().toISOString(),
            fileSize: 0,
            uploadedBy: 'User'
          })
        }
      }

      setIsLoading(false)
    }
    loadState()
  }, [deal.id])

  // Refresh timeline state
  const refreshState = useCallback(async () => {
    const state = await getOrCreateTimelineState(deal.id)
    setTimelineState(state)

    // Single-stage expansion: only expand the current stage, collapse all others
    const collapsed = new Set<string>()
    for (const stageConfig of SALES_PIPELINE_STAGES) {
      if (stageConfig.id !== state.currentStage) {
        collapsed.add(stageConfig.id)
      }
    }
    setCollapsedItems(collapsed)
  }, [deal.id])

  // Toggle collapse for a stage - only one stage can be expanded at a time
  const toggleCollapse = (id: string) => {
    setCollapsedItems(prev => {
      const isCurrentlyCollapsed = prev.has(id)
      // If expanding this stage, collapse all others
      if (isCurrentlyCollapsed) {
        const newSet = new Set<string>()
        for (const stageConfig of SALES_PIPELINE_STAGES) {
          if (stageConfig.id !== id) {
            newSet.add(stageConfig.id)
          }
        }
        return newSet
      } else {
        // If collapsing, add it to collapsed set
        const newSet = new Set(prev)
        newSet.add(id)
        return newSet
      }
    })
  }

  // Handle file upload from FileUpload component
  const handleFileUploaded = async (file: UploadedFile) => {
    setUploadedFile(file)
    // Pass the actual file data to save to localStorage
    // Cast to File since FileUpload always provides a File object
    await uploadDemoTranscript(deal.id, file.fileName, file.fileData as File | undefined)
    await refreshState()
  }

  // Handle file cleared
  const handleFileCleared = async () => {
    setUploadedFile(undefined)
    await clearDemoTranscript(deal.id)
    await refreshState()
  }

  // Handle auto-fill for Sales Intake
  const handleAutoFillIntake = async () => {
    setIsAutoFillLoading(true)
    // Simulate AI processing delay (will be replaced with real API call)
    await new Promise(resolve => setTimeout(resolve, 1500))
    await autoFillSalesIntake(deal.id)
    await refreshState()
    setIsAutoFillLoading(false)
  }

  // Handle form data changes
  const handleIntakeFormChange = async (formData: SalesIntakeFormData) => {
    await updateSalesIntakeForm(deal.id, formData)
    // Don't refresh state here to avoid losing focus while typing
  }

  // Handle intake form confirmation
  const handleConfirmIntake = async () => {
    await confirmSalesIntake(deal.id)
    await refreshState()
  }

  // Handle intake form reset
  const handleResetIntake = async () => {
    await resetSalesIntake(deal.id)
    await refreshState()
  }

  // Follow-Up Email Handlers - memoized to prevent infinite re-renders
  const handleInitializeEmail = useCallback(async (templateType: "qbo" | "xero" | "other", subject: string, body: string) => {
    console.log("handleInitializeEmail called with:", templateType)
    await initializeFollowUpEmail(deal.id, templateType, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateEmail = useCallback(async (subject: string, body: string) => {
    await updateFollowUpEmail(deal.id, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSendEmail = useCallback(async () => {
    // In production, this would integrate with HubSpot API to send the email
    // For now, we just mark it as sent
    await markFollowUpEmailSent(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleMoveHubspotDeal = useCallback(async () => {
    // In production, this would integrate with HubSpot API to move the deal
    // For now, we just mark it as moved
    await markHubspotDealMoved(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Reminder Sequence Handlers
  const handleEnrollInSequence = useCallback(async () => {
    await enrollInSequence(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUnenrollFromSequence = useCallback(async () => {
    await unenrollFromSequence(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleMarkContactResponded = useCallback(async () => {
    await markContactResponded(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleMarkAccessReceived = useCallback(async (platform: "qbo" | "xero" | "other") => {
    await markAccessReceived(deal.id, platform)
    await refreshState()
  }, [deal.id, refreshState])

  // Internal Review Handlers
  const handleInitializeInternalReview = useCallback(async (recipients: { name: string; email: string }[], subject: string, body: string) => {
    console.log("handleInitializeInternalReview called")
    await initializeInternalReview(deal.id, recipients, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateInternalReview = useCallback(async (recipients: { name: string; email: string }[], subject: string, body: string) => {
    await updateInternalReviewEmail(deal.id, recipients, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSendInternalReview = useCallback(async () => {
    // In production, this would integrate with HubSpot API to send the email
    // For now, we just mark it as sent
    await markInternalReviewSent(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  if (isLoading || !timelineState) {
    return (
      <div className="flex items-center justify-center py-8">
        <RotateCw className="w-6 h-6 animate-spin text-[#407B9D]" />
        <span className="ml-2 text-[#666666]" style={{ fontFamily: "var(--font-body)" }}>
          Loading timeline...
        </span>
      </div>
    )
  }

  // Build timeline events from stage configuration
  const events: TimelineEvent[] = SALES_PIPELINE_STAGES.map(stageConfig => {
    const stageData = timelineState.stages[stageConfig.id as SalesPipelineStageId]
    return {
      id: stageConfig.id,
      type: stageConfig.id,
      title: stageConfig.title,
      description: stageConfig.description,
      status: stageData?.status || "pending",
      icon: stageConfig.icon,
      automationLevel: "fully-automated" as const,
      actions: {
        manual: { label: "Upload Demo Transcript" }
      },
      isCollapsed: collapsedItems.has(stageConfig.id)
    }
  })

  // Calculate progress stats
  const totalStages = events.length
  const completedStages = events.filter(e => e.status === "completed").length
  const automatedStages = events.filter(e => e.automationLevel === "fully-automated").length
  const manualStages = events.filter(e => e.automationLevel === "manual-intervention").length
  const progressPercent = totalStages > 0 ? (completedStages / totalStages) * 100 : 0

  return (
    <div className="space-y-0">
      {/* Timeline Progress Header */}
      <div className={isHeaderCollapsed ? "mb-0" : "mb-6"}>
        {/* Title row with completion count and collapse button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Sales Pipeline Timeline
            </h3>
            <span className="text-sm font-normal text-muted-foreground">
              {completedStages} of {totalStages} completed
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
          >
            {isHeaderCollapsed ? "+" : "−"}
          </Button>
        </div>

        {/* Progress Bar and Badges - only show when expanded */}
        {!isHeaderCollapsed && (
          <>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 mt-3">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-[#407B9D]"
                style={{
                  width: `${progressPercent}%`
                }}
              />
            </div>

            {/* Stage Type Badges */}
            <div className="flex items-center justify-center gap-6">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#C8E4BB]/20 text-[#5A8A4A] border border-[#C8E4BB]/40">
                <Zap className="w-3.5 h-3.5 mr-1" />
                Automated
                <span className="ml-1.5 text-muted-foreground">{automatedStages} {automatedStages === 1 ? 'stage' : 'stages'}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
                <User className="w-3.5 h-3.5 mr-1" />
                Manual
                <span className="ml-1.5 text-muted-foreground">{manualStages} {manualStages === 1 ? 'stage' : 'stages'}</span>
              </span>
            </div>
          </>
        )}
      </div>
      {!isHeaderCollapsed && events.map((event, index) => {
        const isLast = index === events.length - 1
        const nextEvent = events[index + 1]
        const isActive = event.status === "in_progress" || event.status === "action-required"
        const stageData = timelineState.stages[event.id as SalesPipelineStageId]
        const StageIcon = getStageIcon(event.icon)

        return (
          <div key={event.id} className="relative transition-all duration-300">
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
                event.status === "skipped" ? "border-gray-300 bg-gray-50 opacity-50" :
                "border-gray-300 bg-gray-50"
              )}>
                <StageIcon className="w-6 h-6" />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 pb-8">
                <div className={cn(
                  "p-4 border-2 rounded-lg bg-background transition-all duration-300",
                  event.status === "completed" && event.isCollapsed ? "border-border bg-[#C8E4BB]/20" :
                  event.status === "skipped" ? "border-border bg-gray-50/50 opacity-60" :
                  "border-border"
                )}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className={cn(
                        "text-lg font-medium",
                        event.status === "skipped" ? "line-through text-gray-500" : "text-foreground"
                      )} style={{ fontFamily: "var(--font-heading)" }}>
                        {event.title}
                      </h3>
                      {/* Automation Level Badge */}
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                        event.automationLevel === "fully-automated"
                          ? "bg-[#C8E4BB]/20 text-[#5A8A4A] border-[#C8E4BB]/40"
                          : "bg-[#407B9D]/10 text-[#407B9D] border-[#407B9D]/30"
                      )}>
                        {event.automationLevel === "fully-automated" ? (
                          <><Zap className="w-4 h-4 inline mr-1" /> Automated</>
                        ) : (
                          <><User className="w-4 h-4 inline mr-1" /> Manual</>
                        )}
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
                        {getStatusIcon(event.status)} {getStatusLabel(event.status)}
                      </span>
                      {/* Completion Date Icon with Tooltip */}
                      {event.status === "completed" && stageData?.completedAt && (
                        <div className="group relative">
                          <Calendar className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-max max-w-xs">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              Completed: {new Date(stageData.completedAt).toLocaleString('en-US', {
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
                      <p className={cn(
                        "text-sm mb-3",
                        event.status === "skipped" ? "text-gray-500" : "text-muted-foreground"
                      )} style={{ fontFamily: "var(--font-body)" }}>
                        {event.description}
                      </p>

                      {/* Action Zone - Demo Call specific - use FileUpload component */}
                      {event.id === "demo-call" && renderDemoCallActions()}

                      {/* Action Zone - Sales Intake specific - use SalesIntakeForm component */}
                      {event.id === "sales-intake" && renderSalesIntakeActions()}

                      {/* Action Zone - Follow-Up Email specific - use FollowUpEmail component */}
                      {event.id === "follow-up-email" && renderFollowUpEmailActions()}

                      {/* Action Zone - Reminder Sequence specific - use ReminderSequence component */}
                      {event.id === "reminder-sequence" && renderReminderSequenceActions()}

                      {/* Action Zone - Internal Review specific - use InternalReview component */}
                      {event.id === "internal-review" && renderInternalReviewActions()}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  function renderDemoCallActions() {
    const demoTranscriptFileType = getFileTypeById('revops-demo-call-transcript')

    if (!demoTranscriptFileType) {
      return null
    }

    return (
      <div className="mt-4">
        <FileUpload
          fileType={demoTranscriptFileType}
          existingFile={uploadedFile}
          onFileUploaded={handleFileUploaded}
          onFileCleared={() => handleFileCleared()}
          variant="compact"
        />
      </div>
    )
  }

  function renderSalesIntakeActions() {
    const salesIntakeData = timelineState?.stages["sales-intake"].data
    const isConfirmed = !!salesIntakeData?.confirmedAt

    return (
      <SalesIntakeForm
        formData={salesIntakeData?.formData || null}
        isAutoFilled={salesIntakeData?.isAutoFilled || false}
        isConfirmed={isConfirmed}
        fieldConfidence={salesIntakeData?.fieldConfidence || null}
        onAutoFill={handleAutoFillIntake}
        onFormChange={handleIntakeFormChange}
        onConfirm={handleConfirmIntake}
        onReset={handleResetIntake}
        isLoading={isAutoFillLoading}
      />
    )
  }

  function renderFollowUpEmailActions() {
    // Safety check for existing deals that don't have follow-up-email stage
    const followUpStage = timelineState?.stages["follow-up-email"]
    if (!followUpStage) return null

    const followUpData = followUpStage.data
    const salesIntakeData = timelineState?.stages["sales-intake"]?.data

    if (!followUpData) return null

    return (
      <FollowUpEmail
        emailData={followUpData}
        salesIntakeData={salesIntakeData?.formData || null}
        onInitialize={handleInitializeEmail}
        onUpdate={handleUpdateEmail}
        onSend={handleSendEmail}
        onMoveHubspotDeal={handleMoveHubspotDeal}
      />
    )
  }

  function renderReminderSequenceActions() {
    // Safety check for existing deals that don't have reminder-sequence stage
    const reminderStage = timelineState?.stages["reminder-sequence"]
    if (!reminderStage) return null

    const reminderData = reminderStage.data
    if (!reminderData) return null

    return (
      <ReminderSequence
        sequenceData={reminderData}
        onEnroll={handleEnrollInSequence}
        onUnenroll={handleUnenrollFromSequence}
        onMarkResponded={handleMarkContactResponded}
        onMarkAccessReceived={handleMarkAccessReceived}
      />
    )
  }

  function renderInternalReviewActions() {
    // Safety check for existing deals that don't have internal-review stage
    const internalReviewStage = timelineState?.stages["internal-review"]
    if (!internalReviewStage) return null

    const reviewData = internalReviewStage.data
    if (!reviewData) return null

    const salesIntakeData = timelineState?.stages["sales-intake"]?.data?.formData || null
    const accessPlatform = timelineState?.stages["reminder-sequence"]?.data?.accessPlatform || null

    return (
      <InternalReview
        reviewData={reviewData}
        salesIntakeData={salesIntakeData}
        accessPlatform={accessPlatform}
        onInitialize={handleInitializeInternalReview}
        onUpdate={handleUpdateInternalReview}
        onSend={handleSendInternalReview}
      />
    )
  }
}
