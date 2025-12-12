"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  Circle,
  Clock,
  RotateCw,
  AlertTriangle,
  Video,
  Mail,
  UserPlus,
  Calculator,
  Send,
  TrendingUp,
  CheckCircle,
  Upload,
  Zap,
  FileText,
  Edit3,
  Copy,
  Bell,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
  XCircle
} from "lucide-react"
import {
  SalesPipelineTimelineState,
  SalesPipelineStageId,
  SalesPipelineStageStatus,
  SalesIntakeData,
  AccountingSystem,
  SALES_PIPELINE_STAGES,
  FOLLOW_UP_EMAIL_TEMPLATES,
  INTERNAL_ASSIGNMENT_EMAIL,
  DEFAULT_INTERNAL_RECIPIENTS
} from "@/lib/sales-pipeline-timeline-types"
import {
  getOrCreateTimelineState,
  updateStageStatus,
  advanceToNextStage,
  uploadDemoTranscript,
  saveIntakeAnalysis,
  saveFollowUpEmail,
  markFollowUpEmailSent,
  enrollInReminderSequence,
  markAccessReceived,
  saveInternalAssignment,
  markReviewCompleted,
  saveQuoteData,
  markProposalDrafted,
  saveProposalData,
  markProposalViewed,
  addNegotiationNote,
  updateNegotiationTerms,
  closeDeal,
  shouldShowReminderPrompt
} from "@/lib/sales-pipeline-timeline-store"
import { PipelineDeal } from "@/lib/revops-pipeline-store"

// Icon mapping
const getStageIcon = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    "video": Video,
    "mail": Mail,
    "user-plus": UserPlus,
    "calculator": Calculator,
    "send": Send,
    "trending-up": TrendingUp,
    "check-circle": CheckCircle
  }
  return iconMap[iconName] || Circle
}

// Status styling
const getStatusStyles = (status: SalesPipelineStageStatus) => {
  switch (status) {
    case "completed":
      return {
        bg: "bg-[#C8E4BB]/20",
        border: "border-[#C8E4BB]",
        text: "text-[#5A8A4A]",
        icon: <CheckCircle2 className="w-5 h-5" />
      }
    case "in_progress":
      return {
        bg: "bg-[#407B9D]/10",
        border: "border-[#407B9D]",
        text: "text-[#407B9D]",
        icon: <Clock className="w-5 h-5" />
      }
    case "action-required":
      return {
        bg: "bg-amber-50",
        border: "border-amber-400",
        text: "text-amber-700",
        icon: <AlertTriangle className="w-5 h-5" />
      }
    case "skipped":
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-400",
        icon: <Circle className="w-5 h-5 opacity-50" />
      }
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-400",
        icon: <Circle className="w-5 h-5" />
      }
  }
}

const getConnectorColor = (status: SalesPipelineStageStatus) => {
  switch (status) {
    case "completed":
      return "bg-[#C8E4BB]"
    case "in_progress":
      return "bg-[#407B9D]"
    default:
      return "bg-gray-200"
  }
}

interface SalesPipelineTimelineProps {
  deal: PipelineDeal
  onDealUpdate?: (deal: PipelineDeal) => void
}

export function SalesPipelineTimeline({ deal, onDealUpdate }: SalesPipelineTimelineProps) {
  const [timelineState, setTimelineState] = useState<SalesPipelineTimelineState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  // Dialog states
  const [showTranscriptUpload, setShowTranscriptUpload] = useState(false)
  const [showIntakeForm, setShowIntakeForm] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [showProposalDialog, setShowProposalDialog] = useState(false)
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showAccessDialog, setShowAccessDialog] = useState(false)

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false)

  // Form states
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
  const [intakeData, setIntakeData] = useState<Partial<SalesIntakeData>>({})
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<"qbo" | "xero" | "reports">("qbo")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [assignmentRecipients, setAssignmentRecipients] = useState(
    DEFAULT_INTERNAL_RECIPIENTS.map(r => r.email)
  )
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [adjustedPrice, setAdjustedPrice] = useState(0)
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [negotiationNote, setNegotiationNote] = useState("")
  const [closeOutcome, setCloseOutcome] = useState<"won" | "lost">("won")
  const [closeReason, setCloseReason] = useState("")
  const [finalDealValue, setFinalDealValue] = useState(0)
  const [selectedAccessType, setSelectedAccessType] = useState<AccountingSystem>("qbo")

  // Load timeline state
  useEffect(() => {
    const loadState = async () => {
      setIsLoading(true)
      const state = await getOrCreateTimelineState(deal.id)
      setTimelineState(state)

      // Auto-expand current stage
      setExpandedStages(new Set([state.currentStage]))
      setIsLoading(false)
    }
    loadState()
  }, [deal.id])

  // Refresh timeline state
  const refreshState = useCallback(async () => {
    const state = await getOrCreateTimelineState(deal.id)
    setTimelineState(state)
  }, [deal.id])

  // Toggle stage expansion
  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stageId)) {
        newSet.delete(stageId)
      } else {
        newSet.add(stageId)
      }
      return newSet
    })
  }

  // ============================================
  // Stage 1: Demo Call Actions
  // ============================================

  const handleTranscriptUpload = async () => {
    if (!transcriptFile) return

    await uploadDemoTranscript(deal.id, transcriptFile.name)
    setShowTranscriptUpload(false)
    setTranscriptFile(null)
    await refreshState()
  }

  const handleRunIntakeAnalyzer = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis (in real implementation, this would call n8n webhook)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Pre-fill with demo data based on deal info
    setIntakeData({
      companyName: deal.companyName,
      contactName: `${deal.firstName || ""} ${deal.lastName || ""}`.trim() || "Contact Name",
      contactEmail: deal.email || "",
      contactPhone: "",
      businessType: "Professional Services",
      employeeCount: "10-50",
      annualRevenue: "$1M - $5M",
      accountingSystem: "qbo",
      servicesNeeded: ["Monthly Bookkeeping", "Financial Reporting"],
      painPoints: "Need better financial visibility and timely reporting",
      currentChallenges: "Manual processes taking too much time",
      timeline: "ASAP - within 30 days",
      budget: "$1,500 - $3,000/month",
      notes: ""
    })

    setIsAnalyzing(false)
    setShowIntakeForm(true)
  }

  const handleSaveIntake = async () => {
    const fullIntakeData: SalesIntakeData = {
      companyName: intakeData.companyName || deal.companyName,
      contactName: intakeData.contactName || "",
      contactEmail: intakeData.contactEmail || deal.email || "",
      contactPhone: intakeData.contactPhone || "",
      businessType: intakeData.businessType || "",
      employeeCount: intakeData.employeeCount || "",
      annualRevenue: intakeData.annualRevenue || "",
      accountingSystem: (intakeData.accountingSystem as AccountingSystem) || null,
      servicesNeeded: intakeData.servicesNeeded || [],
      painPoints: intakeData.painPoints || "",
      currentChallenges: intakeData.currentChallenges || "",
      timeline: intakeData.timeline || "",
      budget: intakeData.budget || "",
      notes: intakeData.notes || "",
      analyzedAt: new Date().toISOString()
    }

    await saveIntakeAnalysis(deal.id, fullIntakeData)
    await advanceToNextStage(deal.id)
    setShowIntakeForm(false)
    await refreshState()
  }

  // ============================================
  // Stage 2: Needs Info Actions
  // ============================================

  const handleSelectEmailTemplate = (template: "qbo" | "xero" | "reports") => {
    setSelectedEmailTemplate(template)
    const templateData = FOLLOW_UP_EMAIL_TEMPLATES[template]
    setEmailSubject(templateData.subject)

    // Replace placeholders
    let body = templateData.bodyTemplate
    const intakeInfo = timelineState?.stages["demo-call"].data.intakeData

    body = body.replace("{{contactName}}", intakeInfo?.contactName || deal.firstName || "there")
    body = body.replace("{{companyName}}", intakeInfo?.companyName || deal.companyName)
    body = body.replace("{{callRecap}}", intakeInfo?.painPoints
      ? `- ${intakeInfo.servicesNeeded?.join("\n- ") || "Services discussed"}\n- ${intakeInfo.painPoints}`
      : "- Key points from our discussion")

    setEmailBody(body)
    setShowEmailDialog(true)
  }

  const handleSendFollowUpEmail = async () => {
    setIsSendingEmail(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    await saveFollowUpEmail(deal.id, {
      templateType: selectedEmailTemplate,
      subject: emailSubject,
      body: emailBody,
      sentAt: new Date().toISOString(),
      reminderEnrolledAt: null
    })

    await markFollowUpEmailSent(deal.id)
    setIsSendingEmail(false)
    setShowEmailDialog(false)
    await refreshState()
  }

  const handleEnrollReminder = async () => {
    await enrollInReminderSequence(deal.id)
    await refreshState()
  }

  // ============================================
  // Stage 3: Access Received Actions
  // ============================================

  const handleMarkAccessReceived = async () => {
    await markAccessReceived(deal.id, selectedAccessType)
    setShowAccessDialog(false)
    await refreshState()
  }

  const handleSendInternalAssignment = async () => {
    setIsSendingEmail(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    await saveInternalAssignment(deal.id, {
      recipients: assignmentRecipients,
      sentAt: new Date().toISOString(),
      assignedReviewers: assignmentRecipients
    })

    await advanceToNextStage(deal.id)
    setIsSendingEmail(false)
    setShowAssignmentDialog(false)
    await refreshState()
  }

  // ============================================
  // Stage 4: Create Quote Actions
  // ============================================

  const handleGenerateQuote = async () => {
    setIsGeneratingQuote(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate pricing calculation
    const basePrice = 1500
    const serviceMultiplier = (timelineState?.stages["demo-call"].data.intakeData?.servicesNeeded?.length || 1) * 250
    const calculated = basePrice + serviceMultiplier + Math.floor(Math.random() * 500)

    setCalculatedPrice(calculated)
    setAdjustedPrice(calculated)
    setIsGeneratingQuote(false)
    setShowQuoteDialog(true)
  }

  const handleSaveQuote = async () => {
    await saveQuoteData(deal.id, {
      calculatedPrice,
      adjustedPrice,
      adjustmentReason: adjustmentReason || null,
      serviceBreakdown: [
        { service: "Monthly Bookkeeping", price: Math.floor(adjustedPrice * 0.6) },
        { service: "Financial Reporting", price: Math.floor(adjustedPrice * 0.3) },
        { service: "Advisory Support", price: Math.floor(adjustedPrice * 0.1) }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    await markProposalDrafted(deal.id)
    setShowQuoteDialog(false)
    await refreshState()
  }

  const handleSendProposal = async () => {
    const quoteData = timelineState?.stages["create-quote"].data.quoteData

    await saveProposalData(deal.id, {
      quoteId: deal.id + "-quote",
      emailSubject: `Growth Lab Proposal for ${deal.companyName}`,
      emailBody: `Please find attached our proposal for your review.`,
      attachmentGenerated: true,
      sentAt: new Date().toISOString()
    })

    await advanceToNextStage(deal.id)
    setShowProposalDialog(false)
    await refreshState()
  }

  // ============================================
  // Stage 5: Proposal Sent Actions
  // ============================================

  const handleMarkViewed = async () => {
    await markProposalViewed(deal.id)
    await refreshState()
  }

  const handleMoveToNegotiation = async () => {
    await advanceToNextStage(deal.id)
    await refreshState()
  }

  // ============================================
  // Stage 6: Negotiation Actions
  // ============================================

  const handleAddNote = async () => {
    if (!negotiationNote.trim()) return

    await addNegotiationNote(deal.id, negotiationNote)
    setNegotiationNote("")
    setShowNegotiationDialog(false)
    await refreshState()
  }

  const handleMoveToClose = async () => {
    await advanceToNextStage(deal.id)
    await refreshState()
  }

  // ============================================
  // Stage 7: Close Actions
  // ============================================

  const handleCloseDeal = async () => {
    await closeDeal(
      deal.id,
      closeOutcome,
      closeReason,
      closeOutcome === "won" ? finalDealValue : undefined
    )
    setShowCloseDialog(false)
    await refreshState()
  }

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

  const showReminderPrompt = shouldShowReminderPrompt(timelineState)

  return (
    <div className="space-y-0">
      {SALES_PIPELINE_STAGES.map((stageConfig, index) => {
        const stageId = stageConfig.id as SalesPipelineStageId
        const stageData = timelineState.stages[stageId]
        const isLast = index === SALES_PIPELINE_STAGES.length - 1
        const isExpanded = expandedStages.has(stageId)
        const isCurrent = timelineState.currentStage === stageId
        const statusStyles = getStatusStyles(stageData.status)
        const StageIcon = getStageIcon(stageConfig.icon)

        return (
          <div key={stageId} className="relative">
            {/* Connector Line */}
            {!isLast && (
              <div
                className={`absolute left-[23px] top-[48px] w-0.5 h-[calc(100%-24px)] ${getConnectorColor(stageData.status)}`}
              />
            )}

            {/* Stage Card */}
            <div className="flex gap-4">
              {/* Status Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shrink-0 ${statusStyles.bg} ${statusStyles.border}`}
              >
                <span className={statusStyles.text}>
                  {stageData.status === "in_progress" ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    statusStyles.icon
                  )}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isCurrent ? "border-[#407B9D] shadow-md" : "border-gray-200"
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer ${
                      isCurrent ? "bg-[#407B9D]/5" : "bg-white"
                    }`}
                    onClick={() => toggleStageExpansion(stageId)}
                  >
                    <div className="flex items-center gap-3">
                      <StageIcon className={`w-5 h-5 ${statusStyles.text}`} />
                      <div>
                        <h3
                          className={`font-semibold ${statusStyles.text}`}
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {stageConfig.title}
                        </h3>
                        {stageData.completedAt && (
                          <p className="text-xs text-muted-foreground">
                            Completed {new Date(stageData.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#407B9D] text-white">
                          Current
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 border-t bg-white">
                      <p
                        className="text-sm text-muted-foreground mb-4"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {stageConfig.description}
                      </p>

                      {/* Stage-specific action zones */}
                      {renderStageActions(stageId)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Dialogs */}
      {renderDialogs()}
    </div>
  )

  // Render stage-specific action buttons and content
  function renderStageActions(stageId: SalesPipelineStageId) {
    if (!timelineState) return null

    const stageData = timelineState.stages[stageId]
    const isCurrent = timelineState.currentStage === stageId
    const isPending = stageData.status === "pending"

    switch (stageId) {
      case "demo-call":
        return renderDemoCallActions()
      case "needs-info":
        return renderNeedsInfoActions()
      case "access-received":
        return renderAccessReceivedActions()
      case "create-quote":
        return renderCreateQuoteActions()
      case "proposal-sent":
        return renderProposalSentActions()
      case "negotiation":
        return renderNegotiationActions()
      case "closed":
        return renderClosedActions()
      default:
        return null
    }
  }

  function renderDemoCallActions() {
    const stageData = timelineState!.stages["demo-call"].data

    return (
      <div className="space-y-4">
        {/* Transcript Upload */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#407B9D]" />
              <span className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
                Call Transcript
              </span>
            </div>
            {stageData.transcriptUploaded ? (
              <span className="flex items-center gap-1 text-sm text-[#5A8A4A]">
                <CheckCircle2 className="w-4 h-4" />
                Uploaded
              </span>
            ) : null}
          </div>

          {stageData.transcriptUploaded ? (
            <p className="text-sm text-muted-foreground">
              {stageData.transcriptFileName} - uploaded {stageData.transcriptUploadedAt
                ? new Date(stageData.transcriptUploadedAt).toLocaleDateString()
                : ""}
            </p>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscriptUpload(true)}
              className="mt-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Fireflies Transcript
            </Button>
          )}
        </div>

        {/* Intake Analyzer */}
        {stageData.transcriptUploaded && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#407B9D]" />
                <span className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
                  Sales Intake Analysis
                </span>
              </div>
              {stageData.intakeAnalyzed ? (
                <span className="flex items-center gap-1 text-sm text-[#5A8A4A]">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              ) : null}
            </div>

            {stageData.intakeAnalyzed && stageData.intakeData ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Company:</span>{" "}
                    <span className="font-medium">{stageData.intakeData.companyName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">System:</span>{" "}
                    <span className="font-medium uppercase">{stageData.intakeData.accountingSystem || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Services:</span>{" "}
                    <span className="font-medium">{stageData.intakeData.servicesNeeded?.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeline:</span>{" "}
                    <span className="font-medium">{stageData.intakeData.timeline}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowIntakeForm(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Intake Data
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleRunIntakeAnalyzer}
                disabled={isAnalyzing}
                className="mt-2"
              >
                {isAnalyzing ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Sales Intake Analyzer
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  function renderNeedsInfoActions() {
    const stageData = timelineState!.stages["needs-info"].data
    const intakeData = timelineState!.stages["demo-call"].data.intakeData
    const accountingSystem = intakeData?.accountingSystem

    return (
      <div className="space-y-4">
        {/* Email Template Selection */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-[#407B9D]" />
            <span className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Follow-Up Email
            </span>
            {stageData.emailSent && (
              <span className="flex items-center gap-1 text-sm text-[#5A8A4A] ml-auto">
                <CheckCircle2 className="w-4 h-4" />
                Sent
              </span>
            )}
          </div>

          {stageData.emailSent ? (
            <p className="text-sm text-muted-foreground">
              Email sent on {stageData.emailTemplate?.sentAt
                ? new Date(stageData.emailTemplate.sentAt).toLocaleDateString()
                : ""}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Select a template based on the client&apos;s accounting system:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={accountingSystem === "qbo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectEmailTemplate("qbo")}
                >
                  QuickBooks Online
                </Button>
                <Button
                  variant={accountingSystem === "xero" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectEmailTemplate("xero")}
                >
                  Xero
                </Button>
                <Button
                  variant={accountingSystem === "other" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectEmailTemplate("reports")}
                >
                  Request Reports
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 3-Day Reminder */}
        {stageData.emailSent && !stageData.reminderEnrolled && (
          <div className={`p-4 rounded-lg ${showReminderPrompt ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Bell className={`w-4 h-4 ${showReminderPrompt ? "text-amber-600" : "text-[#407B9D]"}`} />
              <span className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
                Follow-Up Reminder
              </span>
            </div>

            {showReminderPrompt ? (
              <div>
                <p className="text-sm text-amber-700 mb-3">
                  It&apos;s been 3+ business days since the follow-up email was sent.
                  Consider enrolling in a reminder sequence.
                </p>
                <Button variant="default" size="sm" onClick={handleEnrollReminder}>
                  <Bell className="w-4 h-4 mr-2" />
                  Enroll in Reminder Sequence
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Auto-reminder will prompt after 3 business days if no access received.
              </p>
            )}
          </div>
        )}

        {stageData.reminderEnrolled && (
          <div className="p-4 bg-[#C8E4BB]/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />
              <span className="text-sm text-[#5A8A4A]">
                Enrolled in reminder sequence on {stageData.emailTemplate?.reminderEnrolledAt
                  ? new Date(stageData.emailTemplate.reminderEnrolledAt).toLocaleDateString()
                  : ""}
              </span>
            </div>
          </div>
        )}

        {/* Mark Access Received Button */}
        {stageData.emailSent && (
          <Button
            variant="default"
            onClick={() => setShowAccessDialog(true)}
            className="w-full"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Access Received
          </Button>
        )}
      </div>
    )
  }

  function renderAccessReceivedActions() {
    const stageData = timelineState!.stages["access-received"].data
    const intakeData = timelineState!.stages["demo-call"].data.intakeData

    return (
      <div className="space-y-4">
        {/* Access Info */}
        {stageData.accessReceivedAt && (
          <div className="p-4 bg-[#C8E4BB]/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />
              <span className="font-medium text-[#5A8A4A]">
                Access Received - {stageData.accessType?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Received on {new Date(stageData.accessReceivedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Internal Assignment */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#407B9D]" />
            <span className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Internal Team Assignment
            </span>
            {stageData.internalAssignment?.sentAt && (
              <span className="flex items-center gap-1 text-sm text-[#5A8A4A] ml-auto">
                <CheckCircle2 className="w-4 h-4" />
                Sent
              </span>
            )}
          </div>

          {stageData.internalAssignment?.sentAt ? (
            <div className="text-sm text-muted-foreground">
              <p>Sent to: {stageData.internalAssignment.recipients.join(", ")}</p>
              <p>
                Sent on {new Date(stageData.internalAssignment.sentAt).toLocaleDateString()}
              </p>
            </div>
          ) : stageData.accessReceivedAt ? (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Send GL review assignment to the internal team via Gmail.
              </p>
              <Button variant="default" size="sm" onClick={() => setShowAssignmentDialog(true)}>
                <Send className="w-4 h-4 mr-2" />
                Send Internal Assignment
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Waiting for access to be received before assigning internal team.
            </p>
          )}
        </div>
      </div>
    )
  }

  function renderCreateQuoteActions() {
    const stageData = timelineState!.stages["create-quote"].data
    const intakeData = timelineState!.stages["demo-call"].data.intakeData

    return (
      <div className="space-y-4">
        {/* Quote Generation */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-[#407B9D]" />
            <span className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Pricing Calculator
            </span>
            {stageData.quoteData && (
              <span className="flex items-center gap-1 text-sm text-[#5A8A4A] ml-auto">
                <CheckCircle2 className="w-4 h-4" />
                Generated
              </span>
            )}
          </div>

          {stageData.quoteData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="text-muted-foreground">Calculated Price:</span>
                <span className="font-medium">${stageData.quoteData.calculatedPrice.toLocaleString()}/mo</span>
              </div>
              {stageData.quoteData.adjustedPrice !== stageData.quoteData.calculatedPrice && (
                <>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-muted-foreground">Adjusted Price:</span>
                    <span className="font-bold text-[#407B9D]">
                      ${stageData.quoteData.adjustedPrice.toLocaleString()}/mo
                    </span>
                  </div>
                  {stageData.quoteData.adjustmentReason && (
                    <p className="text-sm text-muted-foreground">
                      Adjustment reason: {stageData.quoteData.adjustmentReason}
                    </p>
                  )}
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => {
                setCalculatedPrice(stageData.quoteData!.calculatedPrice)
                setAdjustedPrice(stageData.quoteData!.adjustedPrice)
                setAdjustmentReason(stageData.quoteData!.adjustmentReason || "")
                setShowQuoteDialog(true)
              }}>
                <Edit3 className="w-4 h-4 mr-2" />
                Adjust Quote
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Run the pricing calculator to generate a quote based on client requirements.
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={handleGenerateQuote}
                disabled={isGeneratingQuote}
              >
                {isGeneratingQuote ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Generate Quote
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Draft Proposal */}
        {stageData.quoteData && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#407B9D]" />
              <span className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
                Proposal Email
              </span>
              {stageData.proposalDrafted && (
                <span className="flex items-center gap-1 text-sm text-[#5A8A4A] ml-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready
                </span>
              )}
            </div>

            <Button variant="default" onClick={() => setShowProposalDialog(true)}>
              <Send className="w-4 h-4 mr-2" />
              {stageData.proposalDrafted ? "Send Proposal" : "Draft & Send Proposal"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  function renderProposalSentActions() {
    const stageData = timelineState!.stages["proposal-sent"].data

    return (
      <div className="space-y-4">
        {stageData.sentAt && (
          <div className="p-4 bg-[#C8E4BB]/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />
              <span className="font-medium text-[#5A8A4A]">
                Proposal Sent
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Sent on {new Date(stageData.sentAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {stageData.viewedAt ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />
              <span className="text-sm text-[#5A8A4A]">
                Client viewed on {new Date(stageData.viewedAt).toLocaleDateString()}
              </span>
            </div>
            <Button variant="default" size="sm" onClick={handleMoveToNegotiation}>
              Move to Negotiation
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkViewed}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Viewed
            </Button>
            <Button variant="default" size="sm" onClick={handleMoveToNegotiation}>
              Skip to Negotiation
            </Button>
          </div>
        )}
      </div>
    )
  }

  function renderNegotiationActions() {
    const stageData = timelineState!.stages["negotiation"].data

    return (
      <div className="space-y-4">
        {/* Existing Notes */}
        {stageData.data?.notes && stageData.data.notes.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-[#463939] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Negotiation Notes
            </h4>
            <div className="space-y-2">
              {stageData.data.notes.map((note, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {note}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNegotiationDialog(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Add Note
          </Button>
          <Button variant="default" size="sm" onClick={handleMoveToClose}>
            Move to Close
          </Button>
        </div>
      </div>
    )
  }

  function renderClosedActions() {
    const stageData = timelineState!.stages["closed"].data

    if (stageData.outcome) {
      return (
        <div className={`p-4 rounded-lg ${
          stageData.outcome === "won" ? "bg-[#C8E4BB]/20" : "bg-red-50"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {stageData.outcome === "won" ? (
              <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-bold ${
              stageData.outcome === "won" ? "text-[#5A8A4A]" : "text-red-600"
            }`}>
              Closed {stageData.outcome === "won" ? "Won" : "Lost"}
            </span>
          </div>
          {stageData.closedAt && (
            <p className="text-sm text-muted-foreground">
              Closed on {new Date(stageData.closedAt).toLocaleDateString()}
            </p>
          )}
          {stageData.outcome === "won" && stageData.finalDealValue && (
            <p className="text-sm font-medium mt-1">
              Deal Value: ${stageData.finalDealValue.toLocaleString()}/mo
            </p>
          )}
          {(stageData.wonReason || stageData.lostReason) && (
            <p className="text-sm text-muted-foreground mt-2">
              {stageData.wonReason || stageData.lostReason}
            </p>
          )}
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            setCloseOutcome("won")
            setShowCloseDialog(true)
          }}
          className="bg-[#5A8A4A] hover:bg-[#4A7A3A]"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark Won
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCloseOutcome("lost")
            setShowCloseDialog(true)
          }}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-2" />
          Mark Lost
        </Button>
      </div>
    )
  }

  function renderDialogs() {
    return (
      <>
        {/* Transcript Upload Dialog */}
        <Dialog open={showTranscriptUpload} onOpenChange={setShowTranscriptUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Call Transcript</DialogTitle>
              <DialogDescription>
                Upload the Fireflies transcript from the demo call.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTranscriptUpload(false)}>
                Cancel
              </Button>
              <Button onClick={handleTranscriptUpload} disabled={!transcriptFile}>
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Intake Form Dialog */}
        <Dialog open={showIntakeForm} onOpenChange={setShowIntakeForm}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sales Intake Data</DialogTitle>
              <DialogDescription>
                Review and edit the AI-extracted intake information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={intakeData.companyName || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, companyName: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={intakeData.contactName || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, contactName: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={intakeData.contactEmail || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={intakeData.contactPhone || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, contactPhone: e.target.value })}
                />
              </div>
              <div>
                <Label>Business Type</Label>
                <Input
                  value={intakeData.businessType || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, businessType: e.target.value })}
                />
              </div>
              <div>
                <Label>Employee Count</Label>
                <Input
                  value={intakeData.employeeCount || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, employeeCount: e.target.value })}
                />
              </div>
              <div>
                <Label>Annual Revenue</Label>
                <Input
                  value={intakeData.annualRevenue || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, annualRevenue: e.target.value })}
                />
              </div>
              <div>
                <Label>Accounting System</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={intakeData.accountingSystem || ""}
                  onChange={(e) => setIntakeData({
                    ...intakeData,
                    accountingSystem: e.target.value as AccountingSystem
                  })}
                >
                  <option value="">Select...</option>
                  <option value="qbo">QuickBooks Online</option>
                  <option value="xero">Xero</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Services Needed</Label>
                <Input
                  value={intakeData.servicesNeeded?.join(", ") || ""}
                  onChange={(e) => setIntakeData({
                    ...intakeData,
                    servicesNeeded: e.target.value.split(",").map(s => s.trim())
                  })}
                  placeholder="Monthly Bookkeeping, Financial Reporting, etc."
                />
              </div>
              <div className="col-span-2">
                <Label>Pain Points</Label>
                <Textarea
                  value={intakeData.painPoints || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, painPoints: e.target.value })}
                />
              </div>
              <div>
                <Label>Timeline</Label>
                <Input
                  value={intakeData.timeline || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, timeline: e.target.value })}
                />
              </div>
              <div>
                <Label>Budget</Label>
                <Input
                  value={intakeData.budget || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, budget: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={intakeData.notes || ""}
                  onChange={(e) => setIntakeData({ ...intakeData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntakeForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIntake}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save & Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Follow-Up Email</DialogTitle>
              <DialogDescription>
                Review and customize the follow-up email before sending.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleSendFollowUpEmail} disabled={isSendingEmail}>
                {isSendingEmail ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Mark as Sent
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Access Type Dialog */}
        <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Access Received</DialogTitle>
              <DialogDescription>
                Select the type of access the client has granted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant={selectedAccessType === "qbo" ? "default" : "outline"}
                  onClick={() => setSelectedAccessType("qbo")}
                  className="justify-start"
                >
                  QuickBooks Online Access
                </Button>
                <Button
                  variant={selectedAccessType === "xero" ? "default" : "outline"}
                  onClick={() => setSelectedAccessType("xero")}
                  className="justify-start"
                >
                  Xero Access
                </Button>
                <Button
                  variant={selectedAccessType === "other" ? "default" : "outline"}
                  onClick={() => setSelectedAccessType("other")}
                  className="justify-start"
                >
                  Reports Received
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAccessDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkAccessReceived}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Internal Assignment Dialog */}
        <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Internal Team Assignment</DialogTitle>
              <DialogDescription>
                Send GL review assignment email to the internal team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Recipients</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DEFAULT_INTERNAL_RECIPIENTS.map((recipient) => (
                    <label
                      key={recipient.email}
                      className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={assignmentRecipients.includes(recipient.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignmentRecipients([...assignmentRecipients, recipient.email])
                          } else {
                            setAssignmentRecipients(assignmentRecipients.filter(r => r !== recipient.email))
                          }
                        }}
                      />
                      <span>{recipient.name}</span>
                      <span className="text-xs text-muted-foreground">({recipient.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Email Preview:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {INTERNAL_ASSIGNMENT_EMAIL.bodyTemplate
                    .replace("{{companyName}}", deal.companyName)
                    .replace("{{contactName}}", `${deal.firstName || ""} ${deal.lastName || ""}`.trim())
                    .replace("{{accountingSystem}}", timelineState?.stages["access-received"].data.accessType?.toUpperCase() || "N/A")
                    .replace("{{servicesNeeded}}", timelineState?.stages["demo-call"].data.intakeData?.servicesNeeded?.join(", ") || "N/A")}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInternalAssignment} disabled={isSendingEmail || assignmentRecipients.length === 0}>
                {isSendingEmail ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send via Gmail
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quote Dialog */}
        <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pricing Quote</DialogTitle>
              <DialogDescription>
                Review and adjust the calculated pricing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">AI Calculated Price:</span>
                  <span className="font-bold text-lg">${calculatedPrice.toLocaleString()}/mo</span>
                </div>
              </div>
              <div>
                <Label>Adjusted Price ($/mo)</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={adjustedPrice}
                    onChange={(e) => setAdjustedPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              {adjustedPrice !== calculatedPrice && (
                <div>
                  <Label>Adjustment Reason</Label>
                  <Textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="e.g., Rounded to nearest $50, competitive pricing, etc."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuote}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Quote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Proposal Dialog */}
        <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Proposal</DialogTitle>
              <DialogDescription>
                Review and send the proposal to the client.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Quote Summary</h4>
                <div className="text-sm space-y-1">
                  <p>Company: {deal.companyName}</p>
                  <p>Contact: {deal.firstName} {deal.lastName}</p>
                  <p className="font-bold">
                    Monthly Price: ${timelineState?.stages["create-quote"].data.quoteData?.adjustedPrice.toLocaleString()}/mo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <FileText className="w-5 h-5 text-[#407B9D]" />
                <span className="flex-1">Proposal__{deal.companyName.replace(/\s+/g, "_")}.pdf</span>
                <span className="text-xs text-muted-foreground">Auto-generated</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProposalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendProposal}>
                <Send className="w-4 h-4 mr-2" />
                Send Proposal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Negotiation Dialog */}
        <Dialog open={showNegotiationDialog} onOpenChange={setShowNegotiationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Negotiation Note</DialogTitle>
              <DialogDescription>
                Record notes from negotiation discussions.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={negotiationNote}
                onChange={(e) => setNegotiationNote(e.target.value)}
                placeholder="Enter negotiation notes..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNegotiationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!negotiationNote.trim()}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Close Deal Dialog */}
        <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Close Deal - {closeOutcome === "won" ? "Won" : "Lost"}
              </DialogTitle>
              <DialogDescription>
                Finalize the deal outcome.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {closeOutcome === "won" && (
                <div>
                  <Label>Final Deal Value ($/mo)</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={finalDealValue || timelineState?.stages["create-quote"].data.quoteData?.adjustedPrice || 0}
                      onChange={(e) => setFinalDealValue(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>{closeOutcome === "won" ? "Win Notes" : "Lost Reason"}</Label>
                <Textarea
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder={closeOutcome === "won"
                    ? "Notes about the deal..."
                    : "Why was the deal lost?"
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCloseDeal}
                className={closeOutcome === "won" ? "bg-[#5A8A4A] hover:bg-[#4A7A3A]" : ""}
                variant={closeOutcome === "lost" ? "destructive" : "default"}
              >
                {closeOutcome === "won" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Close Won
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Close Lost
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
}
