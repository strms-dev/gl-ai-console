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
  Send,
  Pencil,
  Eye,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FollowUpEmailProps {
  emailData: FollowUpEmailStageData
  salesIntakeData: SalesIntakeFormData | null
  onInitialize: (templateType: "qbo" | "xero" | "other", subject: string, body: string) => void
  onUpdate: (subject: string, body: string) => void
  onSend: () => void
  onMoveHubspotDeal: () => void
}

export function FollowUpEmail({
  emailData,
  salesIntakeData,
  onInitialize,
  onUpdate,
  onSend,
  onMoveHubspotDeal,
}: FollowUpEmailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)

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
      let body = template.bodyTemplate
        .replace(/\{\{contactName\}\}/g, salesIntakeData.contactName || "there")
        .replace(/\{\{companyName\}\}/g, salesIntakeData.companyName || "your company")
        .replace(/\{\{callRecap\}\}/g, getCallRecap(salesIntakeData))

      // Add Fireflies link if available
      if (salesIntakeData.firefliesVideoLink) {
        body = body.replace(
          "Based on our conversation, I wanted to recap the key points we discussed:",
          `Based on our conversation, I wanted to recap the key points we discussed:\n\nDemo Call Recording: ${salesIntakeData.firefliesVideoLink}`
        )
      }

      onInitialize(templateType, template.subject, body)
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
              Follow-Up Email Sent
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
            Sent on {emailData.sentAt ? new Date(emailData.sentAt).toLocaleDateString() : ""} at{" "}
            {emailData.sentAt ? new Date(emailData.sentAt).toLocaleTimeString() : ""}
          </p>
          {isDealMoved && (
            <p className="mt-1 text-[#5A8A4A]">
              HubSpot deal moved to Need Info
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

  // Show email template for review/edit
  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Follow-Up Email
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
          : "Review the email template and make any edits before sending. You can also move the HubSpot deal to Need Info."
        }
      </p>

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
                <span className="font-medium">{salesIntakeData?.emailAddress || "prospect@company.com"}</span>
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
              onClick={() => {
                onMoveHubspotDeal()
                onSend()
              }}
              className="bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send via HubSpot &amp; Move Deal to Need Info
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
