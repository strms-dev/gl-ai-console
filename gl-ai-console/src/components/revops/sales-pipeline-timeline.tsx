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
  Calendar,
  ClipboardList,
  Mail,
  Repeat,
  Users,
  FileSpreadsheet,
  GitCompare,
  Calculator,
  Send,
  FileText,
  UserCheck,
  FileSignature,
  Trophy,
  XCircle
} from "lucide-react"
import {
  SalesPipelineTimelineState,
  SalesPipelineStageId,
  SalesPipelineStageStatus,
  SalesIntakeFormData,
  GLReviewFormData,
  GLReviewComparisonSelections,
  GLReviewCustomValues,
  QuoteLineItem,
  LostReason,
  SALES_PIPELINE_STAGES
} from "@/lib/sales-pipeline-timeline-types"
import {
  getOrCreateTimelineState,
  uploadDemoTranscript,
  clearDemoTranscript,
  getDemoTranscriptFile,
  syncDemoTranscriptState,
  triggerSalesIntakeAI,
  loadSalesIntakeFromSupabase,
  loadFollowUpEmailFromSupabase,
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
  markAccessReceived,
  initializeInternalReview,
  updateInternalReviewEmail,
  markInternalReviewSent,
  autoFillGLReview,
  updateGLReviewForm,
  confirmGLReview,
  resetGLReview,
  submitTeamGLReview,
  updateComparisonSelections,
  updateFinalReviewData,
  updateCustomValues,
  submitComparisonAndMoveToQuote,
  resetGLReviewComparison,
  // New stage store functions
  initializeCreateQuote,
  addQuoteLineItem,
  updateQuoteLineItem,
  removeQuoteLineItem,
  pushQuoteToHubspot,
  confirmQuoteAndMoveToSent,
  initializeQuoteSentEmail,
  updateQuoteSentEmail,
  markQuoteEmailSent,
  recordQuoteResponse,
  updateQuoteApprovalNotes,
  sendQuoteAcknowledgment,
  moveToPreparingEngagement,
  // Prepare Engagement Walkthrough functions
  startWalkthroughGeneration,
  completeWalkthroughGeneration,
  updateWalkthroughText,
  confirmWalkthroughAndMoveToReview,
  // EA Internal Review functions
  initializeEAInternalReview,
  updateEAInternalReviewEmail,
  markEAInternalReviewSent,
  markEAReadyToSend,
  // Send Engagement functions
  initializeEngagementCustomerEmail,
  updateEngagementCustomerEmail,
  sendViaHubspotAndCloseWon,
  updateClosingNotes,
  markClosedWonSyncedToHubspot,
  markDealAsLost,
  updateLostReasonDetails,
  markClosedLostSyncedToHubspot
} from "@/lib/sales-pipeline-timeline-store"
import { SalesIntakeForm } from "@/components/revops/sales-intake-form"
import { FollowUpEmail } from "@/components/revops/follow-up-email"
import { ReminderSequence } from "@/components/revops/reminder-sequence"
import { InternalReview } from "@/components/revops/internal-review"
import { GLReviewForm } from "@/components/revops/gl-review-form"
import { GLReviewComparison } from "@/components/revops/gl-review-comparison"
import { CreateQuote } from "@/components/revops/create-quote"
import { QuoteSent } from "@/components/revops/quote-sent"
import { QuoteApproved } from "@/components/revops/quote-approved"
import { PrepareEngagement } from "@/components/revops/prepare-engagement"
import { EAInternalReview } from "@/components/revops/ea-internal-review"
import { SendEngagement } from "@/components/revops/send-engagement"
import { ClosedWon } from "@/components/revops/closed-won"
import { ClosedLost } from "@/components/revops/closed-lost"
import { PipelineDeal, getPipelineDealById } from "@/lib/revops-pipeline-store"
import { FileUpload } from "@/components/leads/file-upload"
import { getFileTypeById, UploadedFile } from "@/lib/file-types"
import { getRevOpsFileDownloadUrl } from "@/lib/supabase/revops-files"

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
    "users": Users,
    "file-spreadsheet": FileSpreadsheet,
    "git-compare": GitCompare,
    "calculator": Calculator,
    "send": Send,
    "check-circle": CheckCircle2,
    "file-text": FileText,
    "user-check": UserCheck,
    "file-signature": FileSignature,
    "trophy": Trophy,
    "x-circle": XCircle
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
  const [isSalesIntakeAIPolling, setIsSalesIntakeAIPolling] = useState(false)
  const [isGLReviewAutoFillLoading, setIsGLReviewAutoFillLoading] = useState(false)
  const [isComparisonLoading, setIsComparisonLoading] = useState(false)
  // Reminder sequence loading states
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isUnenrolling, setIsUnenrolling] = useState(false)
  const [isProcessingAccess, setIsProcessingAccess] = useState(false)

  // Load timeline state
  useEffect(() => {
    const loadState = async () => {
      setIsLoading(true)
      const state = await getOrCreateTimelineState(deal.id)
      setTimelineState(state)

      // Single-stage expansion: find the first non-completed stage and expand it
      const collapsed = new Set<string>()
      let firstPendingStageId: string | null = null

      // Find the first stage that is not completed
      for (const stageConfig of SALES_PIPELINE_STAGES) {
        const stageData = state.stages[stageConfig.id as SalesPipelineStageId]
        if (!firstPendingStageId && stageData?.status !== "completed") {
          firstPendingStageId = stageConfig.id
        }
      }

      // Collapse all stages except the first pending one
      for (const stageConfig of SALES_PIPELINE_STAGES) {
        if (stageConfig.id !== firstPendingStageId) {
          collapsed.add(stageConfig.id)
        }
      }
      setCollapsedItems(collapsed)

      // Always check Supabase for the transcript file (source of truth)
      // This handles cases where localStorage was cleared but file exists in Supabase
      try {
        const supabaseFile = await getDemoTranscriptFile(deal.id)
        if (supabaseFile) {
          setUploadedFile({
            id: supabaseFile.id,
            fileTypeId: 'revops-demo-call-transcript',
            fileName: supabaseFile.file_name,
            uploadDate: supabaseFile.uploaded_at,
            fileSize: supabaseFile.file_size,
            uploadedBy: supabaseFile.uploaded_by,
            storagePath: supabaseFile.storage_path
          })

          // Sync localStorage state if it was out of sync
          if (!state.stages["demo-call"].data.transcriptUploaded) {
            // File exists in Supabase but localStorage doesn't know - sync it
            await syncDemoTranscriptState(deal.id, supabaseFile.file_name, supabaseFile.uploaded_at)
            // Reload state after sync
            const syncedState = await getOrCreateTimelineState(deal.id)
            setTimelineState(syncedState)
          }
        }
      } catch (error) {
        console.error('Error loading transcript from Supabase:', error)
      }

      // Also check Supabase for sales intake data (source of truth)
      // This handles cases where AI auto-fill completed while component wasn't mounted
      try {
        const salesIntakeState = await loadSalesIntakeFromSupabase(deal.id)
        if (salesIntakeState) {
          setTimelineState(salesIntakeState)
        }
      } catch (error) {
        console.error('Error loading sales intake from Supabase:', error)
      }

      // Load follow-up email data from Supabase (source of truth)
      try {
        const followUpState = await loadFollowUpEmailFromSupabase(deal.id)
        if (followUpState) {
          setTimelineState(followUpState)
        }
      } catch (error) {
        console.error('Error loading follow-up email from Supabase:', error)
      }

      setIsLoading(false)
    }
    loadState()
  }, [deal.id])

  // Refresh timeline state and deal data
  const refreshState = useCallback(async () => {
    let state = await getOrCreateTimelineState(deal.id)

    // Load follow-up email data from Supabase to ensure it's up to date
    try {
      const followUpState = await loadFollowUpEmailFromSupabase(deal.id)
      if (followUpState) {
        state = followUpState
      }
    } catch (error) {
      console.error('Error loading follow-up email in refreshState:', error)
    }

    setTimelineState(state)

    // Single-stage expansion: find the first non-completed stage and expand it
    const collapsed = new Set<string>()
    let firstPendingStageId: string | null = null

    // Find the first stage that is not completed
    for (const stageConfig of SALES_PIPELINE_STAGES) {
      const stageData = state.stages[stageConfig.id as SalesPipelineStageId]
      if (!firstPendingStageId && stageData?.status !== "completed") {
        firstPendingStageId = stageConfig.id
      }
    }

    // Collapse all stages except the first pending one
    for (const stageConfig of SALES_PIPELINE_STAGES) {
      if (stageConfig.id !== firstPendingStageId) {
        collapsed.add(stageConfig.id)
      }
    }
    setCollapsedItems(collapsed)

    // Also refresh the deal data (automation stage may have changed)
    if (onDealUpdate) {
      const updatedDeal = await getPipelineDealById(deal.id)
      if (updatedDeal) {
        onDealUpdate(updatedDeal)
      }
    }
  }, [deal.id, onDealUpdate])

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
    // Set optimistic update first
    setUploadedFile(file)
    // Upload to Supabase via store function
    await uploadDemoTranscript(deal.id, file.fileName, file.fileData as File | undefined)

    // Reload file from Supabase to get the storage path for downloads
    try {
      const supabaseFile = await getDemoTranscriptFile(deal.id)
      if (supabaseFile) {
        setUploadedFile({
          id: supabaseFile.id,
          fileTypeId: 'revops-demo-call-transcript',
          fileName: supabaseFile.file_name,
          uploadDate: supabaseFile.uploaded_at,
          fileSize: supabaseFile.file_size,
          uploadedBy: supabaseFile.uploaded_by,
          storagePath: supabaseFile.storage_path
        })
      }
    } catch (error) {
      console.error('Error reloading file after upload:', error)
    }

    await refreshState()
  }

  // Handle file cleared
  const handleFileCleared = async () => {
    setUploadedFile(undefined)
    await clearDemoTranscript(deal.id)
    await refreshState()
  }

  // Handle auto-fill for Sales Intake - triggers n8n webhook and polls for results
  const handleAutoFillIntake = async () => {
    setIsAutoFillLoading(true)
    setIsSalesIntakeAIPolling(true)

    // Trigger the n8n webhook to start AI processing
    const triggered = await triggerSalesIntakeAI(deal.id)

    if (!triggered) {
      // Webhook failed - stop loading and show error
      console.error('Failed to trigger AI webhook')
      setIsAutoFillLoading(false)
      setIsSalesIntakeAIPolling(false)
      // Could add a toast/alert here in the future
      return
    }

    console.log('AI webhook triggered successfully, polling for results...')
    // Webhook triggered successfully - polling will handle the rest
    // The useEffect below will poll Supabase for results
  }

  // Poll for sales intake AI results from Supabase
  useEffect(() => {
    if (!isSalesIntakeAIPolling) return

    console.log('Starting polling for sales intake AI results...')

    const checkForResults = async () => {
      try {
        const result = await loadSalesIntakeFromSupabase(deal.id)

        if (result && result.stages["sales-intake"].data.isAutoFilled) {
          console.log('Sales intake AI results found:', result.stages["sales-intake"].data.formData?.companyName)
          setIsSalesIntakeAIPolling(false)
          setIsAutoFillLoading(false)
          setTimelineState(result)
        }
      } catch (error) {
        console.error('Error checking for sales intake results:', error)
      }
    }

    // Check immediately
    checkForResults()

    // Then poll every 5 seconds
    const interval = setInterval(checkForResults, 5000)

    // Stop polling after 2 minutes (timeout)
    const timeout = setTimeout(() => {
      console.warn('Sales intake AI polling timed out')
      setIsSalesIntakeAIPolling(false)
      setIsAutoFillLoading(false)
    }, 120000)

    // Cleanup on unmount or when polling stops
    return () => {
      console.log('Stopping sales intake polling')
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isSalesIntakeAIPolling, deal.id])

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
  const handleInitializeEmail = useCallback(async (templateType: "qbo" | "xero" | "other", toEmail: string, ccEmail: string, subject: string, body: string) => {
    console.log("handleInitializeEmail called with:", templateType)
    await initializeFollowUpEmail(deal.id, templateType, toEmail, ccEmail, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateEmail = useCallback(async (toEmail: string, ccEmail: string, subject: string, body: string) => {
    await updateFollowUpEmail(deal.id, toEmail, ccEmail, subject, body)
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

  const handleResetFollowUpEmail = useCallback(async () => {
    await resetFollowUpEmail(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Reminder Sequence Handlers
  const handleEnrollInSequence = useCallback(async () => {
    setIsEnrolling(true)
    try {
      await enrollInSequence(deal.id)
      await refreshState()
    } catch (error) {
      console.error('Error enrolling in sequence:', error)
    } finally {
      setIsEnrolling(false)
    }
  }, [deal.id, refreshState])

  const handleUnenrollFromSequence = useCallback(async () => {
    setIsUnenrolling(true)
    try {
      await unenrollFromSequence(deal.id)
      await refreshState()
    } catch (error) {
      console.error('Error unenrolling from sequence:', error)
    } finally {
      setIsUnenrolling(false)
    }
  }, [deal.id, refreshState])

  const handleMarkAccessReceived = useCallback(async () => {
    setIsProcessingAccess(true)
    try {
      await markAccessReceived(deal.id)
      await refreshState()
    } catch (error) {
      console.error('Error marking access received:', error)
    } finally {
      setIsProcessingAccess(false)
    }
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

  // GL Review Handlers
  const handleAutoFillGLReview = useCallback(async () => {
    setIsGLReviewAutoFillLoading(true)
    // Simulate AI processing delay (will be replaced with real API call)
    await new Promise(resolve => setTimeout(resolve, 1500))
    await autoFillGLReview(deal.id)
    await refreshState()
    setIsGLReviewAutoFillLoading(false)
  }, [deal.id, refreshState])

  const handleGLReviewFormChange = useCallback(async (formData: GLReviewFormData) => {
    await updateGLReviewForm(deal.id, formData)
    // Don't refresh state here to avoid losing focus while typing
  }, [deal.id])

  const handleConfirmGLReview = useCallback(async () => {
    await confirmGLReview(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleResetGLReview = useCallback(async () => {
    await resetGLReview(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // GL Review Comparison Handlers
  const handleSimulateTeamSubmit = useCallback(async () => {
    setIsComparisonLoading(true)
    // Simulate delay for team submitting their review
    await new Promise(resolve => setTimeout(resolve, 1500))
    await submitTeamGLReview(deal.id, "Lori Chambless")
    await refreshState()
    setIsComparisonLoading(false)
  }, [deal.id, refreshState])

  const handleUpdateComparisonSelections = useCallback(async (selections: GLReviewComparisonSelections) => {
    await updateComparisonSelections(deal.id, selections)
    // Don't refresh state to avoid UI flicker while selecting
  }, [deal.id])

  const handleUpdateFinalReviewData = useCallback(async (finalData: GLReviewFormData) => {
    await updateFinalReviewData(deal.id, finalData)
    // Don't refresh state to avoid UI flicker
  }, [deal.id])

  const handleUpdateCustomValues = useCallback(async (customValues: GLReviewCustomValues) => {
    await updateCustomValues(deal.id, customValues)
    // Don't refresh state to avoid UI flicker while editing
  }, [deal.id])

  const handleSubmitComparisonAndMoveToQuote = useCallback(async () => {
    await submitComparisonAndMoveToQuote(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleResetGLReviewComparison = useCallback(async () => {
    await resetGLReviewComparison(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Create Quote Handlers
  const handleInitializeQuote = useCallback(async () => {
    await initializeCreateQuote(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleAddQuoteLineItem = useCallback(async (service: string, description: string, monthlyPrice: number) => {
    await addQuoteLineItem(deal.id, service, description, monthlyPrice)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateQuoteLineItem = useCallback(async (itemId: string, updates: Partial<Omit<QuoteLineItem, 'id'>>) => {
    await updateQuoteLineItem(deal.id, itemId, updates)
    await refreshState()
  }, [deal.id, refreshState])

  const handleRemoveQuoteLineItem = useCallback(async (itemId: string) => {
    await removeQuoteLineItem(deal.id, itemId)
    await refreshState()
  }, [deal.id, refreshState])

  const handlePushQuoteToHubspot = useCallback(async () => {
    await pushQuoteToHubspot(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleConfirmQuote = useCallback(async () => {
    await confirmQuoteAndMoveToSent(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Quote Sent Handlers
  const handleInitializeQuoteSentEmail = useCallback(async (subject: string, body: string) => {
    await initializeQuoteSentEmail(deal.id, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateQuoteSentEmail = useCallback(async (subject: string, body: string) => {
    await updateQuoteSentEmail(deal.id, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSendQuoteViaHubspot = useCallback(async () => {
    await markQuoteEmailSent(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleEnrollQuoteInSequence = useCallback(async () => {
    // For now, this just marks it as enrolled - in production would call HubSpot API
    // The followUpSequenceStarted is already set when email is sent
    await refreshState()
  }, [refreshState])

  const handleUnenrollQuoteFromSequence = useCallback(async () => {
    // For now, this just marks it as unenrolled - in production would call HubSpot API
    await refreshState()
  }, [refreshState])

  const handleRecordQuoteResponse = useCallback(async (responseType: "approved" | "declined") => {
    await recordQuoteResponse(deal.id, responseType)
    await refreshState()
  }, [deal.id, refreshState])

  // Quote Approved Handlers
  const handleUpdateQuoteApprovalNotes = useCallback(async (notes: string) => {
    await updateQuoteApprovalNotes(deal.id, notes)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSendQuoteAcknowledgment = useCallback(async () => {
    await sendQuoteAcknowledgment(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleMoveToEngagement = useCallback(async () => {
    await moveToPreparingEngagement(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Prepare Engagement Walkthrough Handlers
  const handleStartWalkthroughGeneration = useCallback(async () => {
    await startWalkthroughGeneration(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleCompleteWalkthroughGeneration = useCallback(async () => {
    await completeWalkthroughGeneration(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateWalkthroughText = useCallback(async (text: string) => {
    await updateWalkthroughText(deal.id, text)
    await refreshState()
  }, [deal.id, refreshState])

  const handleConfirmWalkthrough = useCallback(async () => {
    await confirmWalkthroughAndMoveToReview(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // EA Internal Review Handlers
  const handleInitializeEAInternalReview = useCallback(async (recipients: { name: string; email: string }[]) => {
    await initializeEAInternalReview(deal.id, recipients)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateEAInternalReviewEmail = useCallback(async (subject: string, body: string) => {
    await updateEAInternalReviewEmail(deal.id, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSendEAInternalReview = useCallback(async () => {
    await markEAInternalReviewSent(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleMarkEAReadyToSend = useCallback(async () => {
    await markEAReadyToSend(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Send Engagement Handlers - simplified
  const handleInitializeEngagementEmail = useCallback(async () => {
    await initializeEngagementCustomerEmail(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateEngagementEmail = useCallback(async (subject: string, body: string) => {
    await updateEngagementCustomerEmail(deal.id, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSendViaHubspotAndCloseWon = useCallback(async () => {
    await sendViaHubspotAndCloseWon(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Closed Won Handlers
  const handleUpdateClosingNotes = useCallback(async (notes: string) => {
    await updateClosingNotes(deal.id, notes)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSyncClosedWonToHubspot = useCallback(async () => {
    await markClosedWonSyncedToHubspot(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  // Closed Lost Handlers
  const handleMarkDealAsLost = useCallback(async (reason: LostReason, details: string) => {
    await markDealAsLost(deal.id, reason)
    await updateLostReasonDetails(deal.id, reason, details)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSyncClosedLostToHubspot = useCallback(async () => {
    await markClosedLostSyncedToHubspot(deal.id)
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
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-[#407B9D]"
                style={{
                  width: `${progressPercent}%`
                }}
              />
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

                      {/* Action Zone - GL Review specific - use GLReviewForm component */}
                      {event.id === "gl-review" && renderGLReviewActions()}

                      {/* Action Zone - GL Review Comparison specific - use GLReviewComparison component */}
                      {event.id === "gl-review-comparison" && renderGLReviewComparisonActions()}

                      {/* Action Zone - Create Quote specific */}
                      {event.id === "create-quote" && renderCreateQuoteActions()}

                      {/* Action Zone - Quote Sent specific */}
                      {event.id === "quote-sent" && renderQuoteSentActions()}

                      {/* Action Zone - Quote Approved specific */}
                      {event.id === "quote-approved" && renderQuoteApprovedActions()}

                      {/* Action Zone - Prepare Engagement specific */}
                      {event.id === "prepare-engagement" && renderPrepareEngagementActions()}

                      {/* Action Zone - Internal Engagement Review specific */}
                      {event.id === "internal-engagement-review" && renderInternalEngagementReviewActions()}

                      {/* Action Zone - Send Engagement specific */}
                      {event.id === "send-engagement" && renderSendEngagementActions()}

                      {/* Action Zone - Closed Won specific */}
                      {event.id === "closed-won" && renderClosedWonActions()}

                      {/* Action Zone - Closed Lost specific */}
                      {event.id === "closed-lost" && renderClosedLostActions()}
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
          getDownloadUrl={getRevOpsFileDownloadUrl}
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
        dealId={deal.id}
        hsDealUrl={deal.hsDealUrl}
        onInitialize={handleInitializeEmail}
        onUpdate={handleUpdateEmail}
        onSend={handleSendEmail}
        onMoveHubspotDeal={handleMoveHubspotDeal}
        onReset={handleResetFollowUpEmail}
      />
    )
  }

  function renderReminderSequenceActions() {
    // Safety check for existing deals that don't have reminder-sequence stage
    const reminderStage = timelineState?.stages["reminder-sequence"]
    if (!reminderStage) return null

    const reminderData = reminderStage.data
    if (!reminderData) return null

    // Get follow-up email sent date
    const followUpEmailSentAt = timelineState?.stages["follow-up-email"]?.data?.sentAt || null

    // Get platform from reminder data or sales intake
    const platform = reminderData.platform ||
      (timelineState?.stages["sales-intake"]?.data?.formData?.accountingPlatform as "qbo" | "xero" | "other" | null) ||
      null

    return (
      <ReminderSequence
        dealId={deal.id}
        platform={platform}
        followUpEmailSentAt={followUpEmailSentAt}
        status={reminderData.status}
        enrolledAt={reminderData.enrolledAt || null}
        accessReceivedAt={reminderData.accessReceivedAt || null}
        onEnroll={handleEnrollInSequence}
        onUnenroll={handleUnenrollFromSequence}
        onAccessReceived={handleMarkAccessReceived}
        isEnrolling={isEnrolling}
        isUnenrolling={isUnenrolling}
        isProcessingAccess={isProcessingAccess}
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
    // Use platform from reminder-sequence data (simplified type no longer has accessPlatform)
    const accessPlatform = timelineState?.stages["reminder-sequence"]?.data?.platform || null

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

  function renderGLReviewActions() {
    // Safety check for existing deals that don't have gl-review stage
    const glReviewStage = timelineState?.stages["gl-review"]
    if (!glReviewStage) return null

    const glReviewData = glReviewStage.data
    if (!glReviewData) return null

    const isConfirmed = !!glReviewData.confirmedAt

    return (
      <GLReviewForm
        formData={glReviewData.formData || null}
        isAutoFilled={glReviewData.isAutoFilled || false}
        isConfirmed={isConfirmed}
        fieldConfidence={glReviewData.fieldConfidence || null}
        onAutoFill={handleAutoFillGLReview}
        onFormChange={handleGLReviewFormChange}
        onConfirm={handleConfirmGLReview}
        onReset={handleResetGLReview}
        isLoading={isGLReviewAutoFillLoading}
      />
    )
  }

  function renderGLReviewComparisonActions() {
    // Safety check for existing deals that don't have gl-review-comparison stage
    const comparisonStage = timelineState?.stages["gl-review-comparison"]
    if (!comparisonStage) return null

    const comparisonData = comparisonStage.data
    if (!comparisonData) return null

    return (
      <GLReviewComparison
        comparisonData={comparisonData}
        onSimulateTeamSubmit={handleSimulateTeamSubmit}
        onUpdateSelections={handleUpdateComparisonSelections}
        onUpdateFinalData={handleUpdateFinalReviewData}
        onUpdateCustomValues={handleUpdateCustomValues}
        onSubmitAndMoveToQuote={handleSubmitComparisonAndMoveToQuote}
        onReset={handleResetGLReviewComparison}
        isLoading={isComparisonLoading}
      />
    )
  }

  function renderCreateQuoteActions() {
    const createQuoteStage = timelineState?.stages["create-quote"]
    if (!createQuoteStage) return null

    const quoteData = createQuoteStage.data
    if (!quoteData) return null

    const glReviewData = timelineState?.stages["gl-review-comparison"]?.data?.finalReviewData ||
                         timelineState?.stages["gl-review"]?.data?.formData || null
    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company

    return (
      <CreateQuote
        quoteData={quoteData}
        glReviewData={glReviewData}
        companyName={companyName}
        onInitializeQuote={handleInitializeQuote}
        onAddLineItem={handleAddQuoteLineItem}
        onUpdateLineItem={handleUpdateQuoteLineItem}
        onRemoveLineItem={handleRemoveQuoteLineItem}
        onPushToHubspot={handlePushQuoteToHubspot}
        onConfirmQuote={handleConfirmQuote}
      />
    )
  }

  function renderQuoteSentActions() {
    const quoteSentStage = timelineState?.stages["quote-sent"]
    if (!quoteSentStage) return null

    const emailData = quoteSentStage.data
    if (!emailData) return null

    const quoteLineItems = timelineState?.stages["create-quote"]?.data?.lineItems || []
    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company
    const contactEmail = timelineState?.stages["sales-intake"]?.data?.formData?.emailAddress || ""
    const totalMonthly = quoteLineItems.reduce((sum, item) => sum + (item.monthlyPrice || 0), 0)
    const hubspotQuoteLink = timelineState?.stages["create-quote"]?.data?.hubspotQuoteLink || null

    return (
      <QuoteSent
        emailData={emailData}
        quoteLineItems={quoteLineItems}
        companyName={companyName}
        contactEmail={contactEmail}
        totalMonthly={totalMonthly}
        hubspotQuoteLink={hubspotQuoteLink}
        onInitialize={handleInitializeQuoteSentEmail}
        onUpdate={handleUpdateQuoteSentEmail}
        onSendViaHubspot={handleSendQuoteViaHubspot}
        onEnrollInSequence={handleEnrollQuoteInSequence}
        onUnenrollFromSequence={handleUnenrollQuoteFromSequence}
        onRecordResponse={handleRecordQuoteResponse}
      />
    )
  }

  function renderQuoteApprovedActions() {
    const quoteApprovedStage = timelineState?.stages["quote-approved"]
    if (!quoteApprovedStage) return null

    const approvalData = quoteApprovedStage.data
    if (!approvalData) return null

    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company
    const quoteLineItems = timelineState?.stages["create-quote"]?.data?.lineItems || []
    const totalMonthly = quoteLineItems.reduce((sum, item) => sum + item.monthlyPrice, 0)

    return (
      <QuoteApproved
        approvalData={approvalData}
        companyName={companyName}
        totalMonthly={totalMonthly}
        onUpdateNotes={handleUpdateQuoteApprovalNotes}
        onSendAcknowledgment={handleSendQuoteAcknowledgment}
        onMoveToEngagement={handleMoveToEngagement}
      />
    )
  }

  function renderPrepareEngagementActions() {
    const prepareEngagementStage = timelineState?.stages["prepare-engagement"]
    if (!prepareEngagementStage) return null

    const engagementData = prepareEngagementStage.data
    if (!engagementData) return null

    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company

    return (
      <PrepareEngagement
        engagementData={engagementData}
        companyName={companyName}
        onStartGeneration={handleStartWalkthroughGeneration}
        onCompleteGeneration={handleCompleteWalkthroughGeneration}
        onUpdateWalkthrough={handleUpdateWalkthroughText}
        onConfirmWalkthrough={handleConfirmWalkthrough}
      />
    )
  }

  function renderInternalEngagementReviewActions() {
    const reviewStage = timelineState?.stages["internal-engagement-review"]
    if (!reviewStage) return null

    const reviewData = reviewStage.data
    if (!reviewData) return null

    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company
    const quoteLineItems = timelineState?.stages["create-quote"]?.data?.lineItems || []
    const totalMonthly = quoteLineItems.reduce((sum, item) => sum + item.monthlyPrice, 0)
    const walkthroughText = timelineState?.stages["prepare-engagement"]?.data?.walkthroughText || ""

    return (
      <EAInternalReview
        reviewData={reviewData}
        companyName={companyName}
        totalMonthly={totalMonthly}
        walkthroughText={walkthroughText}
        onInitialize={handleInitializeEAInternalReview}
        onUpdateEmail={handleUpdateEAInternalReviewEmail}
        onSendReview={handleSendEAInternalReview}
        onMarkReadyToSend={handleMarkEAReadyToSend}
      />
    )
  }

  function renderSendEngagementActions() {
    const sendEngagementStage = timelineState?.stages["send-engagement"]
    if (!sendEngagementStage) return null

    const engagementData = sendEngagementStage.data
    if (!engagementData) return null

    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company
    const contactName = timelineState?.stages["sales-intake"]?.data?.formData?.contactName || ""
    const contactEmail = timelineState?.stages["sales-intake"]?.data?.formData?.emailAddress || ""
    const quoteLineItems = timelineState?.stages["create-quote"]?.data?.lineItems || []
    const totalMonthly = quoteLineItems.reduce((sum, item) => sum + item.monthlyPrice, 0)

    return (
      <SendEngagement
        engagementData={engagementData}
        companyName={companyName}
        contactName={contactName}
        contactEmail={contactEmail}
        totalMonthly={totalMonthly}
        onInitializeEmail={handleInitializeEngagementEmail}
        onUpdateEmail={handleUpdateEngagementEmail}
        onSendViaHubspot={handleSendViaHubspotAndCloseWon}
      />
    )
  }

  function renderClosedWonActions() {
    const closedWonStage = timelineState?.stages["closed-won"]
    if (!closedWonStage) return null

    const wonData = closedWonStage.data
    if (!wonData) return null

    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company

    return (
      <ClosedWon
        wonData={wonData}
        companyName={companyName}
        onUpdateNotes={handleUpdateClosingNotes}
        onSyncToHubspot={handleSyncClosedWonToHubspot}
      />
    )
  }

  function renderClosedLostActions() {
    const closedLostStage = timelineState?.stages["closed-lost"]
    if (!closedLostStage) return null

    const lostData = closedLostStage.data
    if (!lostData) return null

    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company

    return (
      <ClosedLost
        lostData={lostData}
        companyName={companyName}
        onUpdateDetails={handleMarkDealAsLost}
        onSyncToHubspot={handleSyncClosedLostToHubspot}
      />
    )
  }
}
