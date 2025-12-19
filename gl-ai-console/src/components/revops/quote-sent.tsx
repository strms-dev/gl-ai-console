"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  QuoteSentStageData,
  QuoteLineItem
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Send,
  Mail,
  Pencil,
  Eye,
  X,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  RotateCw,
  UserMinus,
  UserPlus,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QuoteSentProps {
  emailData: QuoteSentStageData
  quoteLineItems: QuoteLineItem[]
  companyName: string
  contactEmail: string
  totalMonthly: number
  hubspotQuoteLink: string | null
  onInitialize: (subject: string, body: string) => void
  onUpdate: (subject: string, body: string) => void
  onSendViaHubspot: () => void
  onEnrollInSequence: () => void
  onUnenrollFromSequence: () => void
  onRecordResponse: (responseType: "approved" | "declined") => void
}

// Quote email template
function generateQuoteEmailTemplate(
  contactName: string,
  companyName: string,
  lineItems: QuoteLineItem[],
  totalMonthly: number,
  hubspotQuoteLink: string | null
): { subject: string; body: string } {
  const servicesList = lineItems
    .map(item => `- ${item.service}: $${item.monthlyPrice.toLocaleString()}/mo`)
    .join("\n")

  const quoteLink = hubspotQuoteLink || "[HubSpot Quote Link]"

  return {
    subject: `Growth Lab Quote for ${companyName} - $${totalMonthly.toLocaleString()}/mo`,
    body: `Hi ${contactName || "there"},

Thank you for the opportunity to work with ${companyName}. Based on our review of your accounting needs, I'm pleased to share our proposed pricing:

${servicesList}

Total Monthly Investment: $${totalMonthly.toLocaleString()}/mo

You can view the full quote and accept it here:
${quoteLink}

This quote reflects our understanding of your current requirements. If you have any questions or would like to discuss adjustments, please don't hesitate to reach out.

I look forward to hearing from you!

Best regards,
Tim`
  }
}

export function QuoteSent({
  emailData,
  quoteLineItems,
  companyName,
  contactEmail,
  totalMonthly,
  hubspotQuoteLink,
  onInitialize,
  onUpdate,
  onSendViaHubspot,
  onEnrollInSequence,
  onUnenrollFromSequence,
  onRecordResponse
}: QuoteSentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Track initialization
  const hasInitialized = useRef(false)

  // Initialize email template when component mounts
  useEffect(() => {
    if (!emailData.emailSubject && !hasInitialized.current) {
      hasInitialized.current = true

      const contactName = contactEmail.split("@")[0] || "there"
      const template = generateQuoteEmailTemplate(
        contactName,
        companyName,
        quoteLineItems,
        totalMonthly,
        hubspotQuoteLink
      )
      onInitialize(template.subject, template.body)
    }
  }, [emailData.emailSubject, companyName, quoteLineItems, totalMonthly, contactEmail, hubspotQuoteLink, onInitialize])

  const handleStartEdit = () => {
    setEditSubject(emailData.emailSubject)
    setEditBody(emailData.emailBody)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    onUpdate(editSubject, editBody)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditSubject(emailData.emailSubject)
    setEditBody(emailData.emailBody)
    setIsEditing(false)
  }

  const handleSendViaHubspot = () => {
    setIsSending(true)
    // Simulate API call delay
    setTimeout(() => {
      onSendViaHubspot()
      setIsSending(false)
    }, 1500)
  }

  const isSent = !!emailData.sentAt
  const hasResponse = !!emailData.prospectRespondedAt
  const isEnrolledInSequence = emailData.followUpSequenceStarted

  // Calculate days until auto-enrollment or next follow-up
  const daysUntilAutoEnroll = emailData.nextFollowUpAt
    ? Math.max(0, Math.ceil((new Date(emailData.nextFollowUpAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 3

  // If prospect has responded (approved or declined)
  if (hasResponse) {
    const isApproved = emailData.responseType === "approved"

    return (
      <div className={`mt-4 p-4 border rounded-lg ${isApproved ? "border-[#C8E4BB] bg-[#C8E4BB]/10" : "border-red-200 bg-red-50"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isApproved ? (
              <ThumbsUp className="w-5 h-5 text-[#5A8A4A]" />
            ) : (
              <ThumbsDown className="w-5 h-5 text-red-500" />
            )}
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {isApproved ? "Quote Accepted" : "Quote Declined"}
            </h4>
          </div>
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

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Quote sent on {new Date(emailData.sentAt!).toLocaleDateString()}
          </p>
          <p>
            Response received on {new Date(emailData.prospectRespondedAt!).toLocaleDateString()}
          </p>
        </div>

        {!isApproved && (
          <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">Deal moved to Closed Lost</p>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Remaining pipeline stages are no longer applicable.
            </p>
          </div>
        )}

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Sent Quote Email
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium mt-1">{emailData.emailSubject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Body</Label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {emailData.emailBody}
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

  // If email has been sent, show sent state with sequence enrollment and response options
  if (isSent) {
    return (
      <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Quote Sent via HubSpot
            </h4>
          </div>
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

        <div className="text-sm text-muted-foreground mb-4">
          <p>
            Sent to <strong>{emailData.sentTo}</strong> on{" "}
            {new Date(emailData.sentAt!).toLocaleDateString()} at{" "}
            {new Date(emailData.sentAt!).toLocaleTimeString()}
          </p>
          {hubspotQuoteLink && (
            <a
              href={hubspotQuoteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#407B9D] hover:underline mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              View Quote in HubSpot
            </a>
          )}
        </div>

        {/* HubSpot Sequence Enrollment Section */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h5 className="text-sm font-medium mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            HubSpot Follow-Up Sequence
          </h5>

          {isEnrolledInSequence ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Enrolled in sequence ({emailData.followUpCount} reminder{emailData.followUpCount !== 1 ? "s" : ""} sent)
                </span>
              </div>
              {emailData.nextFollowUpAt && (
                <p className="text-xs text-muted-foreground">
                  Next follow-up: {new Date(emailData.nextFollowUpAt).toLocaleDateString()}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onUnenrollFromSequence}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Unenroll from Sequence
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Contact will be automatically enrolled in {daysUntilAutoEnroll} business day{daysUntilAutoEnroll !== 1 ? "s" : ""} if no response.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onEnrollInSequence}
                className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Enroll Now
              </Button>
            </div>
          )}
        </div>

        {/* Response Buttons */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Record Prospect Response
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onRecordResponse("approved")}
              className="flex-1 bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Quote Accepted
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onRecordResponse("declined")}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Quote Declined
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Accepting moves to engagement preparation. Declining moves deal to Closed Lost.
          </p>
        </div>

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Sent Quote Email
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium mt-1">{emailData.emailSubject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Body</Label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {emailData.emailBody}
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

  // If no email subject yet (loading state)
  if (!emailData.emailSubject) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Mail className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Preparing Quote Email...
          </h4>
          <p className="text-sm text-muted-foreground">
            Loading the quote email template.
          </p>
        </div>
      </div>
    )
  }

  // Show email template for review/edit before sending
  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Send Quote via HubSpot
          </h4>
          {emailData.isEdited && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <Pencil className="w-3 h-3 mr-1" />
              Edited
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        {isEditing
          ? "Edit the email content below and save your changes."
          : "Review the quote email and send via HubSpot."
        }
      </p>

      {/* HubSpot Quote Link Preview */}
      {hubspotQuoteLink && (
        <div className="mb-4 p-3 bg-[#407B9D]/5 border border-[#407B9D]/20 rounded-lg">
          <div className="flex items-center gap-2 text-[#407B9D]">
            <ExternalLink className="w-4 h-4" />
            <a
              href={hubspotQuoteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              View HubSpot Quote
            </a>
          </div>
        </div>
      )}

      {isEditing ? (
        // Edit mode
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailSubject">Subject</Label>
            <Input
              id="emailSubject"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailBody">Email Body</Label>
            <Textarea
              id="emailBody"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="text-gray-600 border-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        // Preview mode
        <div className="space-y-4">
          {/* Email Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <p className="text-sm">
                <span className="text-muted-foreground">To:</span>{" "}
                <span className="font-medium">{contactEmail || "prospect@company.com"}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Subject:</span>{" "}
                <span className="font-medium">{emailData.emailSubject}</span>
              </p>
            </div>
            <div className="p-4 bg-white max-h-[300px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-[#463939]">
                {emailData.emailBody}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleStartEdit}
              className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Email
            </Button>
            <Button
              onClick={handleSendViaHubspot}
              disabled={isSending}
              className="bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              {isSending ? (
                <>
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send via HubSpot
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
