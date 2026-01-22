"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  InternalEngagementReviewStageData
} from "@/lib/sales-pipeline-timeline-types"
import {
  getActiveRecipients
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
  ArrowRight
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EAInternalReviewProps {
  reviewData: InternalEngagementReviewStageData
  companyName: string
  totalMonthly: number
  walkthroughText: string
  onInitialize: (recipients: { name: string; email: string }[]) => void
  onUpdateEmail: (subject: string, body: string) => void
  onSendReview: () => void
  onMarkReadyToSend: () => void
}

// Generate internal review email template
function generateInternalReviewEmail(
  companyName: string,
  totalMonthly: number,
  walkthroughText: string
): { subject: string; body: string } {
  return {
    subject: `Engagement Review Required: ${companyName} - $${totalMonthly.toLocaleString()}/mo`,
    body: `Hi team,

An engagement walkthrough has been prepared for ${companyName} and is ready for internal review before sending to the customer.

Client Details:
- Company: ${companyName}
- Deal Value: $${totalMonthly.toLocaleString()}/mo

Please review the walkthrough below and confirm:
1. Services and pricing are accurate
2. Terms are appropriate for this client
3. Any special considerations are noted

WALKTHROUGH DOCUMENT:
---
${walkthroughText}
---

Reply to this email with any feedback or changes needed. Once approved, we will send the engagement agreement to the customer for signature.

Thanks,
Tim`
  }
}

export function EAInternalReview({
  reviewData,
  companyName,
  totalMonthly,
  walkthroughText,
  onInitialize,
  onUpdateEmail,
  onSendReview,
  onMarkReadyToSend
}: EAInternalReviewProps) {
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<{ name: string; email: string }[]>([])
  const [availableRecipients, setAvailableRecipients] = useState<{ name: string; email: string }[]>([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showManageTeamModal, setShowManageTeamModal] = useState(false)

  // Use ref to track if we've already initialized
  const hasInitialized = useRef(false)

  // Load available recipients on mount
  useEffect(() => {
    const loadRecipients = async () => {
      const recipients = await getActiveRecipients()
      setAvailableRecipients(recipients)
    }
    loadRecipients()
  }, [])

  // Initialize email template when component mounts
  useEffect(() => {
    const initializeEmail = async () => {
      if (!reviewData.emailBody && walkthroughText && !hasInitialized.current) {
        hasInitialized.current = true

        console.log("Initializing EA Internal Review email")

        // Generate email template
        const { subject, body } = generateInternalReviewEmail(
          companyName,
          totalMonthly,
          walkthroughText
        )

        setEmailSubject(subject)
        setEmailBody(body)

        // Get default recipients (async)
        const activeRecipients = await getActiveRecipients()
        setSelectedRecipients(activeRecipients)

        // Initialize in store
        onInitialize(activeRecipients)
      }
    }

    initializeEmail()

    // Reset the flag if email body is cleared
    if (!reviewData.emailBody) {
      hasInitialized.current = false
    }
  }, [reviewData.emailBody, walkthroughText, companyName, totalMonthly, onInitialize])

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
  }, [reviewData.emailSubject, reviewData.emailBody, reviewData.recipients])

  const handleToggleRecipient = (recipient: { name: string; email: string }) => {
    setSelectedRecipients(prev => {
      const exists = prev.some(r => r.email === recipient.email)
      if (exists) {
        return prev.filter(r => r.email !== recipient.email)
      } else {
        return [...prev, recipient]
      }
    })
  }

  const handleSaveEmailEdit = () => {
    onUpdateEmail(emailSubject, emailBody)
    setIsEditingEmail(false)
  }

  const handleCancelEmailEdit = () => {
    setEmailSubject(reviewData.emailSubject || "")
    setEmailBody(reviewData.emailBody || "")
    setIsEditingEmail(false)
  }

  const isSent = !!reviewData.sentAt
  const isReadyToSend = !!reviewData.readyToSendAt

  // If ready to send, show completed state
  if (isReadyToSend) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Send to Customer
          </h4>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Internal review completed. Engagement is ready to be sent to {companyName}.
          </p>
          {reviewData.readyToSendAt && (
            <p className="mt-1 text-[#5A8A4A]">
              Approved on {new Date(reviewData.readyToSendAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    )
  }

  // If email template not yet initialized
  if (!reviewData.emailBody && !emailBody) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Preparing Internal Review...
          </h4>
          <p className="text-sm text-muted-foreground">
            Loading the internal review email template.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            EA Internal Review
          </h4>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        Send the engagement walkthrough to the internal team for review before sending to {companyName}.
      </p>

      {/* Step 1: Send for Review */}
      <div className={`mb-4 p-4 rounded-lg border ${isSent ? "bg-[#C8E4BB]/10 border-[#C8E4BB]" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            {isSent && <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />}
            Step 1: Send for Internal Review
          </h5>
          {isSent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
              className="h-6 text-xs text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Sent Email
            </Button>
          )}
        </div>

        {isSent ? (
          <p className="text-xs text-[#5A8A4A]">
            Review email sent on {new Date(reviewData.sentAt!).toLocaleDateString()} to {reviewData.recipients.map(r => r.name).join(", ")}
          </p>
        ) : (
          <>
            {/* Recipients Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Review By</Label>
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
                {availableRecipients.map((recipient) => {
                  const isSelected = selectedRecipients.some(r => r.email === recipient.email)
                  return (
                    <button
                      key={recipient.email}
                      onClick={() => handleToggleRecipient(recipient)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs border transition-colors ${
                        isSelected
                          ? "bg-[#407B9D] text-white border-[#407B9D]"
                          : "bg-white text-gray-600 border-gray-300 hover:border-[#407B9D]"
                      }`}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {recipient.name}
                    </button>
                  )
                })}
                {availableRecipients.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No team members configured.
                  </p>
                )}
              </div>
            </div>

            {/* Email Content */}
            {isEditingEmail ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reviewSubject" className="text-xs">Subject</Label>
                  <Input
                    id="reviewSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reviewBody" className="text-xs">Email Body</Label>
                  <Textarea
                    id="reviewBody"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={10}
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEmailEdit}
                    className="h-7"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEmailEdit}
                    className="h-7 bg-[#407B9D] hover:bg-[#366a88] text-white"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden mb-3">
                <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Subject:</span> {emailSubject}
                  </p>
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
                <div className="p-3 bg-white max-h-[150px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-[#463939]">
                    {emailBody}
                  </pre>
                </div>
              </div>
            )}

            <Button
              onClick={onSendReview}
              disabled={selectedRecipients.length === 0}
              className="w-full bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send for Internal Review
            </Button>
          </>
        )}
      </div>

      {/* Step 2: Mark Ready to Send */}
      {isSent && (
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
              Step 2: Confirm Ready to Send to Customer
            </h5>
            <Button
              onClick={onMarkReadyToSend}
              className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Ready to Send
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
              Sent Review Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Recipients</Label>
              <p className="font-medium mt-1">
                {reviewData.recipients.map(r => `${r.name} <${r.email}>`).join(", ")}
              </p>
            </div>
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

      {/* Manage Team Modal */}
      <ManageTeamModal
        isOpen={showManageTeamModal}
        onClose={() => setShowManageTeamModal(false)}
        onRecipientsUpdated={async () => {
          // Refresh recipients
          const activeRecipients = await getActiveRecipients()
          setAvailableRecipients(activeRecipients)
          const stillActiveSelected = selectedRecipients.filter(
            sr => activeRecipients.some(ar => ar.email === sr.email)
          )
          setSelectedRecipients(stillActiveSelected)
        }}
      />
    </div>
  )
}
