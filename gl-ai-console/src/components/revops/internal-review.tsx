"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  InternalReviewStageData,
  SalesIntakeFormData,
  INTERNAL_ASSIGNMENT_EMAIL,
  TIM_SCULLION_EMAIL
} from "@/lib/sales-pipeline-timeline-types"
import {
  getActiveRecipients,
  ManagedRecipient
} from "@/lib/internal-recipients-store"
import { ManageTeamModal } from "./manage-team-modal"
import {
  CheckCircle2,
  Users,
  Send,
  Pencil,
  Eye,
  X,
  Settings,
  Loader2,
  Mail,
  ExternalLink,
  ClipboardCopy
} from "lucide-react"
import { getGLReviewFormUrl } from "@/lib/sales-pipeline-timeline-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Hardcoded automation email - cannot be changed
const AUTOMATION_FROM_EMAIL = "automation@growthlabfinancial.com"

interface InternalReviewProps {
  reviewData: InternalReviewStageData
  salesIntakeData: SalesIntakeFormData | null
  accessPlatform: "qbo" | "xero" | "other" | null
  dealId: string
  onInitialize: (recipients: { name: string; email: string }[], ccTimEnabled: boolean, subject: string, body: string) => void
  onUpdate: (recipients: { name: string; email: string }[], ccTimEnabled: boolean, subject: string, body: string) => void
  onSend: () => Promise<{ success: boolean; error?: string }>
}

export function InternalReview({
  reviewData,
  salesIntakeData,
  accessPlatform,
  onInitialize,
  onUpdate,
  onSend,
}: InternalReviewProps) {
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<{ name: string; email: string }[]>([])
  const [ccTimEnabled, setCcTimEnabled] = useState(true)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showManageTeamModal, setShowManageTeamModal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [qboAccessConfirmed, setQboAccessConfirmed] = useState(false)
  const [glFormLinkCopied, setGlFormLinkCopied] = useState(false)

  // Available recipients loaded from Supabase
  const [availableRecipients, setAvailableRecipients] = useState<ManagedRecipient[]>([])
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true)

  // Use ref to track if we've already initialized to prevent infinite loops
  const hasInitialized = useRef(false)

  // Load available recipients from Supabase
  useEffect(() => {
    const loadRecipients = async () => {
      setIsLoadingRecipients(true)
      const recipients = await getActiveRecipients()
      setAvailableRecipients(recipients)
      setIsLoadingRecipients(false)
    }
    loadRecipients()
  }, [])

  // Generate the platform and company string for the email template
  const getPlatformAndCompany = () => {
    const platformNames: Record<string, string> = {
      qbo: "QBO",
      xero: "Xero",
      other: "Other"
    }
    const platform = platformNames[accessPlatform || "other"]
    const companyName = salesIntakeData?.companyName || "Unknown Company"
    return `${platform}/${companyName}`
  }

  // Initialize email template when component mounts
  useEffect(() => {
    // Only initialize once when we have salesIntakeData and no email body yet
    if (!reviewData.emailBody && salesIntakeData && !hasInitialized.current) {
      hasInitialized.current = true

      console.log("Initializing internal review email with new template")

      // Get template and replace placeholders
      const template = INTERNAL_ASSIGNMENT_EMAIL
      const companyName = salesIntakeData.companyName || "Unknown Company"

      const subject = template.subject.replace(/\{\{companyName\}\}/g, companyName)
      const body = template.bodyTemplate.replace(/\{\{platformAndCompany\}\}/g, getPlatformAndCompany())

      // Initialize with empty recipients and CC Tim enabled by default
      onInitialize([], true, subject, body)
    }

    // Reset the flag if email body is cleared (for re-initialization)
    if (!reviewData.emailBody) {
      hasInitialized.current = false
    }
  }, [reviewData.emailBody, salesIntakeData, accessPlatform, onInitialize])

  // Sync local state with reviewData when it changes
  useEffect(() => {
    if (reviewData.emailSubject) {
      setEmailSubject(reviewData.emailSubject)
    }
    if (reviewData.emailBody) {
      setEmailBody(reviewData.emailBody)
    }
    if (reviewData.recipients) {
      setSelectedRecipients(reviewData.recipients)
    }
    // Sync ccTimEnabled - default to true if undefined
    setCcTimEnabled(reviewData.ccTimEnabled !== false)
  }, [reviewData.emailSubject, reviewData.emailBody, reviewData.recipients, reviewData.ccTimEnabled])

  // Note: Recipients now default to empty (nobody assigned) - users must manually select

  const handleToggleRecipient = (recipient: { name: string; email: string }) => {
    setSelectedRecipients(prev => {
      const exists = prev.some(r => r.email === recipient.email)
      let newRecipients: { name: string; email: string }[]
      if (exists) {
        newRecipients = prev.filter(r => r.email !== recipient.email)
      } else {
        newRecipients = [...prev, recipient]
      }
      // Update the store
      onUpdate(newRecipients, ccTimEnabled, emailSubject, emailBody)
      return newRecipients
    })
  }

  const handleToggleCcTim = () => {
    const newValue = !ccTimEnabled
    setCcTimEnabled(newValue)
    // Update the store
    onUpdate(selectedRecipients, newValue, emailSubject, emailBody)
  }

  const handleSaveEmailEdit = () => {
    onUpdate(selectedRecipients, ccTimEnabled, emailSubject, emailBody)
    setIsEditingEmail(false)
  }

  const handleCancelEmailEdit = () => {
    setEmailSubject(reviewData.emailSubject || "")
    setEmailBody(reviewData.emailBody || "")
    setIsEditingEmail(false)
  }

  const handleSend = async () => {
    setIsSending(true)
    setSendError(null)

    try {
      const result = await onSend()
      if (!result.success) {
        setSendError(result.error || "Failed to send email")
      }
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  const handleRecipientsUpdated = async () => {
    // Reload recipients from Supabase
    const recipients = await getActiveRecipients()
    setAvailableRecipients(recipients)

    // Keep only those that are still active
    const stillActiveSelected = selectedRecipients.filter(
      sr => recipients.some(ar => ar.email === sr.email)
    )
    if (stillActiveSelected.length !== selectedRecipients.length) {
      setSelectedRecipients(stillActiveSelected)
      onUpdate(stillActiveSelected, ccTimEnabled, emailSubject, emailBody)
    }
  }

  const isSent = !!reviewData.sentAt

  // If email has been sent, show completed state
  if (isSent) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Internal Team Notified
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
              className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Email
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Sent on {reviewData.sentAt ? new Date(reviewData.sentAt).toLocaleDateString() : ""} at{" "}
            {reviewData.sentAt ? new Date(reviewData.sentAt).toLocaleTimeString() : ""}
          </p>
          <p className="mt-1">
            From: {AUTOMATION_FROM_EMAIL}
          </p>
          <p className="mt-1">
            Assigned to: {reviewData.recipients.map(r => r.name).join(", ")}
          </p>
          {reviewData.ccTimEnabled && (
            <p className="mt-1">
              CC: {TIM_SCULLION_EMAIL}
            </p>
          )}
        </div>

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Sent Email
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">From</Label>
                <p className="font-medium mt-1">{AUTOMATION_FROM_EMAIL}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">To</Label>
                <p className="font-medium mt-1">
                  {reviewData.recipients.map(r => `${r.name} <${r.email}>`).join(", ")}
                </p>
              </div>
              {reviewData.ccTimEnabled && (
                <div>
                  <Label className="text-muted-foreground">CC</Label>
                  <p className="font-medium mt-1">{TIM_SCULLION_EMAIL}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium mt-1">{reviewData.emailSubject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Body</Label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {reviewData.emailBody}
                  </pre>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // If email template not yet initialized (loading state)
  if (!reviewData.emailBody) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Preparing Internal Assignment...
          </h4>
          <p className="text-sm text-muted-foreground">
            Loading the internal team assignment email template.
          </p>
        </div>
      </div>
    )
  }

  // Show email template for review
  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Internal Team Assignment
          </h4>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        Select team members to assign and review the email before sending.
      </p>

      {/* Recipients Selection - Always visible toggle pills like prepare-engagement */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Assign To</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManageTeamModal(true)}
            className="h-6 text-xs text-[#407B9D] hover:bg-[#407B9D]/10"
          >
            <Settings className="w-3 h-3 mr-1" />
            Manage Team
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoadingRecipients ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading team members...
            </div>
          ) : availableRecipients.length > 0 ? (
            availableRecipients.map((recipient) => {
              const isSelected = selectedRecipients.some(r => r.email === recipient.email)
              return (
                <button
                  key={recipient.email}
                  onClick={() => handleToggleRecipient(recipient)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isSelected
                      ? "bg-[#407B9D] text-white border-[#407B9D]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#407B9D]"
                  }`}
                >
                  <Users className="w-3 h-3 mr-1.5" />
                  {recipient.name}
                </button>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No team members configured. Click &quot;Manage Team&quot; to add members.
            </p>
          )}
        </div>
        {selectedRecipients.length === 0 && availableRecipients.length > 0 && (
          <p className="text-xs text-amber-600 mt-2">
            Select at least one team member to assign this client to
          </p>
        )}
      </div>

      {/* CC Tim Scullion Toggle */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">CC Tim Scullion</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {TIM_SCULLION_EMAIL}
            </p>
          </div>
          <button
            onClick={handleToggleCcTim}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              ccTimEnabled ? "bg-[#407B9D]" : "bg-gray-300"
            }`}
            aria-label={ccTimEnabled ? "Disable CC Tim" : "Enable CC Tim"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                ccTimEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {ccTimEnabled
            ? "Tim will be CC'd on this email"
            : "Tim will not be CC'd on this email"}
        </p>
      </div>

      {/* Email Content */}
      {isEditingEmail ? (
        <div className="space-y-3 mb-4">
          <div>
            <Label htmlFor="emailSubject" className="text-sm">Subject</Label>
            <Input
              id="emailSubject"
              value={emailSubject || ""}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="emailBody" className="text-sm">Email Body</Label>
            <Textarea
              id="emailBody"
              value={emailBody || ""}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={10}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEmailEdit}
              className="h-8"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEmailEdit}
              className="h-8 bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden mb-4">
          <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs flex items-center gap-1">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">From:</span>{" "}
                <span className="font-medium text-gray-500">{AUTOMATION_FROM_EMAIL}</span>
              </p>
              <p className="text-xs">
                <span className="text-muted-foreground">To:</span>{" "}
                <span className={selectedRecipients.length === 0 ? "text-amber-600 italic" : "font-medium"}>
                  {selectedRecipients.length === 0
                    ? "No recipient selected"
                    : selectedRecipients.map(r => r.email).join(", ")}
                </span>
              </p>
              <p className="text-xs">
                <span className="text-muted-foreground">CC:</span>{" "}
                <span className="font-medium">
                  {ccTimEnabled ? TIM_SCULLION_EMAIL : "--"}
                </span>
              </p>
              <p className="text-xs">
                <span className="text-muted-foreground">Subject:</span>{" "}
                <span className="font-medium">{emailSubject}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingEmail(true)}
              className="h-6 text-xs text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="p-3 bg-white max-h-[200px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-xs text-[#463939]">
              {emailBody}
            </pre>
          </div>
        </div>
      )}

      {/* GL Review Google Form Link */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-sm font-medium text-blue-800 mb-2">
          GL Review Form for Team
        </h5>
        <p className="text-xs text-blue-700 mb-3">
          Share this link with the assigned team member to submit their GL Review.
          The deal ID is pre-filled in the form.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded border border-blue-200 p-2 text-xs font-mono text-gray-600 truncate">
            {getGLReviewFormUrl(dealId)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(getGLReviewFormUrl(dealId))
              setGlFormLinkCopied(true)
              setTimeout(() => setGlFormLinkCopied(false), 2000)
            }}
            className="h-8 text-xs text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {glFormLinkCopied ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardCopy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          <a
            href={getGLReviewFormUrl(dealId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-8 px-3 text-xs text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </a>
        </div>
      </div>

      {/* QBO Access Confirmation Checkbox */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={qboAccessConfirmed}
            onChange={(e) => setQboAccessConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#407B9D] focus:ring-[#407B9D] cursor-pointer"
          />
          <div>
            <span className="text-sm font-medium text-amber-800">
              I confirm that I have manually given QBO access to the selected team members
            </span>
            <p className="text-xs text-amber-600 mt-1">
              This must be checked before sending the internal assignment email.
            </p>
          </div>
        </label>
      </div>

      {/* Error Display */}
      {sendError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{sendError}</p>
        </div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={selectedRecipients.length === 0 || isSending || !qboAccessConfirmed}
        className="w-full bg-[#407B9D] hover:bg-[#366a88] text-white disabled:opacity-50"
      >
        {isSending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Internal Assignment
          </>
        )}
      </Button>

      {/* Manage Team Modal */}
      <ManageTeamModal
        isOpen={showManageTeamModal}
        onClose={() => setShowManageTeamModal(false)}
        onRecipientsUpdated={handleRecipientsUpdated}
      />
    </div>
  )
}
