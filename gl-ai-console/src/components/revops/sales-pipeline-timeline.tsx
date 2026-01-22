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
  XCircle,
  HelpCircle
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
  SALES_PIPELINE_STAGES,
  // Simplified stage data types for pizza tracker
  SimplifiedQuoteSentStageData,
  SimplifiedPrepareEAStageData,
  SimplifiedEAReadyForReviewStageData,
  SimplifiedEASentStageData,
  SimplifiedClosedWonStageData,
  SimplifiedClosedLostStageData
} from "@/lib/sales-pipeline-timeline-types"
import {
  // Simplified stage Supabase functions
  getSimplifiedStageData,
  getAllSimplifiedStagesData,
  confirmSimplifiedStage,
  confirmClosedLost,
  confirmClosedWon,
  resetSimplifiedStage,
  type SimplifiedStageSupabaseData
} from "@/lib/supabase/revops-stage-data"
import { supabase } from "@/lib/supabase/client"
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
  loadReminderSequenceData,
  loadInternalReviewData,
  initializeInternalReview,
  updateInternalReviewEmail,
  markInternalReviewSent,
  autoFillGLReview,
  triggerAIGLReview,
  loadGLReviewFromSupabase,
  updateGLReviewForm,
  confirmGLReview,
  resetGLReview,
  submitTeamGLReview,
  pollForTeamGLReview,
  getGLReviewFormUrl,
  updateComparisonSelections,
  updateFinalReviewData,
  updateCustomValues,
  submitComparisonAndMoveToQuote,
  resetGLReviewComparison,
  // New stage store functions
  initializeCreateQuote,
  loadCreateQuoteFromSupabase,
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
import { updatePipelineDeal } from "@/lib/revops-pipeline-store"
import { SalesIntakeForm } from "@/components/revops/sales-intake-form"
import { FollowUpEmail } from "@/components/revops/follow-up-email"
import { ReminderSequence } from "@/components/revops/reminder-sequence"
import { InternalReview } from "@/components/revops/internal-review"
import { GLReviewForm } from "@/components/revops/gl-review-form"
import { GLReviewComparison } from "@/components/revops/gl-review-comparison"
import { CreateQuote } from "@/components/revops/create-quote"
// Simplified "Pizza Tracker" components (post-Create Quote stages)
import { QuoteSent } from "@/components/revops/quote-sent"
import { PrepareEngagement } from "@/components/revops/prepare-engagement"
import { EAReadyForReview } from "@/components/revops/ea-ready-for-review"
import { EASent } from "@/components/revops/ea-sent"
import { DealOutcome } from "@/components/revops/deal-outcome"
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
  isSkipped?: boolean // Added for stages that were auto-completed
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
    "x-circle": XCircle,
    "help-circle": HelpCircle
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
  // Reminder sequence loading state
  const [isProcessingAccess, setIsProcessingAccess] = useState(false)

  // Simplified stage data (pizza tracker stages)
  const [simplifiedStagesData, setSimplifiedStagesData] = useState<Record<string, SimplifiedStageSupabaseData>>({})
  const [isSimplifiedStageLoading, setIsSimplifiedStageLoading] = useState(false)

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
      // Note: closed-won and closed-lost are rendered as synthetic "deal-outcome" stage
      for (const stageConfig of SALES_PIPELINE_STAGES) {
        // Skip closed-lost as it's part of deal-outcome
        if (stageConfig.id === "closed-lost") continue

        const stageData = state.stages[stageConfig.id as SalesPipelineStageId]
        if (!firstPendingStageId && stageData?.status !== "completed") {
          // Map closed-won to deal-outcome
          firstPendingStageId = stageConfig.id === "closed-won" ? "deal-outcome" : stageConfig.id
        }
      }

      // Collapse all stages except the first pending one
      for (const stageConfig of SALES_PIPELINE_STAGES) {
        // Map closed-won and closed-lost to deal-outcome (synthetic ID)
        if (stageConfig.id === "closed-won" || stageConfig.id === "closed-lost") {
          if (firstPendingStageId !== "deal-outcome") {
            collapsed.add("deal-outcome")
          }
        } else if (stageConfig.id !== firstPendingStageId) {
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

      // Load reminder sequence data from Supabase (source of truth)
      try {
        await loadReminderSequenceData(deal.id)
        // Reload state after loading reminder sequence data
        const updatedState = await getOrCreateTimelineState(deal.id)
        setTimelineState(updatedState)
      } catch (error) {
        console.error('Error loading reminder sequence from Supabase:', error)
      }

      // Load internal review data from Supabase (source of truth)
      try {
        await loadInternalReviewData(deal.id)
        // Reload state after loading internal review data
        const updatedState = await getOrCreateTimelineState(deal.id)
        setTimelineState(updatedState)
      } catch (error) {
        console.error('Error loading internal review from Supabase:', error)
      }

      // Load GL review data from Supabase (source of truth)
      // This handles cases where AI auto-fill completed while component wasn't mounted
      try {
        const glReviewState = await loadGLReviewFromSupabase(deal.id)
        if (glReviewState) {
          setTimelineState(glReviewState)
        }
      } catch (error) {
        console.error('Error loading GL review from Supabase:', error)
      }

      // Load create quote data from Supabase (source of truth)
      // This ensures quote data persists across page refreshes and localStorage clears
      try {
        const quoteState = await loadCreateQuoteFromSupabase(deal.id)
        if (quoteState) {
          setTimelineState(quoteState)
        }
      } catch (error) {
        console.error('Error loading create quote from Supabase:', error)
      }

      // Load simplified stages data from Supabase (pizza tracker stages)
      try {
        const simplifiedData = await getAllSimplifiedStagesData(deal.id)
        setSimplifiedStagesData(simplifiedData)
      } catch (error) {
        console.error('Error loading simplified stages from Supabase:', error)
      }

      setIsLoading(false)
    }
    loadState()
  }, [deal.id])

  // Supabase Realtime subscription for HubSpot auto-sync
  // Listens for changes to simplified stage data and refreshes UI
  useEffect(() => {
    // Subscribe to changes in revops_pipeline_stage_data table for this deal
    const channel = supabase
      .channel(`revops-stages-${deal.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'revops_pipeline_stage_data',
          filter: `deal_id=eq.${deal.id}`
        },
        async (payload) => {
          console.log('Realtime stage change detected:', payload)
          // Refresh simplified stages data when a change is detected
          try {
            const updatedData = await getAllSimplifiedStagesData(deal.id)
            setSimplifiedStagesData(updatedData)
          } catch (error) {
            console.error('Error refreshing simplified stages:', error)
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
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

    // Load reminder sequence data from Supabase to ensure it's up to date
    try {
      await loadReminderSequenceData(deal.id)
      // Re-fetch state after loading reminder sequence data
      state = await getOrCreateTimelineState(deal.id)
    } catch (error) {
      console.error('Error loading reminder sequence in refreshState:', error)
    }

    // Load internal review data from Supabase to ensure it's up to date
    try {
      await loadInternalReviewData(deal.id)
      // Re-fetch state after loading internal review data
      state = await getOrCreateTimelineState(deal.id)
    } catch (error) {
      console.error('Error loading internal review in refreshState:', error)
    }

    // Load GL review data from Supabase to ensure it's up to date
    try {
      const glReviewState = await loadGLReviewFromSupabase(deal.id)
      if (glReviewState) {
        state = glReviewState
      }
    } catch (error) {
      console.error('Error loading GL review in refreshState:', error)
    }

    // Load create quote data from Supabase to ensure it's up to date
    try {
      const quoteState = await loadCreateQuoteFromSupabase(deal.id)
      if (quoteState) {
        state = quoteState
      }
    } catch (error) {
      console.error('Error loading create quote in refreshState:', error)
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
      // Handle deal-outcome as a synthetic ID that maps to closed-won/closed-lost
      const isDealOutcome = id === "deal-outcome"
      const isCurrentlyCollapsed = isDealOutcome
        ? (prev.has("deal-outcome") || prev.has("closed-won"))
        : prev.has(id)

      // If expanding this stage, collapse all others
      if (isCurrentlyCollapsed) {
        const newSet = new Set<string>()
        for (const stageConfig of SALES_PIPELINE_STAGES) {
          // Map closed-won and closed-lost to deal-outcome (synthetic ID)
          if (stageConfig.id === "closed-won" || stageConfig.id === "closed-lost") {
            if (id !== "deal-outcome") {
              newSet.add("deal-outcome")
            }
          } else if (stageConfig.id !== id) {
            newSet.add(stageConfig.id)
          }
        }
        return newSet
      } else {
        // If collapsing, add it to collapsed set
        const newSet = new Set(prev)
        if (isDealOutcome) {
          newSet.add("deal-outcome")
        } else {
          newSet.add(id)
        }
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
    await enrollInSequence(deal.id)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUnenrollFromSequence = useCallback(async () => {
    await unenrollFromSequence(deal.id)
    await refreshState()
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
  const handleInitializeInternalReview = useCallback(async (recipients: { name: string; email: string }[], ccTimEnabled: boolean, subject: string, body: string) => {
    console.log("handleInitializeInternalReview called")
    await initializeInternalReview(deal.id, recipients, ccTimEnabled, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleUpdateInternalReview = useCallback(async (recipients: { name: string; email: string }[], ccTimEnabled: boolean, subject: string, body: string) => {
    await updateInternalReviewEmail(deal.id, recipients, ccTimEnabled, subject, body)
    await refreshState()
  }, [deal.id, refreshState])

  const handleSendInternalReview = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    // Call n8n webhook to send the email
    const result = await markInternalReviewSent(deal.id)
    await refreshState()
    return result
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

  // Trigger AI GL Review via n8n webhook
  const handleTriggerAIGLReview = useCallback(async (qboClientName: string): Promise<{ success: boolean; error?: string }> => {
    setIsGLReviewAutoFillLoading(true)
    try {
      const result = await triggerAIGLReview(deal.id, qboClientName)
      if (result.success) {
        // Start polling for AI review result
        // The webhook will save to Supabase and we'll detect it
        const pollInterval = setInterval(async () => {
          await refreshState()
          // Check if AI review is now available
          const state = await getOrCreateTimelineState(deal.id)
          const glReviewData = state.stages["gl-review"]?.data
          if (glReviewData?.isAutoFilled) {
            clearInterval(pollInterval)
            setIsGLReviewAutoFillLoading(false)
          }
        }, 5000)
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval)
          setIsGLReviewAutoFillLoading(false)
        }, 120000)
      } else {
        setIsGLReviewAutoFillLoading(false)
      }
      return result
    } catch (error) {
      setIsGLReviewAutoFillLoading(false)
      return { success: false, error: error instanceof Error ? error.message : "Failed to trigger AI GL Review" }
    }
  }, [deal.id, refreshState])

  // GL Review Comparison Handlers - Bypass mode creates blank team review so user can select AI values
  const handleBypassTeamReview = useCallback(async () => {
    setIsComparisonLoading(true)
    // Short delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 500))
    // Pass bypassMode: true to create blank team review data
    await submitTeamGLReview(deal.id, undefined, true)
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

  // Poll for team GL review from Supabase
  const handlePollForTeamReview = useCallback(async (): Promise<boolean> => {
    const newState = await pollForTeamGLReview(deal.id)
    if (newState) {
      // Team review found, refresh to show it
      await refreshState()
      return true
    }
    return false
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
  const handleInitializeQuoteSentEmail = useCallback(async (recipientEmail: string) => {
    await initializeQuoteSentEmail(deal.id, recipientEmail)
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

  // Simplified stages use Supabase data for status (pizza tracker stages)
  const SIMPLIFIED_STAGE_IDS = [
    "quote-sent",
    "prepare-engagement",
    "internal-engagement-review",
    "send-engagement",
    "closed-won",
    "closed-lost"
  ]

  // Build timeline events from stage configuration
  // Filter out closed-lost since we'll show a combined deal-outcome stage
  const events: TimelineEvent[] = SALES_PIPELINE_STAGES
    .filter(stageConfig => stageConfig.id !== "closed-lost") // Exclude closed-lost, handled in deal-outcome
    .map(stageConfig => {
      const stageData = timelineState.stages[stageConfig.id as SalesPipelineStageId]

      // Special handling for deal-outcome (combined closed-won/closed-lost)
      if (stageConfig.id === "closed-won") {
        const wonData = simplifiedStagesData["closed-won"]
        const lostData = simplifiedStagesData["closed-lost"]

        const isWon = !!wonData?.confirmedAt
        const isLost = !!lostData?.confirmedAt

        return {
          id: "deal-outcome",
          type: "deal-outcome",
          title: isWon ? "Closed Won" : isLost ? "Closed Lost" : "Deal Outcome",
          description: isWon
            ? "Deal has been successfully closed."
            : isLost
            ? "Deal has been marked as lost."
            : "Record the final outcome of the deal.",
          status: (isWon || isLost ? "completed" : "pending") as SalesPipelineStageStatus,
          icon: isWon ? "trophy" : isLost ? "x-circle" : "help-circle",
          automationLevel: "fully-automated" as const,
          actions: {
            manual: { label: "Record Outcome" }
          },
          isCollapsed: collapsedItems.has("deal-outcome") || collapsedItems.has("closed-won")
        }
      }

      // For simplified stages, derive status from Supabase data (confirmedAt)
      let status = stageData?.status || "pending"
      let isSkipped = false
      if (SIMPLIFIED_STAGE_IDS.includes(stageConfig.id)) {
        const simplifiedData = simplifiedStagesData[stageConfig.id as keyof typeof simplifiedStagesData]
        if (simplifiedData?.confirmedAt) {
          status = "completed"
          isSkipped = (simplifiedData as SimplifiedStageSupabaseData).isSkipped || false
        }
      }

      return {
        id: stageConfig.id,
        type: stageConfig.id,
        title: stageConfig.title,
        description: stageConfig.description,
        status,
        icon: stageConfig.icon,
        automationLevel: "fully-automated" as const,
        actions: {
          manual: { label: "Upload Demo Transcript" }
        },
        isCollapsed: collapsedItems.has(stageConfig.id),
        isSkipped // Add skipped flag to event
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

        // Get completion date from appropriate source:
        // - For deal-outcome: check closed-won or closed-lost confirmedAt
        // - For simplified stages (quote-sent through send-engagement): use simplifiedStagesData confirmedAt
        // - For regular stages: use stageData completedAt
        let completedAt: string | null = null
        if (event.id === "deal-outcome") {
          completedAt = simplifiedStagesData["closed-won"]?.confirmedAt || simplifiedStagesData["closed-lost"]?.confirmedAt || null
        } else if (SIMPLIFIED_STAGE_IDS.includes(event.id)) {
          completedAt = simplifiedStagesData[event.id]?.confirmedAt || null
        } else {
          completedAt = stageData?.completedAt || null
        }

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
                  event.status === "skipped" || event.isSkipped ? "border-border bg-gray-50/50 opacity-75" :
                  "border-border"
                )}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className={cn(
                        "text-lg font-medium",
                        event.status === "skipped" || event.isSkipped ? "text-gray-500" : "text-foreground"
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
                      {/* Skipped indicator */}
                      {event.isSkipped && event.status === "completed" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 italic">
                          Skipped
                        </span>
                      )}
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        event.isSkipped ? "bg-gray-100 text-gray-400 border border-gray-200" : getStatusColor(event.status)
                      )}>
                        {getStatusIcon(event.status)} {event.isSkipped ? "Auto-Completed" : getStatusLabel(event.status)}
                      </span>
                      {/* Completion Date Icon with Tooltip */}
                      {event.status === "completed" && completedAt && (
                        <div className="group relative">
                          <Calendar className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-max max-w-xs">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              Completed: {new Date(completedAt).toLocaleString('en-US', {
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
                        event.status === "skipped" || event.isSkipped ? "text-gray-400 italic" : "text-muted-foreground"
                      )} style={{ fontFamily: "var(--font-body)" }}>
                        {event.isSkipped ? "Deal moved past this stage" : event.description}
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

                      {/* Action Zone - Quote Sent specific (simplified) */}
                      {event.id === "quote-sent" && renderQuoteSentActions()}

                      {/* NOTE: quote-approved stage REMOVED - merged into quote-sent flow */}
                      {/* Confirming quote-sent implies approval, Quote Declined goes to closed-lost */}

                      {/* Action Zone - Prepare Engagement specific (simplified) */}
                      {event.id === "prepare-engagement" && renderPrepareEngagementActions()}

                      {/* Action Zone - Internal Engagement Review specific */}
                      {event.id === "internal-engagement-review" && renderInternalEngagementReviewActions()}

                      {/* Action Zone - Send Engagement specific */}
                      {event.id === "send-engagement" && renderSendEngagementActions()}

                      {/* Action Zone - Deal Outcome (combined Closed Won / Closed Lost) */}
                      {event.id === "deal-outcome" && renderDealOutcomeActions()}
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

    // Get contact info from sales intake form data
    const salesIntakeFormData = timelineState?.stages["sales-intake"]?.data?.formData
    const contactName = salesIntakeFormData?.contactName || ""
    const contactEmail = salesIntakeFormData?.emailAddress || ""

    return (
      <ReminderSequence
        platform={platform}
        followUpEmailSentAt={followUpEmailSentAt}
        status={reminderData.status}
        enrolledAt={reminderData.enrolledAt || null}
        accessReceivedAt={reminderData.accessReceivedAt || null}
        contactName={contactName}
        contactEmail={contactEmail}
        hsDealUrl={deal.hsDealUrl}
        onEnroll={handleEnrollInSequence}
        onUnenroll={handleUnenrollFromSequence}
        onAccessReceived={handleMarkAccessReceived}
        isProcessing={isProcessingAccess}
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
    // Use accountingPlatform from sales intake form, with reminder-sequence as fallback
    const accessPlatform = salesIntakeData?.accountingPlatform || timelineState?.stages["reminder-sequence"]?.data?.platform || null

    return (
      <InternalReview
        reviewData={reviewData}
        salesIntakeData={salesIntakeData}
        accessPlatform={accessPlatform}
        dealId={deal.id}
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

    // Get company name and lead name from deal data
    const companyNameFromDeal = deal.companyName || ""
    const leadNameFromDeal = deal.firstName && deal.lastName
      ? `${deal.firstName} ${deal.lastName}`
      : deal.firstName || deal.lastName || ""

    return (
      <GLReviewForm
        formData={glReviewData.formData || null}
        isAutoFilled={glReviewData.isAutoFilled || false}
        isConfirmed={isConfirmed}
        onAutoFill={handleAutoFillGLReview}
        onTriggerAI={handleTriggerAIGLReview}
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
        dealId={deal.id}
        onBypassTeamReview={handleBypassTeamReview}
        onPollForTeamReview={handlePollForTeamReview}
        onUpdateSelections={handleUpdateComparisonSelections}
        onUpdateFinalData={handleUpdateFinalReviewData}
        onUpdateCustomValues={handleUpdateCustomValues}
        onSubmitAndMoveToQuote={handleSubmitComparisonAndMoveToQuote}
        onReset={handleResetGLReviewComparison}
        isLoading={isComparisonLoading}
        glReviewFormUrl={getGLReviewFormUrl(deal.id)}
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

  // ============================================
  // SIMPLIFIED STAGE RENDER FUNCTIONS (Pizza Tracker)
  // These stages use simple confirmation + HubSpot sync
  // ============================================

  // Quote Approved stage is REMOVED - merged into Quote Sent flow
  // This stub prevents runtime errors for any existing references
  function renderQuoteApprovedActions() {
    return null
  }

  function renderQuoteSentActions() {
    const hubspotQuoteLink = timelineState?.stages["create-quote"]?.data?.hubspotQuoteLink || null
    const stageData = simplifiedStagesData["quote-sent"] || {
      confirmedAt: null,
      confirmedBy: null,
      hubspotSyncedAt: null,
      isAutoSynced: false
    }

    const simplifiedStageData: SimplifiedQuoteSentStageData = {
      ...stageData,
      hubspotQuoteLink
    }

    return (
      <QuoteSent
        stageData={simplifiedStageData}
        hubspotQuoteLink={hubspotQuoteLink}
        onConfirm={handleConfirmQuoteSent}
        onQuoteDeclined={handleQuoteDeclined}
        onReset={() => handleResetStage("quote-sent")}
      />
    )
  }

  function renderPrepareEngagementActions() {
    const stageData = simplifiedStagesData["prepare-engagement"] || {
      confirmedAt: null,
      confirmedBy: null,
      hubspotSyncedAt: null,
      isAutoSynced: false
    }

    const simplifiedStageData: SimplifiedPrepareEAStageData = {
      ...stageData
    }

    return (
      <PrepareEngagement
        stageData={simplifiedStageData}
        onConfirm={handleConfirmPrepareEngagement}
        onReset={() => handleResetStage("prepare-engagement")}
      />
    )
  }

  function renderInternalEngagementReviewActions() {
    const stageData = simplifiedStagesData["internal-engagement-review"] || {
      confirmedAt: null,
      confirmedBy: null,
      hubspotSyncedAt: null,
      isAutoSynced: false
    }

    const simplifiedStageData: SimplifiedEAReadyForReviewStageData = {
      ...stageData
    }

    return (
      <EAReadyForReview
        stageData={simplifiedStageData}
        onConfirm={handleConfirmEAReadyForReview}
        onReset={() => handleResetStage("internal-engagement-review")}
      />
    )
  }

  function renderSendEngagementActions() {
    const stageData = simplifiedStagesData["send-engagement"] || {
      confirmedAt: null,
      confirmedBy: null,
      hubspotSyncedAt: null,
      isAutoSynced: false
    }

    const simplifiedStageData: SimplifiedEASentStageData = {
      ...stageData
    }

    return (
      <EASent
        stageData={simplifiedStageData}
        onConfirm={handleConfirmEASent}
        onReset={() => handleResetStage("send-engagement")}
      />
    )
  }

  function renderDealOutcomeActions() {
    const quoteLineItems = timelineState?.stages["create-quote"]?.data?.lineItems || []
    const totalMonthly = quoteLineItems.reduce((sum, item) => sum + (item.monthlyPrice || 0), 0)
    const companyName = timelineState?.stages["sales-intake"]?.data?.formData?.companyName || deal.company

    // Get closed won data
    const wonStageData = simplifiedStagesData["closed-won"] || {
      confirmedAt: null,
      confirmedBy: null,
      hubspotSyncedAt: null,
      isAutoSynced: false,
      isSkipped: false,
      skippedReason: null
    }

    const closedWonData: SimplifiedClosedWonStageData = {
      ...wonStageData,
      finalDealValue: totalMonthly
    }

    // Get closed lost data
    const lostStageData = simplifiedStagesData["closed-lost"] as SimplifiedClosedLostStageData | undefined

    const closedLostData: SimplifiedClosedLostStageData = {
      confirmedAt: lostStageData?.confirmedAt || null,
      confirmedBy: lostStageData?.confirmedBy || null,
      hubspotSyncedAt: lostStageData?.hubspotSyncedAt || null,
      isAutoSynced: lostStageData?.isAutoSynced || false,
      isSkipped: lostStageData?.isSkipped || false,
      skippedReason: lostStageData?.skippedReason || null,
      lostReason: lostStageData?.lostReason || null,
      lostReasonDetails: lostStageData?.lostReasonDetails || "",
      lostFromStage: lostStageData?.lostFromStage || null
    }

    return (
      <DealOutcome
        closedWonData={closedWonData}
        closedLostData={closedLostData}
        companyName={companyName}
        onConfirmWon={handleConfirmClosedWon}
        onConfirmLost={handleConfirmClosedLost}
        onResetWon={() => handleResetStage("closed-won")}
        onResetLost={() => handleResetStage("closed-lost")}
      />
    )
  }

  // ============================================
  // SIMPLIFIED STAGE HANDLERS
  // ============================================

  async function handleConfirmQuoteSent() {
    setIsSimplifiedStageLoading(true)
    try {
      await confirmSimplifiedStage(deal.id, "quote-sent")
      // Update automation stage to next pending stage
      await updatePipelineDeal(deal.id, { stage: "Prepare Engagement Walkthrough" })
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error("Error confirming quote sent:", error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }

  async function handleQuoteDeclined() {
    // Go directly to closed lost
    setIsSimplifiedStageLoading(true)
    try {
      await confirmClosedLost(deal.id, "declined", "Quote was declined by prospect", "quote-sent")
      // Update automation stage to Closed Lost
      await updatePipelineDeal(deal.id, { stage: "Closed Lost" })
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error("Error marking quote declined:", error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }

  async function handleConfirmPrepareEngagement() {
    setIsSimplifiedStageLoading(true)
    try {
      await confirmSimplifiedStage(deal.id, "prepare-engagement")
      // Update automation stage to next pending stage
      await updatePipelineDeal(deal.id, { stage: "EA Internal Review" })
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error("Error confirming prepare engagement:", error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }

  async function handleConfirmEAReadyForReview() {
    setIsSimplifiedStageLoading(true)
    try {
      await confirmSimplifiedStage(deal.id, "internal-engagement-review")
      // Update automation stage to next pending stage
      await updatePipelineDeal(deal.id, { stage: "Send Engagement" })
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error("Error confirming EA ready for review:", error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }

  async function handleConfirmEASent() {
    setIsSimplifiedStageLoading(true)
    try {
      await confirmSimplifiedStage(deal.id, "send-engagement")
      // Update automation stage to Deal Outcome (Closed Won pending)
      await updatePipelineDeal(deal.id, { stage: "Closed Won" })
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error("Error confirming EA sent:", error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }

  async function handleConfirmClosedWon() {
    setIsSimplifiedStageLoading(true)
    try {
      const quoteLineItems = timelineState?.stages["create-quote"]?.data?.lineItems || []
      const totalMonthly = quoteLineItems.reduce((sum, item) => sum + (item.monthlyPrice || 0), 0)
      await confirmClosedWon(deal.id, totalMonthly)
      // Update automation stage to Closed Won
      await updatePipelineDeal(deal.id, { stage: "Closed Won" })
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error("Error confirming closed won:", error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }

  async function handleConfirmClosedLost(reason: LostReason, details: string) {
    setIsSimplifiedStageLoading(true)
    try {
      const currentStage = timelineState?.currentStage || "quote-sent"
      await confirmClosedLost(deal.id, reason, details, currentStage)
      // Update automation stage to Closed Lost
      await updatePipelineDeal(deal.id, { stage: "Closed Lost" })
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error("Error confirming closed lost:", error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }

  // RESET HANDLERS
  // ============================================
  // Mapping of stage IDs to their display names for automation stage update
  const STAGE_DISPLAY_NAMES: Record<string, string> = {
    "quote-sent": "Quote Sent",
    "prepare-engagement": "Prepare Engagement Walkthrough",
    "internal-engagement-review": "EA Internal Review",
    "send-engagement": "Send Engagement",
    "closed-won": "Closed Won",
    "closed-lost": "Closed Lost",
  }

  async function handleResetStage(stageId: string) {
    setIsSimplifiedStageLoading(true)
    try {
      await resetSimplifiedStage(deal.id, stageId as "quote-sent" | "prepare-engagement" | "internal-engagement-review" | "send-engagement" | "closed-won" | "closed-lost")
      // Update automation stage to the reset stage (so it becomes the current pending stage)
      const displayName = STAGE_DISPLAY_NAMES[stageId]
      if (displayName) {
        await updatePipelineDeal(deal.id, { stage: displayName })
      }
      const updatedData = await getAllSimplifiedStagesData(deal.id)
      setSimplifiedStagesData(updatedData)
      await refreshState()
    } catch (error) {
      console.error(`Error resetting stage ${stageId}:`, error)
    } finally {
      setIsSimplifiedStageLoading(false)
    }
  }
}
