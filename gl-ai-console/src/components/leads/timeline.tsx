"use client"

import { useState, useEffect } from "react"
import { TimelineEvent, determineCurrentStage } from "@/lib/timeline-data"
import { updateLead, getLeadById } from "@/lib/leads-store"
import { Lead } from "@/lib/dummy-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getFileTypeById, UploadedFile } from "@/lib/file-types"
import { FileUpload } from "@/components/leads/file-upload"
import { SprintPricingForm } from "@/components/leads/sprint-pricing-form"
import { getStageData, setStageData, deleteAllStageData } from "@/lib/supabase/stage-data"
import { confirmSprintPricing, updateConfirmedPricing, getSprintPricing, deleteSprintPricing } from "@/lib/supabase/sprint-pricing"
import { updateProjectStatus } from "@/lib/supabase/project-status"
import { getFileByType } from "@/lib/supabase/files"
import {
  CheckCircle2,
  XCircle,
  Circle,
  AlertTriangle,
  Mail,
  ClipboardList,
  RotateCw,
  DollarSign,
  Rocket,
  User,
  FileText,
  Zap,
  BarChart3,
  Copy,
  Send,
  Target,
  Users,
  Calculator,
  TrendingUp,
  Paperclip,
  Lightbulb,
  Video,
  HelpCircle,
  Search,
  Headphones,
  BookOpen,
  Scale,
  FileSignature,
  Settings,
  Calendar,
  UserPlus,
  LucideIcon
} from "lucide-react"

// Icon mapping function for timeline stage icons
const getStageIcon = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'video': Video,
    'target': Target,
    'help-circle': HelpCircle,
    'file-text': FileText,
    'search': Search,
    'headphones': Headphones,
    'book-open': BookOpen,
    'dollar-sign': DollarSign,
    'mail': Mail,
    'scale': Scale,
    'clipboard-list': ClipboardList,
    'file-signature': FileSignature,
    'settings': Settings,
    'rocket': Rocket,
  }
  return iconMap[iconName] || Circle
}

// Import SPRINT_OPTIONS for display purposes
const SPRINT_OPTIONS = [
  { value: "0.5", label: "1/2 Sprint (2.5 Days)", price: 3000 },
  { value: "1", label: "1x Sprint (5 Days)", price: 5000 },
  { value: "1.5", label: "1.5x Sprint (7.5 Days)", price: 6500 },
  { value: "2", label: "2x Sprint (10 Days)", price: 8000 }
]

interface TimelineProps {
  events: TimelineEvent[]
  leadId: string
  hideHeader?: boolean
  uploadedFiles?: Record<string, UploadedFile>
  onFileUploaded?: (file: UploadedFile) => void
  onFileCleared?: (fileTypeId: string) => void
  leadStage?: string
  completionDates?: Record<string, string>
}

const getStatusColor = (status: TimelineEvent["status"]) => {
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
    case "skipped":
      return "bg-gray-50 text-gray-400 border border-gray-200"
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200"
  }
}

const getStatusIcon = (status: TimelineEvent["status"]) => {
  const iconClass = "w-4 h-4"

  switch (status) {
    case "completed":
      return <CheckCircle2 className={iconClass} />
    case "in_progress":
      return <RotateCw className={`${iconClass} animate-spin`} />
    case "action-required":
      return <AlertTriangle className={iconClass} />
    case "pending":
      return <Circle className={iconClass} />
    case "failed":
      return <XCircle className={iconClass} />
    case "skipped":
      return <Circle className={`${iconClass} opacity-50`} />
    default:
      return <Circle className={iconClass} />
  }
}

const getConnectorStyles = (currentStatus: TimelineEvent["status"], nextStatus?: TimelineEvent["status"]) => {
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

const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div className="w-full bg-muted rounded-full h-2 mb-4">
    <div
      className="bg-[#407B9D] h-2 rounded-full transition-all duration-300"
      style={{ width: `${percentage}%` }}
    />
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center space-x-2">
    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
    <span className="text-sm text-blue-600">Processing...</span>
  </div>
)

const ActionZone = ({
  event,
  onAction,
  onFileUploaded,
  onFileCleared,
  existingFile,
  showDeveloperSelection,
  showEmailDraft,
  selectedDeveloper,
  showNotAFitEmail,
  decisionMade,
  onSprintPricingConfirm,
  sprintPricingData,
  proposalDeclined,
  showProposalAdjustment,
  proposalWasAdjusted,
  onProposalAdjustmentConfirm,
  anchorSetupCreated,
  anchorSetupLoading,
  eaWordingGenerated,
  eaWordingGenerating,
  eaConfirmed,
  readinessGenerating,
  scopingPrepGenerating,
  workflowDocsGenerating,
  scopingDocGenerating,
  kickoffAgendaGenerating,
  clickupTaskCreated,
  airtableRecordCreated,
  airtableRecordLoading,
  hubspotDealMoved,
  setupEmailCopied,
  setupEmailSent,
  aiSprintEstimatesLoading,
  aiSprintEstimatesAvailable
}: {
  event: TimelineEvent,
  onAction: (action: string) => void,
  onFileUploaded?: (file: UploadedFile) => void,
  onFileCleared?: (fileTypeId: string) => void,
  existingFile?: UploadedFile,
  showDeveloperSelection?: boolean,
  showEmailDraft?: boolean,
  selectedDeveloper?: string | null,
  showNotAFitEmail?: boolean,
  decisionMade?: string | null,
  onSprintPricingConfirm?: (data: {
    sprintLength: string
    price: number
    explanation: string
    initialAiSprintLength?: string
    initialAiPrice?: number
    initialAiExplanation?: string
  }) => void,
  sprintPricingData?: { sprintLength: string; price: number; aiExplanation: string; adjustmentReasoning?: string } | null,
  proposalDeclined?: boolean,
  showProposalAdjustment?: boolean,
  proposalWasAdjusted?: boolean,
  onProposalAdjustmentConfirm?: (data: { sprintLength: string; price: number; explanation: string }) => void,
  anchorSetupCreated?: boolean,
  anchorSetupLoading?: boolean,
  eaWordingGenerated?: boolean,
  eaWordingGenerating?: boolean,
  eaConfirmed?: boolean,
  readinessGenerating?: boolean,
  scopingPrepGenerating?: boolean,
  workflowDocsGenerating?: boolean,
  scopingDocGenerating?: boolean,
  kickoffAgendaGenerating?: boolean,
  clickupTaskCreated?: boolean,
  airtableRecordCreated?: boolean,
  airtableRecordLoading?: boolean,
  hubspotDealMoved?: boolean,
  setupEmailCopied?: boolean,
  setupEmailSent?: boolean,
  aiSprintEstimatesLoading?: boolean,
  aiSprintEstimatesAvailable?: boolean
}) => {
  const [emailCopied, setEmailCopied] = useState(false)

  if (!event.actions) return null

  // Special handling for demo call file upload
  if (event.type === "demo" && event.actions.manual?.label.includes("Upload")) {
    const demoTranscriptFileType = getFileTypeById('demo-call-transcript')
    if (demoTranscriptFileType) {
      return (
        <div className="mt-4">
          <FileUpload
            fileType={demoTranscriptFileType}
            existingFile={existingFile}
            onFileUploaded={onFileUploaded}
            onFileCleared={() => onFileCleared?.('demo-call-transcript')}
            variant="compact"
            variant="compact"
          />
        </div>
      )
    }
  }

  // Special handling for scoping call file upload
  if (event.type === "scoping" && event.actions.manual?.label.includes("Upload")) {
    const scopingTranscriptFileType = getFileTypeById('scoping-call-transcript')
    if (scopingTranscriptFileType) {
      return (
        <div className="mt-4">
          <FileUpload
            fileType={scopingTranscriptFileType}
            existingFile={existingFile}
            onFileUploaded={onFileUploaded}
            onFileCleared={() => onFileCleared?.('scoping-call-transcript')}
            variant="compact"
            variant="compact"
          />
        </div>
      )
    }
  }

  // Special handling for developer overview file upload
  if (event.type === "dev-overview" && event.actions.manual?.label.includes("Upload")) {
    const devOverviewFileType = getFileTypeById('developer-audio-overview')
    if (devOverviewFileType) {
      return (
        <div className="mt-4">
          <FileUpload
            fileType={devOverviewFileType}
            existingFile={existingFile}
            onFileUploaded={onFileUploaded}
            onFileCleared={() => onFileCleared?.('developer-audio-overview')}
            variant="compact"
          />
        </div>
      )
    }
  }

  // Special handling for readiness assessment stage
  if (event.type === "readiness") {
    const readinessPdfFileType = getFileTypeById('readiness-pdf')
    if (readinessPdfFileType) {
      return (
        <div className="mt-4">
          {/* AI Generation Button */}
          {event.actions.automated && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction('automated')}
                disabled={!!existingFile || readinessGenerating}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                {readinessGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {event.actions.automated.label}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={readinessPdfFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('readiness-pdf')}
              variant="compact"
            />
          </div>
        </div>
      )
    }
  }

  // Special handling for scoping prep document stage
  if (event.type === "scoping-prep") {
    const scopingPrepFileType = getFileTypeById('scoping-prep-doc')
    if (scopingPrepFileType) {
      return (
        <div className="mt-4">
          {/* AI Generation Button */}
          {event.actions.automated && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction('automated')}
                disabled={!!existingFile || scopingPrepGenerating}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                {scopingPrepGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {event.actions.automated.label}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={scopingPrepFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('scoping-prep-doc')}
              variant="compact"
            />
          </div>
        </div>
      )
    }
  }

  // Special handling for N8N workflow description stage
  if (event.type === "workflow-docs") {
    const workflowDescriptionFileType = getFileTypeById('workflow-description')
    if (workflowDescriptionFileType) {
      return (
        <div className="mt-4">
          {/* AI Generation Button */}
          {event.actions.automated && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction('automated')}
                disabled={!!existingFile || workflowDocsGenerating}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                {workflowDocsGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {event.actions.automated.label}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={workflowDescriptionFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('workflow-description')}
              variant="compact"
            />

            {/* Developer Note */}
            <div className="mt-4 p-3 bg-[#95CBD7]/20 border border-[#95CBD7] rounded-lg">
              <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{fontFamily: 'var(--font-heading)', color: '#407B9D'}}>
                <Lightbulb className="w-4 h-4" /> Developer Note:
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                Use this n8n workflow description with Claude Code and the n8n MCP to get a starting point for this automation in n8n.
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  // Special handling for Sprint Length & Price Estimate stage
  if (event.type === "sprint-pricing") {
    // Show recap for completed stage when expanded
    if (event.status === "completed" && sprintPricingData) {
      const sprintOptions = {
        "0.5": "1/2 Sprint (2.5 Days)",
        "1": "1x Sprint (5 Days)",
        "1.5": "1.5x Sprint (7.5 Days)",
        "2": "2x Sprint (10 Days)"
      }

      return (
        <div className="mt-4 p-4 bg-[#C8E4BB]/20 border border-[#C8E4BB] rounded-xl">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Recap</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Sprint Length:</span>
                <span className="font-medium">{sprintOptions[sprintPricingData.sprintLength as keyof typeof sprintOptions] || `${sprintPricingData.sprintLength}x Sprint`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Price:</span>
                <span className="font-medium" style={{color: '#407B9D'}}>${sprintPricingData.price.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Explanation:</strong> {sprintPricingData.aiExplanation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => onAction('clear_sprint_pricing')}
              variant="outline"
              size="sm"
              className="bg-white border-[#95CBD7] text-[#407B9D] hover:bg-[#95CBD7]/10 transition-all duration-200 hover:scale-105 rounded-lg shadow-sm"
            >
              <RotateCw className="w-4 h-4 mr-2" />Revise Estimate
            </Button>
          </div>
        </div>
      )
    }

    // Show loading animation if AI estimates are being generated
    if (aiSprintEstimatesLoading) {
      return (
        <div className="mt-4 p-6 bg-gradient-to-r from-[#407B9D]/10 to-[#95CBD7]/10 border border-[#407B9D]/30 rounded-xl">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#95CBD7]/30 border-t-[#407B9D] rounded-full animate-spin"></div>
              <Calculator className="w-6 h-6 text-[#407B9D] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-800 mb-2" style={{fontFamily: 'var(--font-heading)'}}>
                Generating AI Sprint Estimates...
              </h3>
              <p className="text-sm text-gray-600">
                Our AI is analyzing your workflow documentation to estimate sprint length and pricing.
                <br />
                This usually takes 30-60 seconds.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Show the custom pricing form for pending/in-progress stage
    if (onSprintPricingConfirm) {
      return (
        <div className="mt-4">
          <SprintPricingForm
            onConfirm={onSprintPricingConfirm}
            initialData={sprintPricingData ? {
              sprintLength: sprintPricingData.sprintLength,
              price: sprintPricingData.price,
              explanation: sprintPricingData.aiExplanation
            } : undefined}
          />
        </div>
      )
    }
  }

  // Special handling for Generate & Send Proposal Email stage
  if (event.type === "proposal") {
    // Show recap for completed stage when expanded
    if (event.status === "completed") {
      const sprintOptions = {
        "0.5": "2.5 days",
        "1": "5 days",
        "1.5": "7.5 days",
        "2": "10 days"
      }

      const sprintDuration = sprintPricingData ?
        (sprintOptions[sprintPricingData.sprintLength as keyof typeof sprintOptions] || `${sprintPricingData.sprintLength} sprint days`) :
        "Not specified"

      return (
        <div className="mt-4 p-4 bg-[#C8E4BB]/20 border border-[#C8E4BB] rounded-xl">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Recap</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">Proposal email sent to client</span>
              </div>
              <div className="text-sm text-gray-600">
                {sprintPricingData ? (
                  <>
                    <p>• Sprint Duration: {sprintDuration}</p>
                    <p>• Total Investment: ${sprintPricingData.price.toLocaleString()}</p>
                    <p>• Email included project overview, timeline, and next steps</p>
                  </>
                ) : (
                  <p>• Email included project overview and next steps</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => onAction('reset_proposal_stage')}
              variant="outline"
              size="sm"
              className="bg-white border-[#95CBD7] text-[#407B9D] hover:bg-[#95CBD7]/10 transition-all duration-200 hover:scale-105 rounded-lg shadow-sm"
            >
              <RotateCw className="w-4 h-4 mr-2" />Reset Stage
            </Button>
          </div>
        </div>
      )
    }

    // Show proposal email draft for pending/in-progress stage
    if (sprintPricingData) {
      const sprintOptions = {
        "0.5": "2.5 days",
        "1": "5 days",
        "1.5": "7.5 days",
        "2": "10 days"
      }

      const sprintDuration = sprintOptions[sprintPricingData.sprintLength as keyof typeof sprintOptions] || `${sprintPricingData.sprintLength} sprint days`

      const proposalEmailContent = `Subject: Your Automation Project Proposal - Ready to Get Started!

Hi there!

Thank you for taking the time to discuss your automation needs with us. Based on our scoping session and analysis, I'm excited to present our proposal for your project.

## Project Overview
We've carefully reviewed your requirements and believe we can deliver an excellent automation solution that will streamline your operations and save you valuable time.

## Proposed Timeline & Investment

**Sprint Duration:** ${sprintDuration}
**Total Investment:** $${sprintPricingData.price.toLocaleString()}

${sprintPricingData.aiExplanation}

## What's Included
• Complete automation development and implementation
• Thorough testing across all use cases
• Documentation and handover training
• 30 days of post-launch support and adjustments

## Next Steps
If you're ready to move forward, simply reply to this email and we'll send over the engagement agreement to get started. We're excited to help transform your business processes!

Looking forward to working with you!

Best regards,
The GrowthLab Team`

      return (
        <div className="mt-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Proposal Email Draft Ready</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Based on your sprint estimate: {sprintDuration} for ${sprintPricingData.price.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{proposalEmailContent}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(proposalEmailContent)
                setEmailCopied(true)
                setTimeout(() => setEmailCopied(false), 2000)
              }}
              variant="outline"
              className={`flex-1 transition-all duration-200 hover:scale-105 rounded-lg shadow-md ${
                emailCopied
                  ? "bg-[#C8E4BB] border-[#C8E4BB] text-gray-800 hover:bg-[#b5d6a5]"
                  : "bg-white border-[#95CBD7] text-[#407B9D] hover:bg-[#95CBD7]/10"
              }`}
            >
              {emailCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Email Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Email
                </>
              )}
            </Button>
            <Button
              onClick={() => onAction('proposal_email_sent')}
              className="flex-1 bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
            >
              <Send className="w-4 h-4 mr-2" />Email Sent
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            Click "Copy Email" to copy the proposal, then "Email Sent" when you've sent it to the client
          </p>
        </div>
      )
    } else {
      // If no sprint pricing data available, show placeholder
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium text-yellow-800">Sprint Pricing Required</h3>
          </div>
          <p className="text-sm text-yellow-700">
            Please complete the Sprint Length & Price Estimate stage first to generate the proposal email.
          </p>
        </div>
      )
    }
  }

  // Special handling for Internal & Client Documentation stage
  if (event.type === "internal-client-docs") {
    const internalClientDocsFileType = getFileTypeById('internal-client-documentation')
    if (internalClientDocsFileType) {
      return (
        <div className="mt-4">
          {/* AI Generation Button */}
          {event.actions.automated && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction('automated')}
                disabled={!!existingFile || scopingDocGenerating}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                {scopingDocGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {event.actions.automated.label}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={internalClientDocsFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('internal-client-documentation')}
              variant="compact"
            />
          </div>
        </div>
      )
    }
  }

  // Special handling for Kickoff Meeting Agenda stage
  if (event.type === "kickoff") {
    const kickoffAgendaFileType = getFileTypeById('kickoff-meeting-brief')
    if (kickoffAgendaFileType) {
      return (
        <div className="mt-4">
          {/* AI Generation Button */}
          {event.actions.automated && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction('automated')}
                disabled={!!existingFile || kickoffAgendaGenerating}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                {kickoffAgendaGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {event.actions.automated.label}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={kickoffAgendaFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('kickoff-meeting-brief')}
              variant="compact"
            />
          </div>
        </div>
      )
    }
  }

  // Email Draft Screen - show after developer selection
  if (event.type === "decision" && showEmailDraft && selectedDeveloper) {
    const developerData = {
      nick: {
        name: "Nick",
        title: "The Growth Architect",
        bookingLink: "https://calendly.com/nick-growthlab/scoping-call",
        specialty: "Marketing & Growth Systems"
      },
      gon: {
        name: "Gon",
        title: "The Numbers Ninja",
        bookingLink: "https://calendly.com/gon-growthlab/scoping-call",
        specialty: "Finance & Operations Systems"
      }
    }

    const developer = developerData[selectedDeveloper as keyof typeof developerData]
    const emailContent = `Subject: Ready to Move Forward with Your Automation Project!

Hi there!

Great news! After reviewing your demo call and readiness assessment, we're excited to move forward with your automation project.

I've assigned ${developer.name} (${developer.title}) to work with you. ${developer.name} specializes in ${developer.specialty} and will be perfect for your project needs.

Please use the link below to schedule your scoping call with ${developer.name}:
${developer.bookingLink}

During this call, we'll dive deep into your specific requirements and create a detailed technical plan for your automation solution.

Looking forward to working with you!

Best regards,
The GrowthLab Team`

    return (
      <div className="mt-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Email Draft Ready</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
            <img src="/hubspot-logo.svg" alt="HubSpot" className="w-4 h-4" />
            A HubSpot deal card has been created for this lead
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{emailContent}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(emailContent)
              setEmailCopied(true)
              // Reset after 2 seconds
              setTimeout(() => setEmailCopied(false), 2000)
            }}
            variant="outline"
            className={`flex-1 transition-all duration-200 hover:scale-105 rounded-lg shadow-md ${
              emailCopied
                ? "bg-[#C8E4BB] border-[#C8E4BB] text-gray-800 hover:bg-[#b5d6a5]"
                : "bg-white border-[#95CBD7] text-[#407B9D] hover:bg-[#95CBD7]/10"
            }`}
          >
            {emailCopied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Email Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Email
              </>
            )}
          </Button>
          <Button
            onClick={() => onAction('email_sent')}
            className="flex-1 bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
          >
            <Send className="w-4 h-4 mr-2" />Email Sent
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Click "Copy Email" to copy the draft, then "Email Sent" when you've sent it to the client
        </p>
      </div>
    )
  }

  // Not a Fit Email Draft Screen
  if (event.type === "decision" && showNotAFitEmail) {
    const notAFitEmailContent = `Subject: Thank You for Your Interest in GrowthLab Automation

Hi there,

Thank you for taking the time to explore automation opportunities with GrowthLab. We really appreciate your interest in our services.

After reviewing your demo call and completing our readiness assessment, we've determined that your current needs and our automation expertise may not be the perfect match at this time.

This doesn't reflect on your business in any way - it simply means that our specific automation solutions might not align with your current operational structure and requirements.

We encourage you to revisit automation opportunities in the future as your business evolves. Feel free to reach out again if your needs change or if you'd like to discuss alternative approaches.

We wish you all the best with your business growth!

Best regards,
The GrowthLab Team`

    return (
      <div className="mt-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Not a Fit - Email Draft Ready</h3>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{notAFitEmailContent}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(notAFitEmailContent)
              setEmailCopied(true)
              // Reset after 2 seconds
              setTimeout(() => setEmailCopied(false), 2000)
            }}
            variant="outline"
            className={`flex-1 transition-all duration-200 hover:scale-105 rounded-lg shadow-md ${
              emailCopied
                ? "bg-[#C8E4BB] border-[#C8E4BB] text-gray-800 hover:bg-[#b5d6a5]"
                : "bg-white border-red-200 text-red-600 hover:bg-red-50"
            }`}
          >
            {emailCopied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Email Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Email
              </>
            )}
          </Button>
          <Button
            onClick={() => onAction('not_a_fit_email_sent')}
            className="flex-1 bg-red-400 hover:bg-red-500 text-white border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
          >
            <Send className="w-4 h-4 mr-2" />Email Sent
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Click "Copy Email" to copy the draft, then "Email Sent" when you've sent it to the client
        </p>
      </div>
    )
  }

  // Proposal Adjustment Form - show when adjusting proposal
  if (event.type === "proposal-decision" && showProposalAdjustment && onProposalAdjustmentConfirm) {
    // Map sprint pricing data to form format (use current sprint/price, but empty explanation for adjustment mode)
    const initialData = sprintPricingData ? {
      sprintLength: sprintPricingData.sprintLength,
      price: sprintPricingData.price,
      explanation: "" // Start with empty adjustment reasoning
    } : {
      sprintLength: "1",
      price: 4000,
      explanation: ""
    }
    return (
      <div className="mt-4">
        <SprintPricingForm
          onConfirm={onProposalAdjustmentConfirm}
          onCancel={() => onAction('cancel_proposal_adjustment')}
          initialData={initialData}
          isAdjustmentMode={true}
        />
      </div>
    )
  }

  // Proposal Decision Recap - show for completed proposal-decision stage when expanded
  if (event.type === "proposal-decision" && event.status === "completed") {
    if (proposalDeclined) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Recap</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-red-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <img src="/hubspot-logo.svg" alt="HubSpot" className="w-6 h-6" />
            <div>
              <h4 className="font-semibold text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Proposal Declined</h4>
              <p className="text-sm text-gray-600">Client declined the proposal - HubSpot deal automatically moved to closed lost</p>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            <p>• Proposal was declined by the client</p>
            <p>• HubSpot deal status updated to "Closed Lost"</p>
            <p>• All remaining onboarding stages have been marked as not applicable</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => onAction('restart_proposal_decision')}
            variant="outline"
            size="sm"
            className="bg-white border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105 rounded-lg shadow-sm"
          >
            <RotateCw className="w-4 h-4 mr-2" />Restart Proposal Decision
          </Button>
        </div>
      </div>
    )
    }

    // Show recap for adjusted & accepted proposal
    if (sprintPricingData && proposalWasAdjusted) {
      return (
        <div className="mt-4 p-4 bg-[#95CBD7]/20 border border-[#95CBD7] rounded-xl">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <RotateCw className="w-5 h-5 text-[#407B9D]" />
              <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Recap</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Adjusted Sprint Length & Pricing</h4>
                <p className="text-sm text-gray-600">Client accepted the proposal but requested adjustments to the original sprint length and price</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">New Sprint Length:</span>
                <span>{SPRINT_OPTIONS.find(opt => opt.value === sprintPricingData.sprintLength)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">New Price:</span>
                <span className="font-semibold" style={{color: '#407B9D'}}>${sprintPricingData.price.toLocaleString()}</span>
              </div>
              <div className="mt-3">
                <span className="font-medium">Adjustment Reasoning:</span>
                <p className="mt-1 text-gray-600 italic">"{sprintPricingData.adjustmentReasoning}"</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => onAction('restart_proposal_decision')}
              variant="outline"
              size="sm"
              className="bg-white border-[#95CBD7] text-[#407B9D] hover:bg-[#95CBD7]/10 transition-all duration-200 hover:scale-105 rounded-lg shadow-sm"
            >
              <RotateCw className="w-4 h-4 mr-2" />Restart Proposal Decision
            </Button>
          </div>
        </div>
      )
    }

    // Show recap for regular accepted proposal (not adjusted)
    if (sprintPricingData && !proposalWasAdjusted) {
      return (
        <div className="mt-4 p-4 bg-[#C8E4BB]/20 border border-[#C8E4BB] rounded-xl">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Recap</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Proposal Accepted</h4>
                <p className="text-sm text-gray-600">Client accepted the proposal as originally presented</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Sprint Length:</span>
                <span>{SPRINT_OPTIONS.find(opt => opt.value === sprintPricingData.sprintLength)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Agreed Price:</span>
                <span className="font-semibold" style={{color: '#407B9D'}}>${sprintPricingData.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => onAction('restart_proposal_decision')}
              variant="outline"
              size="sm"
              className="bg-white border-[#95CBD7] text-[#407B9D] hover:bg-[#95CBD7]/10 transition-all duration-200 hover:scale-105 rounded-lg shadow-sm"
            >
              <RotateCw className="w-4 h-4 mr-2" />Restart Proposal Decision
            </Button>
          </div>
        </div>
      )
    }
  }

  // Engagement Agreement Actions - Create Contact and Proposal in Anchor
  if (event.type === "ea" && !eaConfirmed) {
    return (
      <div className="mt-4 space-y-4">
        <div className="p-4 bg-[#95CBD7]/20 border border-[#95CBD7] rounded-xl">
          <div className="space-y-3">
            {/* Create Contact & Proposal Draft In Anchor */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-gray-600" />
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Create Contact & Proposal Draft In Anchor</h4>
                </div>
              </div>
              <div className="flex items-center">
                {anchorSetupCreated ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                ) : anchorSetupLoading ? (
                  <div className="flex items-center gap-2 text-[#407B9D]">
                    <div className="w-4 h-4 border-2 border-[#407B9D] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Creating...</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => onAction('create_anchor_setup')}
                    size="sm"
                    className="bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>

            {/* Generate EA Wording with AI */}
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Project-Specific EA Wording</h4>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction('generate_ea_wording')}
                disabled={!!existingFile || eaWordingGenerating}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                {eaWordingGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate with AI
                  </>
                )}
              </Button>

              <div className="mt-3">
                <p className="text-sm font-medium text-foreground mb-2">Or upload manually:</p>
                {(() => {
                  const eaWordingFileType = getFileTypeById('ea-wording')
                  if (eaWordingFileType) {
                    return (
                      <FileUpload
                        fileType={eaWordingFileType}
                        onFileUploaded={onFileUploaded}
                        onFileCleared={() => onFileCleared?.('ea-wording')}
                        existingFile={existingFile}
                        variant="compact"
                      />
                    )
                  }
                  return <p className="text-red-500 text-sm">File type not found</p>
                })()}
              </div>
            </div>

            {/* Confirm EA Completed */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Confirm Anchor Proposal Completed and Sent</h4>
                </div>
              </div>
              <div className="flex items-center">
                {eaConfirmed ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Confirmed</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => onAction('confirm_ea_completed')}
                    size="sm"
                    className="bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                  >
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Project Setup Actions - Create ClickUp Task and Airtable CRM & Inventory Record
  if (event.type === "setup") {
    return (
      <div className="mt-4 space-y-4">
        <div className="p-4 bg-[#95CBD7]/20 border border-[#95CBD7] rounded-xl">
          <div className="space-y-3">
            {/* Create ClickUp Task */}
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Create ClickUp Task</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Manual for now - soon automating with GL AI Console project management</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {clickupTaskCreated ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => onAction('create_clickup_task')}
                      size="sm"
                      className="bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Create Airtable CRM & Inventory Record */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Create Airtable CRM & Inventory Record</h4>
                </div>
              </div>
              <div className="flex items-center">
                {airtableRecordCreated ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                ) : airtableRecordLoading ? (
                  <div className="flex items-center gap-2 text-[#407B9D]">
                    <div className="w-4 h-4 border-2 border-[#407B9D] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Creating...</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => onAction('create_airtable_record')}
                    size="sm"
                    className="bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>

            {/* Move HubSpot Deal To Closed Won */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Move HubSpot Deal To Closed Won</h4>
                </div>
              </div>
              <div className="flex items-center">
                {(() => {
                  console.log('HubSpot UI - hubspotDealMoved:', hubspotDealMoved)
                  return null
                })()}
                {hubspotDealMoved ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Moved</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      console.log('Move button clicked - calling onAction')
                      onAction('move_hubspot_deal')
                    }}
                    size="sm"
                    className="bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                  >
                    Move
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Kickoff Email Draft */}
          <div className="mt-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-lg" style={{fontFamily: 'var(--font-heading)', color: '#407B9D'}}>Kickoff Email Draft Ready</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Project setup complete - time to send the kickoff email to your client
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`Subject: Project Kickoff - Let's Get Started!

Hi there!

Great news! We're ready to kick off your automation project. Our team has completed all the initial setup and we're excited to get started.

## Project Overview
Your automation project is now set up and ready to begin development. We've created your project workspace and assigned your dedicated developer.

## Your Point of Contact
**Developer:** [Developer Name]
**Title:** [Developer Title]
**Specialty:** [Developer Specialty]

## Next Steps
Let's schedule your project kickoff meeting to:
• Review the project scope and timeline
• Introduce your development team
• Answer any questions you might have
• Set up regular check-in meetings

**Schedule your kickoff meeting:** [Booking Link]

We're looking forward to working with you and delivering an amazing automation solution!

Best regards,
The GrowthLab Team`}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => onAction('copy_setup_email')}
                  variant="outline"
                  className={`flex-1 transition-all duration-200 hover:scale-105 rounded-lg shadow-md ${
                    setupEmailCopied
                      ? "bg-[#C8E4BB]/30 border-[#C8E4BB] text-gray-800 hover:bg-[#C8E4BB]/50"
                      : "bg-[#95CBD7]/30 border-[#95CBD7] text-gray-800 hover:bg-[#95CBD7]/50"
                  }`}
                >
                  {setupEmailCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Email Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Email
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => onAction('setup_email_sent')}
                  className="flex-1 bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                >
                  <Send className="w-4 h-4 mr-2" />Email Sent
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Click "Copy Email" to copy the draft, then "Email Sent" when you've sent it to the client
              </p>
            </div>
        </div>
      </div>
    )
  }


  // Decision Recap - show for completed decision stage when expanded
  if (event.type === "decision" && event.status === "completed" && decisionMade) {
    const getDeveloperInfo = (dev: string) => {
      if (dev === 'nick') return { name: 'Nick' }
      if (dev === 'gon') return { name: 'Gon' }
      return null
    }

    return (
      <div className="mt-4 p-4 bg-[#C8E4BB]/20 border border-[#C8E4BB] rounded-xl">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-lg text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Recap</h3>
          </div>
        </div>

        {decisionMade === 'reject' ? (
          <div className="bg-white rounded-xl border border-red-200 p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <h4 className="font-semibold text-gray-800" style={{fontFamily: 'var(--font-heading)'}}>Not a Fit</h4>
                <p className="text-sm text-gray-600">Lead was marked as not suitable for our automation services</p>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              <p>• Rejection email was sent to the prospect</p>
              <p>• All remaining stages have been marked as not applicable</p>
            </div>
          </div>
        ) : decisionMade?.startsWith('proceed_') ? (
          <div className="bg-white rounded-xl border border-[#407B9D]/30 p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold" style={{fontFamily: 'var(--font-heading)', color: '#407B9D'}}>Proceeding with Scoping</h4>
                <p className="text-sm text-gray-600">Lead was approved and developer assigned</p>
              </div>
            </div>

            {(() => {
              const developerKey = decisionMade.replace('proceed_', '')
              const developer = getDeveloperInfo(developerKey)
              return developer ? (
                <div className="text-sm text-gray-700">
                  <p className="mb-2"><strong>Assigned Developer:</strong></p>
                  <div className="bg-[#95CBD7]/20 p-3 rounded-lg border border-[#95CBD7]">
                    <p className="font-medium" style={{color: '#407B9D'}}>{developer.name}</p>
                  </div>
                  <div className="mt-3">
                    <p>Email sent to schedule scoping call</p>
                  </div>
                </div>
              ) : null
            })()}
          </div>
        ) : null}

        <div className="flex justify-center">
          <Button
            onClick={() => onAction('restart_decision')}
            variant="outline"
            size="sm"
            className="bg-white border-[#95CBD7] text-[#407B9D] hover:bg-[#95CBD7]/10 transition-all duration-200 hover:scale-105 rounded-lg shadow-sm"
          >
            <RotateCw className="w-4 h-4 mr-2" />Restart Decision Stage
          </Button>
        </div>
      </div>
    )
  }

  // Don't show fallback actions for completed EA stage
  if (event.type === "ea" && eaConfirmed) {
    return null
  }

  return (
    <div className="mt-4">
      {/* Automated Action */}
      {event.actions.automated && (
        <div className="mb-3">
          <Button
            variant={event.actions.automated.inProgress ? "outline" : "default"}
            size="sm"
            onClick={() => onAction('automated')}
            disabled={event.actions.automated.inProgress || !!existingFile}
            className="w-full sm:w-auto"
          >
            {event.actions.automated.inProgress ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>{event.actions.automated.label}</span>
                {event.actions.automated.timeLeft && (
                  <span className="text-xs opacity-75">({event.actions.automated.timeLeft})</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {event.actions.automated.label}
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Decision Options - Handle both scoping decision and proposal decision */}
      {event.actions.decision && !showDeveloperSelection && !showNotAFitEmail && (
        <div className="mt-4 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center flex items-center justify-center gap-2" style={{fontFamily: 'var(--font-heading)'}}>
            <ClipboardList className="w-4 h-4" />
            {event.type === "proposal-decision" ? "What's the client's response?" : "Ready to make a decision?"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {event.actions.decision.options.map((option, index) => (
              <Button
                key={index}
                variant={option.variant === "primary" ? "default" :
                        option.variant === "destructive" ? "destructive" : "outline"}
                size="default"
                onClick={() => onAction(option.action)}
                className={`flex-1 font-medium transition-all duration-200 hover:scale-105 shadow-md rounded-lg ${
                  option.variant === "primary"
                    ? "bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0"
                    : option.variant === "destructive"
                    ? "bg-red-400 hover:bg-red-500 text-white border-0"
                    : option.variant === "secondary"
                    ? "bg-[#407B9D] hover:bg-[#356780] text-white border-0"
                    : "border-2 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Developer Selection */}
      {event.actions.decision && showDeveloperSelection && (
        <div className="mt-4 p-6 bg-[#95CBD7]/20 border border-[#95CBD7] rounded-xl">
          <p className="text-lg font-bold text-gray-800 mb-2 text-center flex items-center justify-center gap-2" style={{fontFamily: 'var(--font-heading)'}}>
            <Target className="w-5 h-5 text-[#407B9D]" />
            Choose Your Scoping Champion!
          </p>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Who would you like to handle this scoping call?
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Nick Option */}
            <div className="bg-white rounded-xl border-2 border-[#407B9D]/30 hover:border-[#407B9D] transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
              <div className="p-4 text-center">
                <div className="flex justify-center mb-3"><Rocket className="w-16 h-16 text-[#407B9D]" /></div>
                <h3 className="font-bold text-lg mb-2" style={{fontFamily: 'var(--font-heading)', color: '#407B9D'}}>Nick</h3>
                <p className="text-sm text-gray-600 mb-2">The Growth Architect</p>
                <p className="text-xs text-gray-500 mb-3 font-medium">Marketing & Growth Systems</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5 text-left px-8">
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><Rocket className="w-3 h-3 flex-shrink-0 mt-0.5" /> Onboarding & client experience</span>
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><Mail className="w-3 h-3 flex-shrink-0 mt-0.5" /> Marketing automation</span>
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><Target className="w-3 h-3 flex-shrink-0 mt-0.5" /> CRM & sales workflows</span>
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><Users className="w-3 h-3 flex-shrink-0 mt-0.5" /> Customer journey optimization</span>
                </div>
                <Button
                  onClick={() => onAction('select_developer_nick')}
                  className="w-full bg-[#407B9D] hover:bg-[#356780] text-white border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                >
                  <Target className="w-4 h-4 mr-2 inline" />
                  Choose Nick
                </Button>
              </div>
            </div>

            {/* Gon Option */}
            <div className="bg-white rounded-xl border-2 border-[#C8E4BB]/50 hover:border-[#C8E4BB] transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
              <div className="p-4 text-center">
                <div className="flex justify-center mb-3"><User className="w-16 h-16 text-gray-700" /></div>
                <h3 className="font-bold text-lg mb-2" style={{fontFamily: 'var(--font-heading)', color: '#407B9D'}}>Gon</h3>
                <p className="text-sm text-gray-600 mb-2">The Numbers Ninja</p>
                <p className="text-xs text-gray-500 mb-3 font-medium">Finance & Operations Systems</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5 text-left px-8">
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><DollarSign className="w-3 h-3 flex-shrink-0 mt-0.5" /> Accounting integrations</span>
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><BarChart3 className="w-3 h-3 flex-shrink-0 mt-0.5" /> Financial reporting</span>
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><Calculator className="w-3 h-3 flex-shrink-0 mt-0.5" /> Invoice & payment automation</span>
                  <span className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed"><TrendingUp className="w-3 h-3 flex-shrink-0 mt-0.5" /> Revenue operations</span>
                </div>
                <Button
                  onClick={() => onAction('select_developer_gon')}
                  className="w-full bg-[#C8E4BB] hover:bg-[#b5d6a5] text-gray-800 border-0 transition-all duration-200 hover:scale-105 rounded-lg shadow-md"
                >
                  <DollarSign className="w-4 h-4 mr-2 inline" />
                  Choose Gon
                </Button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Manual Action */}
      {event.actions.manual && !event.actions.manual.label.includes("Upload") && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('manual')}
            className="w-full sm:w-auto"
          >
            {event.actions.manual.label}
          </Button>
        </div>
      )}
    </div>
  )
}

const ArtifactsSection = ({ event }: { event: TimelineEvent }) => {
  if (!event.artifacts || event.artifacts.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1"><FileText className="w-4 h-4" /> Artifacts:</p>
      <div className="space-y-1">
        {event.artifacts.map((artifact, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-sm">
            {artifact.type === "score" ? (
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-blue-600">{artifact.name}</span>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="h-auto p-1 justify-start">
                <span className="mr-1">
                  {artifact.type === "pdf" ? <FileText className="w-4 h-4 inline" /> :
                   artifact.type === "audio" ? <Zap className="w-4 h-4 inline" /> :
                   artifact.type === "document" ? <FileText className="w-4 h-4 inline" /> : <Paperclip className="w-4 h-4 inline" />}
                </span>
                {artifact.name}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const StageCard = ({
  event,
  index,
  isLast,
  nextEvent,
  onToggleCollapse,
  onAction,
  onFileUploaded,
  onFileCleared,
  existingFile,
  showDeveloperSelection,
  showEmailDraft,
  selectedDeveloper,
  showNotAFitEmail,
  decisionMade,
  onSprintPricingConfirm,
  sprintPricingData,
  proposalDeclined,
  showProposalAdjustment,
  proposalWasAdjusted,
  onProposalAdjustmentConfirm,
  anchorSetupCreated,
  anchorSetupLoading,
  eaWordingGenerated,
  eaWordingGenerating,
  eaConfirmed,
  readinessGenerating,
  scopingPrepGenerating,
  workflowDocsGenerating,
  scopingDocGenerating,
  kickoffAgendaGenerating,
  clickupTaskCreated,
  airtableRecordCreated,
  airtableRecordLoading,
  hubspotDealMoved,
  setupEmailCopied,
  setupEmailSent,
  aiSprintEstimatesLoading,
  aiSprintEstimatesAvailable,
  completionDate
}: {
  event: TimelineEvent
  index: number
  isLast: boolean
  nextEvent?: TimelineEvent
  onToggleCollapse: (id: string) => void
  onAction: (eventId: string, action: string) => void
  onFileUploaded?: (file: UploadedFile) => void
  onFileCleared?: (fileTypeId: string) => void
  existingFile?: UploadedFile
  showDeveloperSelection?: boolean
  showEmailDraft?: boolean
  selectedDeveloper?: string | null
  showNotAFitEmail?: boolean
  decisionMade?: string | null
  onSprintPricingConfirm?: (data: {
    sprintLength: string
    price: number
    explanation: string
    initialAiSprintLength?: string
    initialAiPrice?: number
    initialAiExplanation?: string
  }) => void
  sprintPricingData?: { sprintLength: string; price: number; aiExplanation: string; adjustmentReasoning?: string } | null
  proposalDeclined?: boolean
  showProposalAdjustment?: boolean
  proposalWasAdjusted?: boolean
  onProposalAdjustmentConfirm?: (data: { sprintLength: string; price: number; explanation: string }) => void
  anchorSetupCreated?: boolean
  anchorSetupLoading?: boolean
  eaWordingGenerated?: boolean
  eaWordingGenerating?: boolean
  eaConfirmed?: boolean
  readinessGenerating?: boolean
  scopingPrepGenerating?: boolean
  workflowDocsGenerating?: boolean
  scopingDocGenerating?: boolean
  kickoffAgendaGenerating?: boolean
  clickupTaskCreated?: boolean
  airtableRecordCreated?: boolean
  airtableRecordLoading?: boolean
  hubspotDealMoved?: boolean
  setupEmailCopied?: boolean
  setupEmailSent?: boolean
  aiSprintEstimatesLoading?: boolean
  aiSprintEstimatesAvailable?: boolean
  completionDate?: string
}) => {
  const isActive = event.status === "in_progress" || event.status === "action-required"

  return (
    <div className={cn(
      "relative transition-all duration-300",
      isActive && "ring-2 ring-blue-200 ring-opacity-50 rounded-lg"
    )}>
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
          event.status === "skipped" ? "border-gray-300 bg-gray-50 opacity-50" :
          "border-gray-300 bg-gray-50",
          isActive && "animate-pulse"
        )}>
          {(() => {
            const StageIcon = getStageIcon(event.icon)
            return <StageIcon className="w-6 h-6" />
          })()}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "p-4 border-2 rounded-lg bg-background transition-all duration-300",
            event.status === "completed" && event.isCollapsed ? "border-border bg-[#C8E4BB]/20" :
            event.status === "skipped" ? "border-border bg-gray-50/50 opacity-60" :
            isActive ? "border-[#407B9D] bg-[#407B9D]/10" :
            "border-border"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className={cn(
                  "text-lg font-medium",
                  event.status === "skipped" ? "line-through text-gray-500" : "text-foreground"
                )}>
                  {event.title}
                </h3>
                {/* Automation Level Badge */}
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                  event.automationLevel === "fully-automated"
                    ? "bg-[#C8E4BB]/20 text-[#5A8A4A] border-[#C8E4BB]/40"
                    : "bg-[#407B9D]/10 text-[#407B9D] border-[#407B9D]/30"
                )}>
                  {event.automationLevel === "fully-automated" ? <><Zap className="w-4 h-4 inline mr-1" /> Automated</> : <><User className="w-4 h-4 inline mr-1" /> Manual</>}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleCollapse(event.id)}
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
                <p className={cn(
                  "text-sm mb-3",
                  event.status === "skipped" ? "text-gray-500" : "text-muted-foreground"
                )}>
                  {event.description}
                </p>

                {/* Readiness Score Display */}
                {event.readinessScore && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Readiness Score</span>
                      <span className="text-lg font-bold text-blue-600">{event.readinessScore}/100</span>
                    </div>
                    <div className="mt-1 w-full bg-white rounded-full h-2">
                      <div
                        className="bg-[#407B9D] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${event.readinessScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Zone - Show for non-completed stages OR for demo/readiness/scoping-prep/scoping/dev-overview/workflow-docs/sprint-pricing/proposal/internal-client-docs/kickoff stages with uploaded files OR for completed decision/proposal-decision stages (when expanded) OR for proposal-decision adjustment mode */}
                {(event.status !== "completed" && event.status !== "skipped") ||
                 ((event.id === "demo" || event.id === "readiness" || event.id === "scoping-prep" || event.id === "scoping" || event.id === "dev-overview" || event.id === "workflow-docs" || event.id === "sprint-pricing" || event.id === "proposal" || event.id === "internal-client-docs" || event.id === "ea" || event.id === "kickoff") && event.status === "completed") ||
                 ((event.id === "decision" || event.id === "proposal-decision") && event.status === "completed" && !event.isCollapsed) ||
                 (event.id === "proposal-decision" && showProposalAdjustment) ? (
                  <ActionZone
                    event={event}
                    onAction={(actionName) => onAction(event.id, actionName)}
                    onFileUploaded={onFileUploaded}
                    onFileCleared={onFileCleared}
                    existingFile={existingFile}
                    showDeveloperSelection={event.id === "decision" ? showDeveloperSelection : false}
                    showEmailDraft={event.id === "decision" ? showEmailDraft : false}
                    selectedDeveloper={selectedDeveloper}
                    showNotAFitEmail={event.id === "decision" ? showNotAFitEmail : false}
                    decisionMade={event.id === "decision" ? decisionMade : null}
                    onSprintPricingConfirm={event.id === "sprint-pricing" ? onSprintPricingConfirm : undefined}
                    sprintPricingData={(event.id === "sprint-pricing" || event.id === "proposal" || event.id === "proposal-decision") ? sprintPricingData : null}
                    proposalDeclined={event.id === "proposal-decision" ? proposalDeclined : false}
                    showProposalAdjustment={event.id === "proposal-decision" ? showProposalAdjustment : false}
                    proposalWasAdjusted={event.id === "proposal-decision" ? proposalWasAdjusted : false}
                    onProposalAdjustmentConfirm={event.id === "proposal-decision" ? onProposalAdjustmentConfirm : undefined}
                    anchorSetupCreated={event.id === "ea" ? anchorSetupCreated : false}
                    anchorSetupLoading={event.id === "ea" ? anchorSetupLoading : false}
                    eaWordingGenerated={event.id === "ea" ? eaWordingGenerated : false}
                    eaWordingGenerating={event.id === "ea" ? eaWordingGenerating : false}
                    eaConfirmed={event.id === "ea" ? eaConfirmed : false}
                    readinessGenerating={event.id === "readiness" ? readinessGenerating : false}
                    scopingPrepGenerating={event.id === "scoping-prep" ? scopingPrepGenerating : false}
                    workflowDocsGenerating={event.id === "workflow-docs" ? workflowDocsGenerating : false}
                    scopingDocGenerating={event.id === "internal-client-docs" ? scopingDocGenerating : false}
                    kickoffAgendaGenerating={event.id === "kickoff" ? kickoffAgendaGenerating : false}
                    clickupTaskCreated={event.id === "setup" ? clickupTaskCreated : false}
                    airtableRecordCreated={event.id === "setup" ? airtableRecordCreated : false}
                    airtableRecordLoading={event.id === "setup" ? airtableRecordLoading : false}
                    hubspotDealMoved={event.id === "setup" ? hubspotDealMoved : false}
                    setupEmailCopied={event.id === "setup" ? setupEmailCopied : false}
                    setupEmailSent={event.id === "setup" ? setupEmailSent : false}
                    aiSprintEstimatesLoading={event.id === "sprint-pricing" ? aiSprintEstimatesLoading : false}
                    aiSprintEstimatesAvailable={event.id === "sprint-pricing" ? aiSprintEstimatesAvailable : false}
                  />
                ) : null}

                {/* EA Recap - show for completed EA stage when expanded */}
                {event.type === "ea" && event.status === "completed" && !event.isCollapsed && eaConfirmed && (
                  <div className="mt-4 p-4 bg-[#C8E4BB]/20 border border-[#C8E4BB] rounded-xl">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-lg" style={{fontFamily: 'var(--font-heading)', color: '#407B9D'}}>Recap</h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Contact Creation Status */}
                      {/* Anchor Setup Status */}
                      <div className="flex items-center justify-between p-3 bg-white/80 border border-[#95CBD7]/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-700">Contact & Proposal Created in Anchor</span>
                        </div>
                        {anchorSetupCreated ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Complete</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Circle className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium">Not Created</span>
                          </div>
                        )}
                      </div>

                      {/* EA Wording Status */}
                      <div className="p-3 bg-white/80 border border-[#95CBD7]/50 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Project-Specific EA Wording</span>
                        </div>
                        {eaWordingGenerated ? (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Generated with AI</span>
                          </div>
                        ) : eaWordingGenerating ? (
                          <div className="flex items-center gap-2 text-[#407B9D] text-sm">
                            <div className="w-4 h-4 border-2 border-[#407B9D] border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </div>
                        ) : (
                          <div>
                            {(() => {
                              const eaWordingFileType = getFileTypeById('ea-wording')
                              if (eaWordingFileType) {
                                return (
                                  <FileUpload
                                    fileType={eaWordingFileType}
                                    onFileUploaded={onFileUploaded}
                                    onFileCleared={() => onFileCleared?.('ea-wording')}
                                    existingFile={existingFile}
                                    variant="compact"
                                  />
                                )
                              }
                              return (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                                  <span>File type not found</span>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Confirmation Status */}
                      <div className="flex items-center justify-between p-3 bg-white/80 border border-[#95CBD7]/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-700">EA Completed and Sent to Customer</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Confirmed</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={() => onAction(event.id, 'reset_ea_stage')}
                        variant="outline"
                        size="sm"
                        className="bg-white border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10 hover:scale-105 transition-all duration-200"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />Reset Stage
                      </Button>
                    </div>

                  </div>
                )}

                {/* Project Setup Recap - show for completed setup stage when expanded */}
                {event.type === "setup" && event.status === "completed" && !event.isCollapsed && setupEmailSent && (
                  <div className="mt-4 p-4 bg-[#C8E4BB]/20 border border-[#C8E4BB] rounded-xl">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-lg" style={{fontFamily: 'var(--font-heading)', color: '#407B9D'}}>Recap</h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* ClickUp Task Status */}
                      <div className="flex items-center justify-between p-3 bg-white/80 border border-[#95CBD7]/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">ClickUp Task Created</span>
                        </div>
                        {clickupTaskCreated ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Complete</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Circle className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium">Not Created</span>
                          </div>
                        )}
                      </div>

                      {/* Airtable Record Status */}
                      <div className="flex items-center justify-between p-3 bg-white/80 border border-[#95CBD7]/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Airtable CRM & Inventory Record Created</span>
                        </div>
                        {airtableRecordCreated ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Complete</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Circle className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium">Not Created</span>
                          </div>
                        )}
                      </div>

                      {/* HubSpot Deal Status */}
                      <div className="flex items-center justify-between p-3 bg-white/80 border border-[#95CBD7]/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">HubSpot Deal Moved to Closed Won</span>
                        </div>
                        {hubspotDealMoved ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Moved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Circle className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium">Not Moved</span>
                          </div>
                        )}
                      </div>

                      {/* Kickoff Email Status */}
                      <div className="flex items-center justify-between p-3 bg-white/80 border border-[#95CBD7]/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Kickoff Email Sent to Client</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Sent</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={() => onAction('setup', 'reset_setup_stage')}
                        variant="outline"
                        size="sm"
                        className="bg-white border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10 hover:scale-105 transition-all duration-200"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />Reset Stage
                      </Button>
                    </div>
                  </div>
                )}

                {/* Artifacts */}
                <ArtifactsSection event={event} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Timeline({ events, leadId, hideHeader = false, uploadedFiles: propUploadedFiles, onFileUploaded, onFileCleared, leadStage, completionDates = {} }: TimelineProps) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(
    new Set(events.filter(e => e.isCollapsed).map(e => e.id))
  )
  const [completedStages, setCompletedStages] = useState<Set<string>>(
    new Set(events.filter(e => e.status === "completed").map(e => e.id))
  )
  // Use uploaded files from props if provided, otherwise use local state as fallback
  const [localUploadedFiles, setLocalUploadedFiles] = useState<Record<string, UploadedFile>>({})
  const uploadedFiles = propUploadedFiles || localUploadedFiles
  const [showDeveloperSelection, setShowDeveloperSelection] = useState(false)
  const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null)
  const [showEmailDraft, setShowEmailDraft] = useState(false)
  const [showNotAFitEmail, setShowNotAFitEmail] = useState(false)
  const [leadRejected, setLeadRejected] = useState(false)
  const [decisionMade, setDecisionMade] = useState<string | null>(null)
  const [proposalDeclined, setProposalDeclined] = useState(false)
  const [showProposalAdjustment, setShowProposalAdjustment] = useState(false)
  const [proposalWasAdjusted, setProposalWasAdjusted] = useState(false)
  // Combined Anchor action state
  const [anchorSetupCreated, setAnchorSetupCreated] = useState(false)
  const [dealCreated, setDealCreated] = useState(false)

  // Sync Timeline internal state with external changes (like file clearing from documents section)
  useEffect(() => {
    // Define stage file mappings and next stages
    const stageFileMap = [
      { stage: 'demo', fileId: 'demo-call-transcript', nextStage: 'readiness' },
      { stage: 'readiness', fileId: 'readiness-pdf', nextStage: 'decision' },
      { stage: 'scoping-prep', fileId: 'scoping-prep-doc', nextStage: 'scoping' },
      { stage: 'scoping', fileId: 'scoping-call-transcript', nextStage: 'dev-overview' },
      { stage: 'dev-overview', fileId: 'developer-audio-overview', nextStage: 'workflow-docs' },
      { stage: 'workflow-docs', fileId: 'workflow-description', nextStage: 'sprint-pricing' },
      { stage: 'sprint-pricing', fileId: 'sprint-pricing-estimate', nextStage: 'proposal' },
      { stage: 'internal-client-docs', fileId: 'internal-client-documentation', nextStage: 'ea' },
      { stage: 'kickoff', fileId: 'kickoff-meeting-brief', nextStage: null }
    ]

    stageFileMap.forEach(({ stage, fileId, nextStage }) => {
      // If file is not uploaded and lead stage matches, ensure stage is not completed
      if (leadStage === stage && uploadedFiles && !uploadedFiles[fileId]) {
        setCompletedStages(prev => {
          const newSet = new Set(prev)
          newSet.delete(stage)
          return newSet
        })
        // Also expand current stage and collapse next stage if exists
        setCollapsedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(stage) // Expand current stage
          if (nextStage) {
            newSet.add(nextStage) // Collapse next stage
          }
          return newSet
        })
      }
      // If file is uploaded, ensure stage is completed
      else if (uploadedFiles && uploadedFiles[fileId]) {
        // Add a slight delay to allow upload animation to complete when uploading from documents section
        setTimeout(() => {
          // Capture current completed stages to check
          setCompletedStages(currentCompleted => {
            const newCompleted = new Set(currentCompleted)
            const wasJustCompleted = !currentCompleted.has(stage) // Check if this is a NEW completion
            newCompleted.add(stage)

            // Only update collapsed items if the stage was JUST completed (not already completed)
            if (wasJustCompleted) {
              setCollapsedItems(prev => {
                const newSet = new Set(prev)
                newSet.add(stage) // Collapse current stage
                // Only expand next stage if it hasn't been manually completed yet
                if (nextStage && !newCompleted.has(nextStage)) {
                  newSet.delete(nextStage) // Expand next stage
                }
                return newSet
              })
            }

            return newCompleted
          })

        }, 100) // Small delay to let animation start
      }
    })
  }, [uploadedFiles, leadStage])
  const [anchorSetupLoading, setAnchorSetupLoading] = useState(false)
  const [eaWordingGenerated, setEaWordingGenerated] = useState(false)
  const [eaWordingGenerating, setEaWordingGenerating] = useState(false)
  const [eaConfirmed, setEaConfirmed] = useState(false)
  // Readiness Assessment state
  const [readinessGenerating, setReadinessGenerating] = useState(false)
  // Scoping Call Prep state
  const [scopingPrepGenerating, setScopingPrepGenerating] = useState(false)
  // N8N Workflow Docs state
  const [workflowDocsGenerating, setWorkflowDocsGenerating] = useState(false)
  // Scoping Document state
  const [scopingDocGenerating, setScopingDocGenerating] = useState(false)
  // Kickoff Meeting Agenda state
  const [kickoffAgendaGenerating, setKickoffAgendaGenerating] = useState(false)
  // Project Setup state
  const [clickupTaskCreated, setClickupTaskCreated] = useState(false)
  const [airtableRecordCreated, setAirtableRecordCreated] = useState(false)
  const [airtableRecordLoading, setAirtableRecordLoading] = useState(false)
  const [hubspotDealMoved, setHubspotDealMoved] = useState(false)
  const [setupEmailCopied, setSetupEmailCopied] = useState(false)
  const [setupEmailSent, setSetupEmailSent] = useState(false)
  // Sprint pricing form is always shown for sprint-pricing stage
  const [sprintPricingData, setSprintPricingData] = useState<{
    sprintLength: string
    price: number
    aiExplanation: string
    adjustmentReasoning?: string
  } | null>(null)
  // AI Sprint Pricing state - for polling n8n workflow results
  const [aiSprintEstimatesLoading, setAiSprintEstimatesLoading] = useState(false)
  const [aiSprintEstimatesAvailable, setAiSprintEstimatesAvailable] = useState(false)

  // Load stage data from Supabase on mount
  useEffect(() => {
    const loadStageData = async () => {
      try {
        const stagesToComplete: string[] = []

        // Load decision stage data
        const decisionData = await getStageData(leadId, 'decision', 'decision_made')
        if (decisionData) {
          setDecisionMade(decisionData as string)
          if (decisionData === 'reject') {
            setLeadRejected(true)
          }
          // Mark decision stage as completed
          stagesToComplete.push('decision')
        }

        // Load deal creation status
        const dealCreationStatus = await getStageData(leadId, 'decision', 'deal_created')
        if (dealCreationStatus === true) {
          setDealCreated(true)
        }

        // Load proposal decision stage data
        const proposalDecisionData = await getStageData(leadId, 'proposal-decision', 'decision_made')
        if (proposalDecisionData) {
          if (proposalDecisionData === 'decline') {
            setProposalDeclined(true)
          }
          // Mark proposal-decision stage as completed if a decision was made
          stagesToComplete.push('proposal-decision')
        }

        const proposalAdjusted = await getStageData(leadId, 'proposal-decision', 'was_adjusted')
        if (proposalAdjusted === true) {
          setProposalWasAdjusted(true)
        }

        // Load EA stage data
        const eaWordingGen = await getStageData(leadId, 'ea', 'wording_generated')
        if (eaWordingGen === true) {
          setEaWordingGenerated(true)
        }

        const eaConf = await getStageData(leadId, 'ea', 'confirmed')
        if (eaConf === true) {
          setEaConfirmed(true)
          // Mark EA stage as completed when confirmed
          stagesToComplete.push('ea')
        }

        const anchorSetup = await getStageData(leadId, 'ea', 'anchor_setup_created')
        if (anchorSetup === true) {
          setAnchorSetupCreated(true)
        }

        // Load Setup stage data
        const clickupTask = await getStageData(leadId, 'setup', 'clickup_task_created')
        if (clickupTask === true) {
          setClickupTaskCreated(true)
        }

        const airtableRecord = await getStageData(leadId, 'setup', 'airtable_record_created')
        if (airtableRecord === true) {
          setAirtableRecordCreated(true)
        }

        const hubspotDeal = await getStageData(leadId, 'setup', 'hubspot_deal_moved')
        if (hubspotDeal === true) {
          setHubspotDealMoved(true)
        }

        const emailSent = await getStageData(leadId, 'setup', 'setup_email_sent')
        if (emailSent === true) {
          setSetupEmailSent(true)
          // Mark Setup stage as completed when email is sent
          stagesToComplete.push('setup')
        }

        // Load Sprint Pricing data from dedicated sprint_pricing table
        const sprintPricing = await getSprintPricing(leadId)
        if (sprintPricing) {
          // Check if user has confirmed the estimates (confirmed values exist)
          const hasConfirmedValues = sprintPricing.confirmed_sprint_length && sprintPricing.confirmed_price

          if (hasConfirmedValues) {
            // User has confirmed - use confirmed values and mark stage as completed
            setSprintPricingData({
              sprintLength: sprintPricing.confirmed_sprint_length!,
              price: sprintPricing.confirmed_price!,
              aiExplanation: sprintPricing.ai_explanation || '',
              adjustmentReasoning: sprintPricing.adjustment_reasoning || undefined
            })
            stagesToComplete.push('sprint-pricing')
          } else if (sprintPricing.ai_sprint_length && sprintPricing.ai_price) {
            // AI estimates are available but not yet confirmed by user
            setSprintPricingData({
              sprintLength: sprintPricing.ai_sprint_length,
              price: sprintPricing.ai_price,
              aiExplanation: sprintPricing.ai_explanation || '',
              adjustmentReasoning: undefined
            })
            setAiSprintEstimatesAvailable(true)
            // Do NOT mark as completed - user needs to review and confirm
          }
        }


        // Update completedStages with all stages that should be marked as completed
        if (stagesToComplete.length > 0) {
          setCompletedStages(prev => {
            const newSet = new Set(prev)
            stagesToComplete.forEach(stage => newSet.add(stage))
            return newSet
          })
        }
      } catch (error) {
        console.error("Failed to load stage data from Supabase:", error)
      }
    }

    loadStageData()
  }, [leadId])

  // Poll for AI sprint estimates when workflow-docs stage is completed but sprint pricing not yet available
  useEffect(() => {
    // Only poll if workflow-docs is completed and we don't have AI estimates yet and not already loading
    const shouldPoll = completedStages.has('workflow-docs') && 
                      !completedStages.has('sprint-pricing') &&
                      !aiSprintEstimatesAvailable &&
                      !sprintPricingData // Also check if we don't have pricing data

    if (!shouldPoll) {
      // Reset loading state if we're not polling (data already exists or stage is completed)
      setAiSprintEstimatesLoading(false)
      return
    }

    // Set loading state
    setAiSprintEstimatesLoading(true)

    // Poll every 3 seconds for AI estimates
    const pollInterval = setInterval(async () => {
      try {
        const sprintPricing = await getSprintPricing(leadId)
        if (sprintPricing && sprintPricing.ai_sprint_length && sprintPricing.ai_price) {
          // AI estimates are now available
          setSprintPricingData({
            sprintLength: sprintPricing.ai_sprint_length,
            price: sprintPricing.ai_price,
            aiExplanation: sprintPricing.ai_explanation || '',
            adjustmentReasoning: undefined
          })
          setAiSprintEstimatesAvailable(true)
          setAiSprintEstimatesLoading(false)
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error("Error polling for AI sprint estimates:", error)
      }
    }, 3000) // Poll every 3 seconds

    // Cleanup on unmount or when dependencies change
    return () => clearInterval(pollInterval)
  }, [leadId, completedStages, aiSprintEstimatesAvailable, sprintPricingData])

  const completedCount = completedStages.size
  const totalCount = events.length
  const progressPercentage = (completedCount / totalCount) * 100

  // Update project status to "onboarding-complete" when all stages are completed
  useEffect(() => {
    if (completedCount === totalCount && totalCount > 0 && !leadRejected && !proposalDeclined) {
      updateProjectStatus(leadId, 'onboarding-complete').catch(error => {
        console.error("Failed to update project status to onboarding-complete:", error)
      })
    }
  }, [completedCount, totalCount, leadId, leadRejected, proposalDeclined])



  const handleToggleCollapse = (id: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Create sales pipeline deal via n8n webhook (silent background operation)
  const createSalesPipelineDeal = async (projectId: string) => {
    // Check if deal was already created for this project
    if (dealCreated) {
      console.log('Sales pipeline deal already created for this project, skipping...')
      return
    }

    try {
      const response = await fetch('https://n8n.srv1055749.hstgr.cloud/webhook/create-sales-pipeline-deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create deal: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Sales pipeline deal created successfully:', data)

      // Mark as created in state and save to Supabase
      setDealCreated(true)
      await setStageData(leadId, 'decision', 'deal_created', true)

      return data
    } catch (error) {
      console.error('Error creating sales pipeline deal:', error)
      // Silent failure - don't interrupt user flow
    }
  }

  const handleAction = (eventId: string, action: string) => {
    console.log(`Action triggered: ${action} for event ${eventId}`)

    // Add null/undefined check for action
    if (!action) {
      console.error('Action is undefined or null:', action)
      return
    }

    // Handle reset EA stage (early to avoid string method issues)
    if (eventId === 'ea' && action === 'reset_ea_stage') {
      console.log('Resetting EA stage')

      // Reset all EA related state
      setEaConfirmed(false)
      setEaWordingGenerated(false)
      setEaWordingGenerating(false)
      setAnchorContactCreated(false)
      setAnchorContactLoading(false)
      setAnchorProposalCreated(false)
      setAnchorProposalLoading(false)

      // Reset EA stage to pending
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('ea')
        return newSet
      })

      // Expand the EA stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('ea')
        return newSet
      })

      // Delete all EA stage data from Supabase
      deleteAllStageData(leadId, 'ea').catch(error => {
        console.error("Failed to delete EA stage data from Supabase:", error)
      })

      return
    }

    // Handle reset Setup stage
    if (eventId === 'setup' && action === 'reset_setup_stage') {
      console.log('Resetting Setup stage')

      // Reset all Setup related state
      setClickupTaskCreated(false)
      setAirtableRecordCreated(false)
      setAirtableRecordLoading(false)
      setHubspotDealMoved(false)
      setSetupEmailCopied(false)
      setSetupEmailSent(false)

      // Reset Setup stage to pending
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('setup')
        return newSet
      })

      // Expand the Setup stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('setup')
        return newSet
      })

      // Delete all Setup stage data from Supabase
      deleteAllStageData(leadId, 'setup').catch(error => {
        console.error("Failed to delete Setup stage data from Supabase:", error)
      })

      return
    }

    // Handle scoping decision - show developer selection
    if (action === 'proceed' && eventId === 'decision') {
      setShowDeveloperSelection(true)
      return
    }

    // Handle developer selection
    if (action.startsWith('select_developer_')) {
      const developer = action.replace('select_developer_', '')
      console.log(`Selected developer: ${developer}`)
      setSelectedDeveloper(developer)
      setShowDeveloperSelection(false)
      setShowEmailDraft(true)

      // Create sales pipeline deal via n8n webhook
      createSalesPipelineDeal(leadId)
        .then(() => {
          console.log('Sales pipeline deal created successfully')
        })
        .catch((error) => {
          console.error('Failed to create sales pipeline deal:', error)
          // Continue with the flow even if webhook fails
        })

      return
    }

    // Handle email sent
    if (action === 'email_sent' && eventId === 'decision') {
      setShowEmailDraft(false)
      const decisionValue = `proceed_${selectedDeveloper}`
      setDecisionMade(decisionValue) // Track the decision with developer
      setSelectedDeveloper(null)

      // Save decision to Supabase
      setStageData(leadId, 'decision', 'decision_made', decisionValue).catch(error => {
        console.error("Failed to save decision to Supabase:", error)
      })

      // Trigger scoping call prep generation via n8n webhook
      console.log('Triggering scoping call prep generation workflow')
      setScopingPrepGenerating(true)

      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/scoping-call-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Scoping call prep workflow triggered successfully')
          } else {
            console.error('Failed to trigger scoping call prep workflow:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering scoping call prep workflow:', error)
        })

      // Mark decision stage as completed and advance to scoping
      setCompletedStages(prev => new Set(prev).add('decision'))
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('decision') // Collapse decision stage
        newSet.delete('scoping-prep') // Expand scoping prep stage (now above scoping)
        return newSet
      })
      return
    }

    // Handle rejection - show not a fit email
    if (action === 'reject' && eventId === 'decision') {
      console.log('Lead marked as not a fit - showing email draft')
      setShowNotAFitEmail(true)
      return
    }

    // Handle not a fit email sent
    if (action === 'not_a_fit_email_sent' && eventId === 'decision') {
      console.log('Not a fit email sent - completing decision and marking lead as rejected')
      setShowNotAFitEmail(false)
      setLeadRejected(true)
      setDecisionMade('reject') // Track the rejection decision

      // Save rejection decision to Supabase
      setStageData(leadId, 'decision', 'decision_made', 'reject').catch(error => {
        console.error("Failed to save decision to Supabase:", error)
      })

      // Update project status to "not-a-fit"
      updateProjectStatus(leadId, 'not-a-fit').catch(error => {
        console.error("Failed to update project status:", error)
      })

      setCompletedStages(prev => new Set(prev).add('decision'))
      return
    }

    // Handle restart decision
    if (action === 'restart_decision' && eventId === 'decision') {
      console.log('Restarting decision stage')
      setDecisionMade(null)
      setLeadRejected(false)
      setShowDeveloperSelection(false)
      setShowEmailDraft(false)
      setShowNotAFitEmail(false)
      setSelectedDeveloper(null)
      // Don't reset dealCreated - we want to preserve this across stage resets

      // Reset project status back to active
      updateProjectStatus(leadId, 'active').catch(error => {
        console.error("Failed to reset project status:", error)
      })
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('decision') // Mark as not completed
        return newSet
      })

      // Delete decision stage data from Supabase, but preserve deal_created flag
      deleteAllStageData(leadId, 'decision').catch(error => {
        console.error("Failed to delete decision stage data from Supabase:", error)
      }).then(() => {
        // Re-save the deal_created flag if it was set
        if (dealCreated) {
          setStageData(leadId, 'decision', 'deal_created', true).catch(error => {
            console.error("Failed to preserve deal_created flag:", error)
          })
        }
      })

      return
    }

    // Handle restart proposal decision (must come before general proposal-decision handler)
    if (action === 'restart_proposal_decision' && eventId === 'proposal-decision') {
      console.log('Restarting proposal decision stage - action handler called')
      setProposalDeclined(false)

      // Reset project status back to active
      updateProjectStatus(leadId, 'active').catch(error => {
        console.error("Failed to reset project status:", error)
      })

      // Mark proposal-decision stage as not completed
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal-decision')
        return newSet
      })

      // Expand the proposal-decision stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal-decision') // Expand proposal-decision stage
        return newSet
      })

      // Delete all proposal-decision stage data from Supabase
      deleteAllStageData(leadId, 'proposal-decision').catch(error => {
        console.error("Failed to delete proposal-decision stage data from Supabase:", error)
      })

      return
    }

    // Handle cancel proposal adjustment (must come before general proposal-decision handler)
    if (action === 'cancel_proposal_adjustment' && eventId === 'proposal-decision') {
      console.log('Cancelling proposal adjustment')
      console.log('Current showProposalAdjustment:', showProposalAdjustment)
      setShowProposalAdjustment(false)
      console.log('Set showProposalAdjustment to false')
      // Mark proposal-decision as pending (not completed) since they cancelled the adjustment
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal-decision') // Remove from completed stages
        return newSet
      })
      // Expand the proposal-decision stage to show the decision options again
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal-decision') // Expand proposal-decision stage
        return newSet
      })
      return
    }

    // Handle proposal decision actions
    if (eventId === 'proposal-decision') {
      console.log(`Proposal decision: ${action}`)

      if (action === 'accept') {
        console.log('Proposal accepted - proceeding to Scoping Document')

        // Trigger scoping document generation
        setScopingDocGenerating(true)

        // Trigger EA wording generation
        setEaWordingGenerating(true)

        // Mark proposal-decision stage as completed
        setCompletedStages(prev => new Set(prev).add('proposal-decision'))

        // Save accept decision to Supabase
        setStageData(leadId, 'proposal-decision', 'decision_made', 'accept').catch(error => {
          console.error("Failed to save proposal decision to Supabase:", error)
        })

        // Trigger scoping document generation
        fetch('https://n8n.srv1055749.hstgr.cloud/webhook/2979a880-57bb-4466-8880-7f93f42ccf0f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project_id: leadId
          })
        })
          .then(response => {
            if (response.ok) {
              console.log('Scoping document generation triggered successfully')
            } else {
              console.error('Failed to trigger scoping document generation:', response.statusText)
            }
          })
          .catch(error => {
            console.error('Error triggering scoping document generation:', error)
          })

        // Trigger EA wording generation
        fetch('https://n8n.srv1055749.hstgr.cloud/webhook/47cfbf23-faf9-498a-8f75-39c9d48099e1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project_id: leadId
          })
        })
          .then(response => {
            if (response.ok) {
              console.log('EA wording generation triggered successfully')
            } else {
              console.error('Failed to trigger EA wording generation:', response.statusText)
            }
          })
          .catch(error => {
            console.error('Error triggering EA wording generation:', error)
          })

        // Advance to Scoping Document
        setCollapsedItems(prev => {
          const newSet = new Set(prev)
          newSet.add('proposal-decision') // Collapse proposal-decision stage
          newSet.delete('internal-client-docs') // Expand internal-client-docs stage
          return newSet
        })
      } else if (action === 'decline') {
        console.log('Proposal declined - marking remaining stages as skipped')
        setProposalDeclined(true)

        // Save decline decision to Supabase
        setStageData(leadId, 'proposal-decision', 'decision_made', 'decline').catch(error => {
          console.error("Failed to save proposal decision to Supabase:", error)
        })

        // Update project status to "proposal-declined"
        updateProjectStatus(leadId, 'proposal-declined').catch(error => {
          console.error("Failed to update project status:", error)
        })

        // Send webhook notification for declined proposal
        fetch('https://n8n.srv1055749.hstgr.cloud/webhook/2fcc0371-2393-4a39-9d72-bf7bb802c7b0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project_id: leadId
          })
        }).then(response => {
          if (response.ok) {
            console.log('Webhook notification sent successfully for declined proposal')
          } else {
            console.error('Failed to send webhook notification:', response.status)
          }
        }).catch(error => {
          console.error('Error sending webhook notification:', error)
        })

        // All remaining stages will be marked as skipped in the updatedEvents logic
      } else if (action === 'adjust') {
        console.log('Proposal adjustment requested - showing adjustment form')
        setShowProposalAdjustment(true)
        console.log('Set showProposalAdjustment to true')
        // Don't complete the stage yet - wait for adjustment confirmation
        // Remove the stage from completed stages temporarily
        setCompletedStages(prev => {
          const newSet = new Set(prev)
          newSet.delete('proposal-decision')
          return newSet
        })
      }
      return
    }


    // Handle sprint pricing clear action
    if (eventId === 'sprint-pricing' && action === 'clear_sprint_pricing') {
      console.log('Clearing sprint pricing data - resetting to pending')
      setSprintPricingData(null)

      // Mark sprint-pricing stage as pending
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('sprint-pricing')
        return newSet
      })

      // Expand the sprint-pricing stage and collapse the proposal stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('sprint-pricing') // Expand sprint-pricing stage
        newSet.add('proposal') // Collapse proposal stage
        return newSet
      })

      // Delete sprint pricing data from Supabase (from dedicated sprint_pricing table)
      deleteSprintPricing(leadId).catch(error => {
        console.error("Failed to delete sprint pricing from Supabase:", error)
      })

      return
    }

    // Handle proposal email sent
    if (eventId === 'proposal' && action === 'proposal_email_sent') {
      console.log('Proposal email sent - completing proposal stage')

      // Save to Supabase
      setStageData(leadId, 'proposal', 'email_sent', true).catch(error => {
        console.error("Failed to save proposal email sent to Supabase:", error)
      })

      // Mark proposal stage as completed
      setCompletedStages(prev => new Set(prev).add('proposal'))

      // Collapse the proposal stage and expand the next stage (proposal-decision)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('proposal') // Collapse proposal stage
        newSet.delete('proposal-decision') // Expand proposal-decision stage
        return newSet
      })
      return
    }

    // Handle resend proposal
    if (eventId === 'proposal' && action === 'resend_proposal') {
      console.log('Resending proposal - setting stage back to pending')

      // Mark proposal stage as pending
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal')
        return newSet
      })

      // Expand the proposal stage and collapse the proposal-decision stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal') // Expand proposal stage
        newSet.add('proposal-decision') // Collapse proposal-decision stage
        return newSet
      })
      return
    }

    // Handle view proposal email
    if (eventId === 'proposal' && action === 'view_proposal_email') {
      console.log('Viewing proposal email')

      // Reset to pending to show the email interface again
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal')
        return newSet
      })

      // Expand the proposal stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal')
        return newSet
      })
      return
    }

    // Handle reset proposal stage
    if (eventId === 'proposal' && action === 'reset_proposal_stage') {
      // Reset proposal stage to pending
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal')
        return newSet
      })

      // Expand the proposal stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('proposal')
        return newSet
      })

      return
    }

    // Handle automated action for readiness assessment
    if (action === 'automated' && eventId === 'readiness') {
      console.log('Triggering AI generation for readiness assessment')

      // Set loading state
      setReadinessGenerating(true)

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/readiness-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Readiness assessment workflow triggered successfully')
          } else {
            console.error('Failed to trigger readiness assessment workflow:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering readiness assessment workflow:', error)
        })

      return
    }

    // Handle automated action for scoping call prep
    if (action === 'automated' && eventId === 'scoping-prep') {
      console.log('Triggering AI generation for scoping call prep')

      // Set loading state
      setScopingPrepGenerating(true)

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/scoping-call-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Scoping call prep workflow triggered successfully')
          } else {
            console.error('Failed to trigger scoping call prep workflow:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering scoping call prep workflow:', error)
        })

      return
    }

    // Handle automated action for n8n workflow description
    if (action === 'automated' && eventId === 'workflow-docs') {
      console.log('Triggering AI generation for n8n workflow description')

      // Set loading state
      setWorkflowDocsGenerating(true)

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/generate-n8n-workflow-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('N8N workflow description generation triggered successfully')
          } else {
            console.error('Failed to trigger n8n workflow description generation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering n8n workflow description generation:', error)
        })

      return
    }

    // Handle automated action for scoping document (internal-client-docs)
    if (action === 'automated' && eventId === 'internal-client-docs') {
      console.log('Triggering AI generation for scoping document')

      // Set loading state
      setScopingDocGenerating(true)

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/2979a880-57bb-4466-8880-7f93f42ccf0f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Scoping document generation triggered successfully')
          } else {
            console.error('Failed to trigger scoping document generation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering scoping document generation:', error)
        })

      return
    }

    // Handle automated action for kickoff meeting agenda
    if (action === 'automated' && eventId === 'kickoff') {
      console.log('Triggering AI generation for kickoff meeting agenda')

      // Set loading state
      setKickoffAgendaGenerating(true)

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/kickoff-agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Kickoff meeting agenda generation triggered successfully')
          } else {
            console.error('Failed to trigger kickoff meeting agenda generation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering kickoff meeting agenda generation:', error)
        })

      return
    }

    // Simulate automation delay for demo purposes
    if (action === 'automated') {
      setTimeout(() => {
        console.log(`Automation completed for ${eventId}`)
      }, 2000)
    }

    // Handle engagement agreement actions
    if (eventId === 'ea') {
      console.log('EA handler matched!')
      handleAnchorAction(action)
      return
    }

    // Handle project setup actions
    if (eventId === 'setup') {
      console.log('Setup handler matched!')
      handleAnchorAction(action)
      return
    }
  }

  const handleFileUploaded = (file: UploadedFile) => {
    console.log(`File uploaded: ${file.fileName} for ${file.fileTypeId}`)

    // Handle developer overview special case - trigger workflow docs generation
    // This needs to happen BEFORE early return so it runs even with parent callback
    if (file.fileTypeId === 'developer-audio-overview') {
      console.log('Developer overview uploaded - triggering workflow docs generation')
      setWorkflowDocsGenerating(true)

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/generate-n8n-workflow-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('N8N workflow description generation triggered successfully')
          } else {
            console.error('Failed to trigger n8n workflow description generation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering n8n workflow description generation:', error)
        })
    }

    // Handle scoping document special case - trigger Anchor contact and proposal creation
    // This needs to happen BEFORE early return so it runs even with parent callback
    if (file.fileTypeId === 'internal-client-documentation') {
      console.log('Scoping document uploaded - triggering Anchor contact and proposal draft creation')
      setAnchorSetupCreated(true)

      // Save to Supabase
      setStageData(leadId, 'ea', 'anchor_setup_created', true).catch(error => {
        console.error("Failed to save EA data to Supabase:", error)
      })

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/anchor-contact-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Anchor contact and proposal creation triggered successfully from scoping document upload')
          } else {
            console.error('Failed to trigger Anchor creation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering Anchor creation:', error)
        })
    }

    // Store the uploaded file
    if (onFileUploaded) {
      // Use prop callback if provided - parent will handle all automation logic
      onFileUploaded(file)
      // Don't run Timeline's own automation logic when using parent callback
      return
    } else {
      // Fallback to local state
      setLocalUploadedFiles(prev => ({
        ...prev,
        [file.fileTypeId]: file
      }))
    }

    // Only run Timeline's internal automation logic when using local state (no parent callback)
    // If demo call transcript is uploaded, mark demo stage as completed
    if (file.fileTypeId === 'demo-call-transcript') {
      console.log('Demo call transcript uploaded - marking stage as completed')

      // Mark demo stage as completed
      setCompletedStages(prev => new Set(prev).add('demo'))

      // Collapse the demo stage and expand the next stage (readiness)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('demo') // Collapse demo stage
        newSet.delete('readiness') // Expand readiness stage
        return newSet
      })
    }

    // If readiness assessment is uploaded, mark readiness stage as completed
    if (file.fileTypeId === 'readiness-pdf') {
      console.log('Readiness assessment uploaded - marking stage as completed')

      // Mark readiness stage as completed
      setCompletedStages(prev => new Set(prev).add('readiness'))

      // Collapse the readiness stage and expand the next stage (decision)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('readiness') // Collapse readiness stage
        newSet.delete('decision') // Expand decision stage
        return newSet
      })
    }

    // If scoping prep document is uploaded, mark scoping prep stage as completed
    if (file.fileTypeId === 'scoping-prep-doc') {
      console.log('Scoping prep document uploaded - marking stage as completed')

      // Mark scoping prep stage as completed
      setCompletedStages(prev => new Set(prev).add('scoping-prep'))

      // Collapse the scoping prep stage and expand the next stage (scoping)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('scoping-prep') // Collapse scoping prep stage
        newSet.delete('scoping') // Expand scoping stage
        return newSet
      })
    }

    // If scoping call transcript is uploaded, mark scoping stage as completed
    if (file.fileTypeId === 'scoping-call-transcript') {
      console.log('Scoping call transcript uploaded - marking stage as completed')

      // Mark scoping stage as completed
      setCompletedStages(prev => new Set(prev).add('scoping'))

      // Collapse the scoping stage and expand the next stage (dev-overview)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('scoping') // Collapse scoping stage
        newSet.delete('dev-overview') // Expand dev-overview stage
        return newSet
      })
    }

    // If developer overview is uploaded, mark dev-overview stage as completed
    if (file.fileTypeId === 'developer-audio-overview') {
      console.log('Developer overview uploaded - marking stage as completed')

      // Mark dev-overview stage as completed
      setCompletedStages(prev => new Set(prev).add('dev-overview'))

      // Collapse the dev-overview stage and expand the next stage (workflow-docs)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('dev-overview') // Collapse dev-overview stage
        newSet.delete('workflow-docs') // Expand workflow-docs stage
        return newSet
      })
    }

    // If N8N workflow description is uploaded, mark workflow-docs stage as completed
    if (file.fileTypeId === 'workflow-description') {
      console.log('N8N workflow description uploaded - marking stage as completed')

      // Mark workflow-docs stage as completed
      setCompletedStages(prev => new Set(prev).add('workflow-docs'))

      // Collapse the workflow-docs stage and expand the next stage (sprint-pricing)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('workflow-docs') // Collapse workflow-docs stage
        newSet.delete('sprint-pricing') // Expand sprint-pricing stage
        return newSet
      })
    }

    // If Sprint Length & Price Estimate is uploaded, mark sprint-pricing stage as completed
    if (file.fileTypeId === 'sprint-pricing-estimate') {
      console.log('Sprint Length & Price Estimate uploaded - marking stage as completed')

      // Mark sprint-pricing stage as completed
      setCompletedStages(prev => new Set(prev).add('sprint-pricing'))

      // Collapse the sprint-pricing stage and expand the next stage (proposal)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('sprint-pricing') // Collapse sprint-pricing stage
        newSet.delete('proposal') // Expand proposal stage
        return newSet
      })
    }

    // If Scoping Document is uploaded, mark internal-client-docs stage as completed
    if (file.fileTypeId === 'internal-client-documentation') {
      console.log('Scoping Document uploaded - marking stage as completed')

      // Mark internal-client-docs stage as completed
      setCompletedStages(prev => new Set(prev).add('internal-client-docs'))

      // Collapse the internal-client-docs stage and expand the next stage (ea)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('internal-client-docs') // Collapse internal-client-docs stage
        newSet.delete('ea') // Expand ea stage
        return newSet
      })
    }

    // If Kickoff Meeting Agenda is uploaded, mark kickoff stage as completed
    if (file.fileTypeId === 'kickoff-meeting-brief') {
      console.log('Kickoff Meeting Agenda uploaded - marking stage as completed')

      // Mark kickoff stage as completed
      setCompletedStages(prev => new Set(prev).add('kickoff'))

      // Collapse the kickoff stage (last stage, so no next stage to expand)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('kickoff') // Collapse kickoff stage
        return newSet
      })
    }
  }

  const handleSprintPricingConfirm = (data: {
    sprintLength: string
    price: number
    explanation: string
    initialAiSprintLength?: string
    initialAiPrice?: number
    initialAiExplanation?: string
  }) => {
    console.log('Sprint pricing confirmed:', data)
    
    // Use the AI estimates from sprintPricingData if available (from n8n workflow)
    // Otherwise fallback to the initial values passed from the form
    const aiSprintLength = sprintPricingData?.sprintLength || data.initialAiSprintLength || data.sprintLength
    const aiPrice = sprintPricingData?.price || data.initialAiPrice || data.price
    const aiExplanation = sprintPricingData?.aiExplanation || data.initialAiExplanation || data.explanation
    
    setSprintPricingData({
      sprintLength: data.sprintLength,
      price: data.price,
      aiExplanation: aiExplanation,
      adjustmentReasoning: undefined
    })

    // Save both AI values (from n8n workflow) and confirmed values (what user selected/adjusted)
    confirmSprintPricing(
      leadId,
      aiSprintLength, // AI-generated values from n8n
      aiPrice,
      aiExplanation,
      data.sprintLength, // User-confirmed values (may be same or adjusted from AI)
      data.price
    ).catch(error => {
      console.error("Failed to save sprint pricing to Supabase:", error)
    })

    // Mark sprint-pricing stage as completed
    setCompletedStages(prev => new Set(prev).add('sprint-pricing'))

    // Collapse the sprint-pricing stage and expand the next stage (proposal)
    setCollapsedItems(prev => {
      const newSet = new Set(prev)
      newSet.add('sprint-pricing') // Collapse sprint-pricing stage
      newSet.delete('proposal') // Expand proposal stage
      return newSet
    })
  }

  const handleProposalAdjustmentConfirm = (data: { sprintLength: string; price: number; explanation: string }) => {
    console.log('Proposal adjustment confirmed:', data)

    // Trigger scoping document generation
    setScopingDocGenerating(true)

    // Trigger EA wording generation
    setEaWordingGenerating(true)

    // Keep the original AI explanation and add the adjustment reasoning
    setSprintPricingData(prev => ({
      sprintLength: data.sprintLength,
      price: data.price,
      aiExplanation: prev?.aiExplanation || '', // Preserve original AI explanation
      adjustmentReasoning: data.explanation
    }))
    setShowProposalAdjustment(false)
    setProposalWasAdjusted(true) // Mark that an adjustment was made

    // Save confirmed pricing with adjustment reasoning to Supabase
    // This preserves the original AI explanation and saves the adjustment reasoning separately
    updateConfirmedPricing(
      leadId,
      data.sprintLength,
      data.price,
      data.explanation // This is adjustment reasoning, will be saved to adjustment_reasoning field
    ).catch(error => {
      console.error("Failed to save adjusted sprint pricing to Supabase:", error)
    })

    // Mark proposal-decision stage as completed
    setCompletedStages(prev => new Set(prev).add('proposal-decision'))

    // Save that proposal was adjusted
    setStageData(leadId, 'proposal-decision', 'was_adjusted', true).catch(error => {
      console.error("Failed to save proposal adjustment flag to Supabase:", error)
    })

    // Trigger scoping document generation webhook
    fetch('https://n8n.srv1055749.hstgr.cloud/webhook/2979a880-57bb-4466-8880-7f93f42ccf0f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: leadId
      })
    })
      .then(response => {
        if (response.ok) {
          console.log('Scoping document generation triggered successfully')
        } else {
          console.error('Failed to trigger scoping document generation:', response.statusText)
        }
      })
      .catch(error => {
        console.error('Error triggering scoping document generation:', error)
      })

    // Trigger EA wording generation webhook
    fetch('https://n8n.srv1055749.hstgr.cloud/webhook/47cfbf23-faf9-498a-8f75-39c9d48099e1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: leadId
      })
    })
      .then(response => {
        if (response.ok) {
          console.log('EA wording generation triggered successfully')
        } else {
          console.error('Failed to trigger EA wording generation:', response.statusText)
        }
      })
      .catch(error => {
        console.error('Error triggering EA wording generation:', error)
      })

    // Collapse the proposal-decision stage and expand the next stage (internal-client-docs)
    setCollapsedItems(prev => {
      const newSet = new Set(prev)
      newSet.add('proposal-decision') // Collapse proposal-decision stage
      newSet.delete('internal-client-docs') // Expand internal-client-docs stage
      return newSet
    })
  }

  // Handle anchor actions
  const handleAnchorAction = (action: string) => {
    if (action === 'create_anchor_setup') {
      console.log('Triggering Anchor contact and proposal draft creation')

      // Immediately set to created (no loading animation)
      setAnchorSetupCreated(true)
      console.log('Contact and Proposal draft created in Anchor')

      // Save to Supabase - using single combined field
      setStageData(leadId, 'ea', 'anchor_setup_created', true).catch(error => {
        console.error("Failed to save EA data to Supabase:", error)
      })

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/anchor-contact-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Anchor contact and proposal creation triggered successfully')
          } else {
            console.error('Failed to trigger Anchor creation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering Anchor creation:', error)
        })
    } else if (action === 'generate_ea_wording') {
      console.log('Triggering AI generation for EA wording')

      // Set loading state
      setEaWordingGenerating(true)

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/47cfbf23-faf9-498a-8f75-39c9d48099e1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('EA wording generation triggered successfully')
          } else {
            console.error('Failed to trigger EA wording generation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering EA wording generation:', error)
        })
    } else if (action === 'confirm_ea_completed') {
      setEaConfirmed(true)
      console.log('EA confirmed as completed and sent to customer')

      // Save to Supabase
      setStageData(leadId, 'ea', 'confirmed', true).catch(error => {
        console.error("Failed to save EA data to Supabase:", error)
      })

      // Mark the engagement agreement stage as completed
      setCompletedStages(prev => new Set(prev).add('ea'))

      // Automatically mark Airtable record as created
      setAirtableRecordCreated(true)

      // Trigger Airtable record creation via n8n webhook
      console.log('Triggering Airtable record creation for EA completion')
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/create-airtable-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Airtable record creation triggered successfully')

            // Save to Supabase
            setStageData(leadId, 'setup', 'airtable_record_created', true).catch(error => {
              console.error("Failed to save Setup data to Supabase:", error)
            })
          } else {
            console.error('Failed to trigger Airtable record creation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering Airtable record creation:', error)
        })

      // Automatically move HubSpot deal to Closed Won
      console.log('Triggering HubSpot deal move to Closed Won for EA completion')
      setHubspotDealMoved(true)

      // Save to Supabase
      setStageData(leadId, 'setup', 'hubspot_deal_moved', true).catch(error => {
        console.error("Failed to save HubSpot deal moved data to Supabase:", error)
      })

      // Trigger HubSpot move webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/move-closed-won', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('HubSpot deal move to Closed Won triggered successfully')
          } else {
            console.error('Failed to trigger HubSpot deal move:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering HubSpot deal move:', error)
        })

      // Collapse the EA stage and expand the next stage (setup)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('ea') // Collapse EA stage
        newSet.delete('setup') // Expand setup stage (next stage after EA)
        return newSet
      })
    } else if (action === 'create_clickup_task') {
      setClickupTaskCreated(true)
      console.log('ClickUp task created')

      // Save to Supabase
      setStageData(leadId, 'setup', 'clickup_task_created', true).catch(error => {
        console.error("Failed to save Setup data to Supabase:", error)
      })
    } else if (action === 'create_airtable_record') {
      // Immediately mark as created (no loading state)
      setAirtableRecordCreated(true)
      console.log('Creating Airtable CRM & Inventory record')

      // Send POST request to n8n webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/create-airtable-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Airtable inventory record created successfully')

            // Save to Supabase
            setStageData(leadId, 'setup', 'airtable_record_created', true).catch(error => {
              console.error("Failed to save Setup data to Supabase:", error)
            })
          } else {
            console.error('Failed to create Airtable record:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error creating Airtable record:', error)
        })
    } else if (action === 'move_hubspot_deal') {
      console.log('move_hubspot_deal action triggered')

      // Immediately set moved state (no loading animation)
      setHubspotDealMoved(true)
      console.log('HubSpot deal moved to Closed Won')

      // Save to Supabase
      setStageData(leadId, 'setup', 'hubspot_deal_moved', true).catch(error => {
        console.error("Failed to save HubSpot deal moved data to Supabase:", error)
      })

      // Trigger HubSpot move webhook
      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/move-closed-won', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('HubSpot deal move to Closed Won triggered successfully')
          } else {
            console.error('Failed to trigger HubSpot deal move:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering HubSpot deal move:', error)
        })
    } else if (action === 'copy_setup_email') {
      const emailContent = `Subject: Project Kickoff - Let's Get Started!

Hi there!

Great news! We're ready to kick off your automation project. Our team has completed all the initial setup and we're excited to get started.

## Project Overview
Your automation project is now set up and ready to begin development. We've created your project workspace and assigned your dedicated developer.

## Your Point of Contact
**Developer:** [Developer Name]
**Title:** [Developer Title]
**Specialty:** [Developer Specialty]

## Next Steps
Let's schedule your project kickoff meeting to:
• Review the project scope and timeline
• Introduce your development team
• Answer any questions you might have
• Set up regular check-in meetings

**Schedule your kickoff meeting:** [Booking Link]

We're looking forward to working with you and delivering an amazing automation solution!

Best regards,
The GrowthLab Team`

      navigator.clipboard.writeText(emailContent)
      setSetupEmailCopied(true)
      setTimeout(() => setSetupEmailCopied(false), 2000)
      console.log('Setup email copied to clipboard')
    } else if (action === 'setup_email_sent') {
      setSetupEmailSent(true)
      console.log('Setup kickoff email sent to client')

      // Save to Supabase
      setStageData(leadId, 'setup', 'setup_email_sent', true).catch(error => {
        console.error("Failed to save Setup data to Supabase:", error)
      })

      // Mark the project setup stage as completed
      setCompletedStages(prev => new Set(prev).add('setup'))

      // Collapse the setup stage and expand the next stage (kickoff)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('setup') // Collapse setup stage
        newSet.delete('kickoff') // Expand kickoff stage
        return newSet
      })

      // Trigger kickoff agenda generation
      console.log('Triggering AI generation for kickoff meeting agenda after setup completion')
      setKickoffAgendaGenerating(true)

      fetch('https://n8n.srv1055749.hstgr.cloud/webhook/kickoff-agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: leadId
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Kickoff meeting agenda generation triggered successfully from setup stage')
          } else {
            console.error('Failed to trigger kickoff meeting agenda generation:', response.statusText)
          }
        })
        .catch(error => {
          console.error('Error triggering kickoff meeting agenda generation:', error)
        })
    }
  }

  const handleFileCleared = (fileTypeId: string) => {
    console.log(`File cleared: ${fileTypeId}`)

    // Remove the specific uploaded file from state
    if (onFileCleared) {
      // Use prop callback if provided
      onFileCleared(fileTypeId)
    } else {
      // Fallback to local state
      setLocalUploadedFiles(prev => {
        const updated = { ...prev }
        delete updated[fileTypeId]
        return updated
      })
    }

    // If demo call transcript is cleared, mark demo stage as pending
    if (fileTypeId === 'demo-call-transcript') {
      console.log('Demo call transcript cleared - marking stage as pending')

      // Remove demo stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('demo')
        return newSet
      })

      // Expand the demo stage and collapse the readiness stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('demo') // Expand demo stage
        newSet.add('readiness') // Collapse readiness stage
        return newSet
      })
    }

    // If readiness assessment is cleared, mark readiness stage as pending
    if (fileTypeId === 'readiness-pdf') {
      console.log('Readiness assessment cleared - marking stage as pending')

      // Remove readiness stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('readiness')
        return newSet
      })

      // Expand the readiness stage and collapse the decision stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('readiness') // Expand readiness stage
        newSet.add('decision') // Collapse decision stage
        return newSet
      })
    }

    // If scoping prep document is cleared, mark scoping prep stage as pending
    if (fileTypeId === 'scoping-prep-doc') {
      console.log('Scoping prep document cleared - marking stage as pending')

      // Remove scoping prep stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping-prep')
        return newSet
      })

      // Expand the scoping prep stage and collapse the scoping stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping-prep') // Expand scoping prep stage
        newSet.add('scoping') // Collapse scoping stage
        return newSet
      })
    }

    // If scoping call transcript is cleared, mark scoping stage as pending
    if (fileTypeId === 'scoping-call-transcript') {
      console.log('Scoping call transcript cleared - marking stage as pending')

      // Remove scoping stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping')
        return newSet
      })

      // Expand the scoping stage and collapse the dev-overview stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping') // Expand scoping stage
        newSet.add('dev-overview') // Collapse dev-overview stage
        return newSet
      })
    }

    // If developer overview is cleared, mark dev-overview stage as pending
    if (fileTypeId === 'developer-audio-overview') {
      console.log('Developer overview cleared - marking stage as pending')

      // Remove dev-overview stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('dev-overview')
        return newSet
      })

      // Expand the dev-overview stage and collapse the workflow-docs stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('dev-overview') // Expand dev-overview stage
        newSet.add('workflow-docs') // Collapse workflow-docs stage
        return newSet
      })
    }

    // If N8N workflow description is cleared, mark workflow-docs stage as pending
    if (fileTypeId === 'workflow-description') {
      console.log('N8N workflow description cleared - marking stage as pending')

      // Remove workflow-docs stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('workflow-docs')
        return newSet
      })

      // Expand the workflow-docs stage and collapse the sprint-pricing stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('workflow-docs') // Expand workflow-docs stage
        newSet.add('sprint-pricing') // Collapse sprint-pricing stage
        return newSet
      })
    }

    // If Sprint Length & Price Estimate is cleared, mark sprint-pricing stage as pending
    if (fileTypeId === 'sprint-pricing-estimate') {
      console.log('Sprint Length & Price Estimate cleared - marking stage as pending')

      // Remove sprint-pricing stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('sprint-pricing')
        return newSet
      })

      // Expand the sprint-pricing stage and collapse the proposal stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('sprint-pricing') // Expand sprint-pricing stage
        newSet.add('proposal') // Collapse proposal stage
        return newSet
      })
    }

    // If Scoping Document is cleared, mark internal-client-docs stage as pending
    if (fileTypeId === 'internal-client-documentation') {
      console.log('Scoping Document cleared - marking stage as pending')

      // Remove internal-client-docs stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('internal-client-docs')
        return newSet
      })

      // Expand the internal-client-docs stage and collapse the ea stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('internal-client-docs') // Expand internal-client-docs stage
        newSet.add('ea') // Collapse ea stage
        return newSet
      })
    }

    // If Kickoff Meeting Agenda is cleared, mark kickoff stage as pending
    if (fileTypeId === 'kickoff-meeting-brief') {
      console.log('Kickoff Meeting Agenda cleared - marking stage as pending')

      // Remove kickoff stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('kickoff')
        return newSet
      })

      // Expand the kickoff stage (since it's the last stage)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('kickoff') // Expand kickoff stage
        return newSet
      })
    }
  }

  // Update events with current collapse and completion state
  const updatedEvents = events.map(event => {
    // If lead is rejected and this is a stage after decision, mark as not applicable
    if (leadRejected && event.id !== "demo" && event.id !== "readiness" && event.id !== "decision") {
      return {
        ...event,
        isCollapsed: true,
        status: "skipped" as const,
        description: "Not applicable - Lead marked as not a fit"
      }
    }

    // If proposal is declined and this is a stage after proposal-decision, mark as not applicable
    if (proposalDeclined && event.id !== "demo" && event.id !== "readiness" && event.id !== "decision" &&
        event.id !== "scoping-prep" && event.id !== "scoping" && event.id !== "dev-overview" &&
        event.id !== "workflow-docs" && event.id !== "sprint-pricing" && event.id !== "proposal" &&
        event.id !== "proposal-decision") {
      return {
        ...event,
        isCollapsed: true,
        status: "skipped" as const,
        description: "Not applicable - Proposal declined by client"
      }
    }

    return {
      ...event,
      isCollapsed: collapsedItems.has(event.id),
      status: completedStages.has(event.id) ? "completed" as const : (event.status === "completed" ? "pending" as const : event.status)
    }
  })

  // Sync lead's current stage with timeline progress
  useEffect(() => {
    const currentStage = determineCurrentStage(updatedEvents)
    const lead = getLeadById(leadId)

    if (lead && lead.stage !== currentStage) {
      updateLead(leadId, { stage: currentStage as Lead["stage"] })
    }
  }, [leadId, updatedEvents])

  // Poll for readiness assessment file when generating
  useEffect(() => {
    if (!readinessGenerating) return

    console.log('Starting polling for readiness assessment file...')

    const checkForFile = async () => {
      try {
        const file = await getFileByType(leadId, 'readiness-pdf')
        if (file) {
          console.log('Readiness assessment file detected:', file)
          setReadinessGenerating(false)

          // Trigger file uploaded callback to update UI
          if (onFileUploaded) {
            const uploadedFile: UploadedFile = {
              id: file.id,
              fileTypeId: 'readiness-pdf',
              fileName: file.file_name,
              uploadDate: file.uploaded_at,
              fileSize: file.file_size,
              uploadedBy: file.uploaded_by,
              storagePath: file.storage_path
            }
            onFileUploaded(uploadedFile)
          }
        }
      } catch (error) {
        console.error('Error checking for readiness file:', error)
      }
    }

    // Check immediately
    checkForFile()

    // Then poll every 5 seconds
    const interval = setInterval(checkForFile, 5000)

    // Cleanup on unmount or when generating stops
    return () => {
      console.log('Stopping readiness assessment polling')
      clearInterval(interval)
    }
  }, [readinessGenerating, leadId, onFileUploaded])

  // Poll for scoping prep file when generating
  useEffect(() => {
    if (!scopingPrepGenerating) return

    console.log('Starting polling for scoping prep file...')

    const checkForFile = async () => {
      try {
        const file = await getFileByType(leadId, 'scoping-prep-doc')
        if (file) {
          console.log('Scoping prep file detected:', file)
          setScopingPrepGenerating(false)

          // Trigger file uploaded callback to update UI
          if (onFileUploaded) {
            const uploadedFile: UploadedFile = {
              id: file.id,
              fileTypeId: 'scoping-prep-doc',
              fileName: file.file_name,
              uploadDate: file.uploaded_at,
              fileSize: file.file_size,
              uploadedBy: file.uploaded_by,
              storagePath: file.storage_path
            }
            onFileUploaded(uploadedFile)
          }
        }
      } catch (error) {
        console.error('Error checking for scoping prep file:', error)
      }
    }

    // Check immediately
    checkForFile()

    // Then poll every 5 seconds
    const interval = setInterval(checkForFile, 5000)

    // Cleanup on unmount or when generating stops
    return () => {
      console.log('Stopping scoping prep polling')
      clearInterval(interval)
    }
  }, [scopingPrepGenerating, leadId, onFileUploaded])

  // Poll for workflow docs file when generating
  useEffect(() => {
    if (!workflowDocsGenerating) return

    console.log('Starting polling for workflow docs file...')

    const checkForFile = async () => {
      try {
        const file = await getFileByType(leadId, 'workflow-description')
        if (file) {
          console.log('Workflow docs file detected:', file)
          setWorkflowDocsGenerating(false)

          // Trigger file uploaded callback to update UI
          if (onFileUploaded) {
            const uploadedFile: UploadedFile = {
              id: file.id,
              fileTypeId: 'workflow-description',
              fileName: file.file_name,
              uploadDate: file.uploaded_at,
              fileSize: file.file_size,
              uploadedBy: file.uploaded_by,
              storagePath: file.storage_path
            }
            onFileUploaded(uploadedFile)
          }
        }
      } catch (error) {
        console.error('Error checking for workflow docs file:', error)
      }
    }

    // Check immediately
    checkForFile()

    // Then poll every 5 seconds
    const interval = setInterval(checkForFile, 5000)

    // Cleanup on unmount or when generating stops
    return () => {
      console.log('Stopping workflow docs polling')
      clearInterval(interval)
    }
  }, [workflowDocsGenerating, leadId, onFileUploaded])

  // Poll for scoping document file when generating
  useEffect(() => {
    if (!scopingDocGenerating) return

    console.log('Starting polling for scoping document file...')

    const checkForFile = async () => {
      try {
        const file = await getFileByType(leadId, 'internal-client-documentation')
        if (file) {
          console.log('Scoping document file detected:', file)
          setScopingDocGenerating(false)

          // Trigger file uploaded callback to update UI
          if (onFileUploaded) {
            const uploadedFile: UploadedFile = {
              id: file.id,
              fileTypeId: 'internal-client-documentation',
              fileName: file.file_name,
              uploadDate: file.uploaded_at,
              fileSize: file.file_size,
              uploadedBy: file.uploaded_by,
              storagePath: file.storage_path
            }
            onFileUploaded(uploadedFile)
          }
        }
      } catch (error) {
        console.error('Error checking for scoping document file:', error)
      }
    }

    // Check immediately
    checkForFile()

    // Then poll every 5 seconds
    const interval = setInterval(checkForFile, 5000)

    // Cleanup on unmount or when generating stops
    return () => {
      console.log('Stopping scoping document polling')
      clearInterval(interval)
    }
  }, [scopingDocGenerating, leadId, onFileUploaded])

  // Poll for EA wording file when generating
  useEffect(() => {
    if (!eaWordingGenerating) return

    console.log('Starting polling for EA wording file...')

    const checkForFile = async () => {
      try {
        const file = await getFileByType(leadId, 'ea-wording')
        if (file) {
          console.log('EA wording file detected:', file)
          setEaWordingGenerating(false)

          // Trigger file uploaded callback to update UI
          if (onFileUploaded) {
            const uploadedFile: UploadedFile = {
              id: file.id,
              fileTypeId: 'ea-wording',
              fileName: file.file_name,
              uploadDate: file.uploaded_at,
              fileSize: file.file_size,
              uploadedBy: file.uploaded_by,
              storagePath: file.storage_path
            }
            onFileUploaded(uploadedFile)
          }
        }
      } catch (error) {
        console.error('Error checking for EA wording file:', error)
      }
    }

    // Check immediately
    checkForFile()

    // Then poll every 5 seconds
    const interval = setInterval(checkForFile, 5000)

    // Cleanup on unmount or when generating stops
    return () => {
      console.log('Stopping EA wording polling')
      clearInterval(interval)
    }
  }, [eaWordingGenerating, leadId, onFileUploaded])

  // Poll for kickoff meeting agenda file when generating
  useEffect(() => {
    if (!kickoffAgendaGenerating) return

    console.log('Starting polling for kickoff meeting agenda file...')

    const checkForFile = async () => {
      try {
        const file = await getFileByType(leadId, 'kickoff-meeting-brief')
        if (file) {
          console.log('Kickoff meeting agenda file detected:', file)
          setKickoffAgendaGenerating(false)

          // Trigger file uploaded callback to update UI
          if (onFileUploaded) {
            const uploadedFile: UploadedFile = {
              id: file.id,
              fileTypeId: 'kickoff-meeting-brief',
              fileName: file.file_name,
              uploadDate: file.uploaded_at,
              fileSize: file.file_size,
              uploadedBy: file.uploaded_by,
              storagePath: file.storage_path
            }
            onFileUploaded(uploadedFile)
          }
        }
      } catch (error) {
        console.error('Error checking for kickoff meeting agenda file:', error)
      }
    }

    // Check immediately
    checkForFile()

    // Then poll every 5 seconds
    const interval = setInterval(checkForFile, 5000)

    // Cleanup on unmount or when generating stops
    return () => {
      console.log('Stopping kickoff meeting agenda polling')
      clearInterval(interval)
    }
  }, [kickoffAgendaGenerating, leadId, onFileUploaded])

  return hideHeader ? (
    // When hideHeader is true, return just the content without Card wrapper
    <div className="space-y-8 p-6">
        <div className="space-y-8">
          {updatedEvents.map((event, index) => {
            // Determine which file to show based on the event type
            let existingFile = undefined
            if (event.type === "demo") {
              existingFile = uploadedFiles['demo-call-transcript']
            } else if (event.type === "readiness") {
              existingFile = uploadedFiles['readiness-pdf']
            } else if (event.type === "scoping-prep") {
              existingFile = uploadedFiles['scoping-prep-doc']
            } else if (event.type === "scoping") {
              existingFile = uploadedFiles['scoping-call-transcript']
            } else if (event.type === "dev-overview") {
              existingFile = uploadedFiles['developer-audio-overview']
            } else if (event.type === "workflow-docs") {
              existingFile = uploadedFiles['workflow-description']
            } else if (event.type === "sprint-pricing") {
              existingFile = uploadedFiles['sprint-pricing-estimate']
            } else if (event.type === "internal-client-docs") {
              existingFile = uploadedFiles['internal-client-documentation']
            } else if (event.type === "ea") {
              existingFile = uploadedFiles['ea-wording']
            } else if (event.type === "kickoff") {
              existingFile = uploadedFiles['kickoff-meeting-brief']
            }

            return (
              <StageCard
                key={event.id}
                event={event}
                index={index}
                isLast={index === updatedEvents.length - 1}
                nextEvent={updatedEvents[index + 1]}
                onToggleCollapse={handleToggleCollapse}
                onAction={handleAction}
                onFileUploaded={handleFileUploaded}
                onFileCleared={handleFileCleared}
                existingFile={existingFile}
                showDeveloperSelection={event.id === "decision" ? showDeveloperSelection : false}
                showEmailDraft={event.id === "decision" ? showEmailDraft : false}
                selectedDeveloper={selectedDeveloper}
                showNotAFitEmail={event.id === "decision" ? showNotAFitEmail : false}
                decisionMade={decisionMade}
                onSprintPricingConfirm={event.id === "sprint-pricing" ? handleSprintPricingConfirm : undefined}
                sprintPricingData={(event.id === "sprint-pricing" || event.id === "proposal" || event.id === "proposal-decision") ? sprintPricingData : null}
                proposalDeclined={event.id === "proposal-decision" ? proposalDeclined : false}
                showProposalAdjustment={event.id === "proposal-decision" ? showProposalAdjustment : false}
                proposalWasAdjusted={event.id === "proposal-decision" ? proposalWasAdjusted : false}
                onProposalAdjustmentConfirm={event.id === "proposal-decision" ? handleProposalAdjustmentConfirm : undefined}
                anchorSetupCreated={event.id === "ea" ? anchorSetupCreated : false}
                anchorSetupLoading={event.id === "ea" ? anchorSetupLoading : false}
                eaWordingGenerated={event.id === "ea" ? eaWordingGenerated : false}
                eaWordingGenerating={event.id === "ea" ? eaWordingGenerating : false}
                eaConfirmed={event.id === "ea" ? eaConfirmed : false}
                readinessGenerating={event.id === "readiness" ? readinessGenerating : false}
                scopingPrepGenerating={event.id === "scoping-prep" ? scopingPrepGenerating : false}
                workflowDocsGenerating={event.id === "workflow-docs" ? workflowDocsGenerating : false}
                scopingDocGenerating={event.id === "internal-client-docs" ? scopingDocGenerating : false}
                kickoffAgendaGenerating={event.id === "kickoff" ? kickoffAgendaGenerating : false}
                clickupTaskCreated={event.id === "setup" ? clickupTaskCreated : false}
                airtableRecordCreated={event.id === "setup" ? airtableRecordCreated : false}
                airtableRecordLoading={event.id === "setup" ? airtableRecordLoading : false}
                hubspotDealMoved={event.id === "setup" ? hubspotDealMoved : false}
                setupEmailCopied={event.id === "setup" ? setupEmailCopied : false}
                setupEmailSent={event.id === "setup" ? setupEmailSent : false}
                aiSprintEstimatesLoading={event.id === "sprint-pricing" ? aiSprintEstimatesLoading : false}
                aiSprintEstimatesAvailable={event.id === "sprint-pricing" ? aiSprintEstimatesAvailable : false}
                completionDate={completionDates[event.id]}
              />
            )
          })}
        </div>
    </div>
  ) : (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Onboarding Timeline</CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} completed
          </div>
        </div>
        <ProgressBar percentage={progressPercentage} />

        {/* Automation Level Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#C8E4BB]/20 text-[#5A8A4A] border border-[#C8E4BB]/40">
              <Zap className="w-4 h-4" /> Automated
            </span>
            <span className="text-xs text-muted-foreground">7 stages</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <User className="w-4 h-4 mr-1" /> Manual
            </span>
            <span className="text-xs text-muted-foreground">7 stages</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {updatedEvents.map((event, index) => {
            // Determine which file to show based on the event type
            let existingFile = undefined
            if (event.type === "demo") {
              existingFile = uploadedFiles['demo-call-transcript']
            } else if (event.type === "readiness") {
              existingFile = uploadedFiles['readiness-pdf']
            } else if (event.type === "scoping-prep") {
              existingFile = uploadedFiles['scoping-prep-doc']
            } else if (event.type === "scoping") {
              existingFile = uploadedFiles['scoping-call-transcript']
            } else if (event.type === "dev-overview") {
              existingFile = uploadedFiles['developer-audio-overview']
            } else if (event.type === "workflow-docs") {
              existingFile = uploadedFiles['workflow-description']
            } else if (event.type === "sprint-pricing") {
              existingFile = uploadedFiles['sprint-pricing-estimate']
            } else if (event.type === "internal-client-docs") {
              existingFile = uploadedFiles['internal-client-documentation']
            } else if (event.type === "ea") {
              existingFile = uploadedFiles['ea-wording']
            } else if (event.type === "kickoff") {
              existingFile = uploadedFiles['kickoff-meeting-brief']
            }

            return (
              <StageCard
                key={event.id}
                event={event}
                index={index}
                isLast={index === updatedEvents.length - 1}
                nextEvent={updatedEvents[index + 1]}
                onToggleCollapse={handleToggleCollapse}
                onAction={handleAction}
                onFileUploaded={handleFileUploaded}
                onFileCleared={handleFileCleared}
                existingFile={existingFile}
                showDeveloperSelection={event.id === "dev-overview" && showDeveloperSelection}
                showEmailDraft={event.id === "decision" && decisionMade === "reject"}
                selectedDeveloper={selectedDeveloper}
                showNotAFitEmail={event.id === "decision" && decisionMade === "reject"}
                decisionMade={event.id === "decision" ? decisionMade : undefined}
                onSprintPricingConfirm={event.id === "sprint-pricing" ? handleSprintPricingConfirm : undefined}
                sprintPricingData={event.id === "sprint-pricing" ? sprintPricingData : undefined}
                proposalDeclined={event.id === "proposal-decision" ? proposalDeclined : false}
                showProposalAdjustment={event.id === "proposal-decision" ? showProposalAdjustment : false}
                proposalWasAdjusted={event.id === "proposal-decision" ? proposalWasAdjusted : false}
                onProposalAdjustmentConfirm={event.id === "proposal-decision" ? handleProposalAdjustmentConfirm : undefined}
                anchorSetupCreated={event.id === "ea" ? anchorSetupCreated : false}
                anchorSetupLoading={event.id === "ea" ? anchorSetupLoading : false}
                eaWordingGenerated={event.id === "ea" ? eaWordingGenerated : false}
                eaWordingGenerating={event.id === "ea" ? eaWordingGenerating : false}
                eaConfirmed={event.id === "ea" ? eaConfirmed : false}
                readinessGenerating={event.id === "readiness" ? readinessGenerating : false}
                scopingPrepGenerating={event.id === "scoping-prep" ? scopingPrepGenerating : false}
                workflowDocsGenerating={event.id === "workflow-docs" ? workflowDocsGenerating : false}
                scopingDocGenerating={event.id === "internal-client-docs" ? scopingDocGenerating : false}
                kickoffAgendaGenerating={event.id === "kickoff" ? kickoffAgendaGenerating : false}
                clickupTaskCreated={event.id === "setup" ? clickupTaskCreated : false}
                airtableRecordCreated={event.id === "setup" ? airtableRecordCreated : false}
                airtableRecordLoading={event.id === "setup" ? airtableRecordLoading : false}
                hubspotDealMoved={event.id === "setup" ? hubspotDealMoved : false}
                setupEmailCopied={event.id === "setup" ? setupEmailCopied : false}
                setupEmailSent={event.id === "setup" ? setupEmailSent : false}
                aiSprintEstimatesLoading={event.id === "sprint-pricing" ? aiSprintEstimatesLoading : false}
                aiSprintEstimatesAvailable={event.id === "sprint-pricing" ? aiSprintEstimatesAvailable : false}
                completionDate={completionDates[event.id]}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}