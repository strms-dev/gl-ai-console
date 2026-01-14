"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FollowUpEmailStageData,
  SalesIntakeFormData,
  FOLLOW_UP_EMAIL_TEMPLATES
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Mail,
  Pencil,
  Eye,
  X,
  RotateCw,
  Loader2,
  Copy,
  ExternalLink,
  Check
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// n8n webhook URL for moving deal to Need Info stage
const MOVE_DEAL_WEBHOOK_URL = "https://n8n.srv1055749.hstgr.cloud/webhook/revops-follow-up-email"

interface FollowUpEmailProps {
  emailData: FollowUpEmailStageData
  salesIntakeData: SalesIntakeFormData | null
  dealId: string
  hsDealUrl: string | null
  onInitialize: (templateType: "qbo" | "xero" | "other", toEmail: string, ccEmail: string, subject: string, body: string) => void
  onUpdate: (toEmail: string, ccEmail: string, subject: string, body: string) => void
  onSend: () => void
  onMoveHubspotDeal: () => void
  onReset: () => void
}

export function FollowUpEmail({
  emailData,
  salesIntakeData,
  dealId,
  hsDealUrl,
  onInitialize,
  onUpdate,
  onSend,
  onMoveHubspotDeal,
  onReset,
}: FollowUpEmailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editToEmail, setEditToEmail] = useState("")
  const [editCcEmail, setEditCcEmail] = useState("")
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  // Use ref to track if we've already initialized to prevent infinite loops
  const hasInitialized = useRef(false)

  // Initialize email template when component mounts or when accounting platform changes
  useEffect(() => {
    // Only initialize once when we have salesIntakeData and no template yet
    if (!emailData.templateType && salesIntakeData && !hasInitialized.current) {
      hasInitialized.current = true

      const platform = salesIntakeData.accountingPlatform
      let templateType: "qbo" | "xero" | "other" = "other"

      if (platform === "qbo") {
        templateType = "qbo"
      } else if (platform === "xero") {
        templateType = "xero"
      } else {
        templateType = "other"
      }

      console.log("Initializing follow-up email with platform:", platform, "-> template:", templateType)

      // Get template and replace placeholders
      const template = FOLLOW_UP_EMAIL_TEMPLATES[templateType === "other" ? "reports" : templateType]

      // Replace placeholders in subject
      const subject = template.subject
        .replace(/\{\{companyName\}\}/g, salesIntakeData.companyName || "Your Company")

      // Replace placeholders in body
      const firefliesHtml = salesIntakeData.firefliesVideoLink
        ? `<a href="${salesIntakeData.firefliesVideoLink}" target="_blank" rel="noopener noreferrer">Fireflies Meeting Recap</a>`
        : "Fireflies Meeting Recap"

      let body = template.bodyTemplate
        .replace(/\{\{contactName\}\}/g, salesIntakeData.contactName || "there")
        .replace(/\{\{companyName\}\}/g, salesIntakeData.companyName || "your company")
        .replace(/\{\{callRecap\}\}/g, getCallRecap(salesIntakeData))
        .replace(/\{\{firefliesLink\}\}/g, firefliesHtml)

      // For older templates that don't use {{firefliesLink}}, add Fireflies link if available
      if (salesIntakeData.firefliesVideoLink && body.includes("Based on our conversation, I wanted to recap the key points we discussed:")) {
        body = body.replace(
          "Based on our conversation, I wanted to recap the key points we discussed:",
          `Based on our conversation, I wanted to recap the key points we discussed:\n\nDemo Call Recording: ${salesIntakeData.firefliesVideoLink}`
        )
      }

      // Set initial recipient email from sales intake data
      const toEmail = salesIntakeData.emailAddress || ""
      const ccEmail = ""  // CC starts empty by default

      // Call onInitialize with try/catch to handle Supabase errors gracefully
      const initEmail = async () => {
        try {
          await onInitialize(templateType, toEmail, ccEmail, subject, body)
        } catch (error) {
          console.error("Failed to initialize follow-up email:", error)
          // Reset the flag so user can retry
          hasInitialized.current = false
        }
      }
      initEmail()
    }

    // Reset the flag if template is cleared (for re-initialization)
    if (!emailData.templateType) {
      hasInitialized.current = false
    }
  }, [emailData.templateType, salesIntakeData, onInitialize])

  // Generate a simple call recap from sales intake data
  function getCallRecap(data: SalesIntakeFormData): string {
    const items: string[] = []

    if (data.accountingPlatform) {
      const platformNames: Record<string, string> = {
        qbo: "QuickBooks Online",
        xero: "Xero",
        other: "Other accounting platform"
      }
      items.push(`- Accounting Platform: ${platformNames[data.accountingPlatform] || data.accountingPlatform}`)
    }

    if (data.employeeCount) {
      items.push(`- Employee Count: ${data.employeeCount}`)
    }

    if (data.payrollProvider) {
      const providerNames: Record<string, string> = {
        gusto: "Gusto",
        adp: "ADP",
        paychex: "Paychex",
        rippling: "Rippling",
        justworks: "Justworks",
        paycor: "Paycor",
        zenefits: "Zenefits",
        onpay: "OnPay",
        other: "Other"
      }
      items.push(`- Payroll Provider: ${providerNames[data.payrollProvider] || data.payrollProvider}`)
    }

    if (data.needsBillPaySupport === "yes") {
      items.push("- Interested in Bill Pay Support")
    }

    if (data.needsInvoicingSupport === "yes") {
      items.push("- Interested in Invoicing Support")
    }

    if (data.interestedInCfoReview === "yes") {
      items.push("- Interested in Quarterly CFO Review")
    }

    return items.length > 0 ? items.join("\n") : "- Key service requirements discussed on call"
  }

  // Convert HTML to plain text for clipboard
  function htmlToPlainText(html: string): string {
    // Create a temporary element to parse HTML
    const temp = document.createElement("div")
    temp.innerHTML = html

    // Replace <br> and </p> with newlines
    temp.innerHTML = temp.innerHTML.replace(/<br\s*\/?>/gi, "\n")
    temp.innerHTML = temp.innerHTML.replace(/<\/p>/gi, "\n\n")

    // Replace list items with bullet points
    temp.innerHTML = temp.innerHTML.replace(/<li>/gi, "• ")
    temp.innerHTML = temp.innerHTML.replace(/<\/li>/gi, "\n")

    // Get text content
    let text = temp.textContent || temp.innerText || ""

    // Clean up multiple newlines
    text = text.replace(/\n{3,}/g, "\n\n")

    return text.trim()
  }

  const handleStartEdit = () => {
    setEditToEmail(emailData.toEmail || salesIntakeData?.emailAddress || "")
    setEditCcEmail(emailData.ccEmail || "")
    setEditSubject(emailData.emailSubject)
    setEditBody(emailData.emailBody)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    onUpdate(editToEmail, editCcEmail, editSubject, editBody)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditToEmail(emailData.toEmail || salesIntakeData?.emailAddress || "")
    setEditCcEmail(emailData.ccEmail || "")
    setEditSubject(emailData.emailSubject)
    setEditBody(emailData.emailBody)
    setIsEditing(false)
  }

  // Copy all email details to clipboard
  const handleCopyAll = async () => {
    const toEmail = emailData.toEmail || salesIntakeData?.emailAddress || ""
    const ccEmail = emailData.ccEmail || ""
    const subject = emailData.emailSubject
    const bodyPlainText = htmlToPlainText(emailData.emailBody)

    const clipboardText = `To: ${toEmail}
${ccEmail ? `CC: ${ccEmail}` : "CC:"}
Subject: ${subject}

${bodyPlainText}`

    try {
      await navigator.clipboard.writeText(clipboardText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  // Open HubSpot deal in new tab
  const handleOpenHubspot = () => {
    if (hsDealUrl) {
      window.open(hsDealUrl, "_blank", "noopener,noreferrer")
    }
  }

  // Confirm email sent and move deal to Need Info
  const handleConfirmSent = async () => {
    setIsConfirming(true)
    setConfirmError(null)

    try {
      const response = await fetch(MOVE_DEAL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal_id: dealId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to move deal in HubSpot")
      }

      // Success - call the callbacks to update state
      onMoveHubspotDeal()
      onSend()

    } catch (error) {
      console.error("Error confirming email sent:", error)
      setConfirmError(error instanceof Error ? error.message : "Failed to move deal. Please try again.")
    } finally {
      setIsConfirming(false)
    }
  }

  const isSent = !!emailData.sentAt
  const isDealMoved = emailData.hubspotDealMoved

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
              Email Sent &amp; Deal Moved
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
            {hsDealUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenHubspot}
                className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View in HubSpot
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              <RotateCw className="w-4 h-4 mr-1" />
              Reset Stage
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Confirmed on {emailData.sentAt ? new Date(emailData.sentAt).toLocaleDateString() : ""} at{" "}
            {emailData.sentAt ? new Date(emailData.sentAt).toLocaleTimeString() : ""}
          </p>
          {isDealMoved && (
            <p className="mt-1 text-[#5A8A4A]">
              HubSpot deal moved to SQL - Need Info
            </p>
          )}
        </div>

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Email Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">To</Label>
                <p className="font-medium mt-1">{emailData.toEmail || salesIntakeData?.emailAddress || ""}</p>
              </div>
              {emailData.ccEmail && (
                <div>
                  <Label className="text-muted-foreground">CC</Label>
                  <p className="font-medium mt-1">{emailData.ccEmail}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium mt-1">{emailData.emailSubject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Body</Label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                  <div
                    className="whitespace-pre-wrap font-sans text-sm [&_a]:text-[#407B9D] [&_a]:underline [&_a]:hover:text-[#366a88] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:whitespace-normal [&_li]:ml-2"
                    dangerouslySetInnerHTML={{ __html: emailData.emailBody }}
                  />
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

  // If no template yet (loading state)
  if (!emailData.templateType) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Mail className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Preparing Email Template...
          </h4>
          <p className="text-sm text-muted-foreground">
            Loading the follow-up email template based on accounting platform selection.
          </p>
        </div>
      </div>
    )
  }

  // Show 3-step email workflow
  return (
    <div className="mt-4 space-y-4">
      {/* STEP 1: Review & Edit Email */}
      <div className="border border-[#407B9D]/30 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#407B9D]/5 px-4 py-2 border-b border-[#407B9D]/20">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#407B9D] text-white text-xs font-semibold">1</span>
            <h4 className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Review &amp; Edit Email
            </h4>
            {emailData.isEdited && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
                <Pencil className="w-3 h-3 mr-1" />
                Edited
              </span>
            )}
          </div>
        </div>

        {isEditing ? (
          // Edit mode
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailTo">To</Label>
              <Input
                id="emailTo"
                value={editToEmail}
                onChange={(e) => setEditToEmail(e.target.value)}
                placeholder="email@example.com (comma-separated for multiple)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailCc">CC</Label>
              <Input
                id="emailCc"
                value={editCcEmail}
                onChange={(e) => setEditCcEmail(e.target.value)}
                placeholder="cc@example.com (comma-separated for multiple)"
              />
            </div>
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
                rows={12}
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
          <div className="p-4">
            {/* Email Preview */}
            <div className="border rounded-lg overflow-hidden mb-4">
              <div className="bg-gray-50 px-4 py-2 border-b text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">To:</span>{" "}
                  <span className="font-medium">{emailData.toEmail || salesIntakeData?.emailAddress || "prospect@company.com"}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">CC:</span>{" "}
                  <span className="font-medium">{emailData.ccEmail || "--"}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Subject:</span>{" "}
                  <span className="font-medium">{emailData.emailSubject}</span>
                </p>
              </div>
              <div className="p-4 bg-white max-h-[250px] overflow-y-auto">
                <div
                  className="whitespace-pre-wrap font-sans text-sm text-[#463939] [&_a]:text-[#407B9D] [&_a]:underline [&_a]:hover:text-[#366a88] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:whitespace-normal [&_li]:ml-2"
                  dangerouslySetInnerHTML={{ __html: emailData.emailBody }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleStartEdit}
              className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Email
            </Button>
          </div>
        )}
      </div>

      {/* STEP 2: Copy & Send in HubSpot */}
      <div className="border border-[#407B9D]/30 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#407B9D]/5 px-4 py-2 border-b border-[#407B9D]/20">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#407B9D] text-white text-xs font-semibold">2</span>
            <h4 className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Copy &amp; Send in HubSpot
            </h4>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
            Copy the email details, open HubSpot, and send using &quot;Create Email&quot; to enable open/click tracking.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCopyAll}
              disabled={isEditing}
              className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-[#5A8A4A]" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Email Details
                </>
              )}
            </Button>
            {hsDealUrl ? (
              <Button
                variant="default"
                onClick={handleOpenHubspot}
                disabled={isEditing}
                className="bg-[#407B9D] hover:bg-[#366a88] text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open HubSpot Deal
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                No HubSpot deal URL available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* STEP 3: Confirm Sent */}
      <div className="border border-[#407B9D]/30 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#407B9D]/5 px-4 py-2 border-b border-[#407B9D]/20">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#407B9D] text-white text-xs font-semibold">3</span>
            <h4 className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Confirm Sent
            </h4>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
            After sending the email in HubSpot, confirm below to move the deal to &quot;SQL - Need Info&quot; stage.
          </p>

          {/* Error Message */}
          {confirmError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {confirmError}
            </div>
          )}

          <Button
            onClick={handleConfirmSent}
            disabled={isConfirming || isEditing}
            className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Email Sent &amp; Move Deal
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
