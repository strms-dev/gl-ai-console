"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  InternalReviewStageData,
  SalesIntakeFormData,
  INTERNAL_ASSIGNMENT_EMAIL
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
  Settings
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InternalReviewProps {
  reviewData: InternalReviewStageData
  salesIntakeData: SalesIntakeFormData | null
  accessPlatform: "qbo" | "xero" | "other" | null
  onInitialize: (recipients: { name: string; email: string }[], subject: string, body: string) => void
  onUpdate: (recipients: { name: string; email: string }[], subject: string, body: string) => void
  onSend: () => void
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
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showManageTeamModal, setShowManageTeamModal] = useState(false)

  // Use ref to track if we've already initialized to prevent infinite loops
  const hasInitialized = useRef(false)

  // Initialize email template when component mounts
  useEffect(() => {
    // Only initialize once when we have salesIntakeData and no email body yet
    if (!reviewData.emailBody && salesIntakeData && !hasInitialized.current) {
      hasInitialized.current = true

      console.log("Initializing internal review email")

      // Get template and replace placeholders
      const template = INTERNAL_ASSIGNMENT_EMAIL
      const platformNames: Record<string, string> = {
        qbo: "QuickBooks Online",
        xero: "Xero",
        other: "Other"
      }

      // Build services needed list
      const servicesNeeded: string[] = []
      if (salesIntakeData.needsBillPaySupport === "yes") servicesNeeded.push("Bill Pay")
      if (salesIntakeData.needsInvoicingSupport === "yes") servicesNeeded.push("Invoicing")
      if (salesIntakeData.interestedInCfoReview === "yes") servicesNeeded.push("CFO Review")
      servicesNeeded.push("Bookkeeping") // Always include bookkeeping

      const body = template.bodyTemplate
        .replace(/\{\{companyName\}\}/g, salesIntakeData.companyName || "Unknown Company")
        .replace(/\{\{contactName\}\}/g, salesIntakeData.contactName || "Unknown Contact")
        .replace(/\{\{accountingSystem\}\}/g, platformNames[accessPlatform || "other"])
        .replace(/\{\{servicesNeeded\}\}/g, servicesNeeded.join(", "))

      // Initialize with empty recipients - user will select team members
      onInitialize([], template.subject, body)
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
  }, [reviewData.emailSubject, reviewData.emailBody, reviewData.recipients])

  // Load default recipients if none selected and we have active recipients
  useEffect(() => {
    if (selectedRecipients.length === 0 && reviewData.recipients?.length === 0) {
      const activeRecipients = getActiveRecipients()
      if (activeRecipients.length > 0) {
        setSelectedRecipients(activeRecipients)
        // Also update the store
        onUpdate(activeRecipients, reviewData.emailSubject || "", reviewData.emailBody || "")
      }
    }
  }, [selectedRecipients.length, reviewData.recipients?.length, reviewData.emailSubject, reviewData.emailBody, onUpdate])

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
      onUpdate(newRecipients, emailSubject, emailBody)
      return newRecipients
    })
  }

  const handleSaveEmailEdit = () => {
    onUpdate(selectedRecipients, emailSubject, emailBody)
    setIsEditingEmail(false)
  }

  const handleCancelEmailEdit = () => {
    setEmailSubject(reviewData.emailSubject || "")
    setEmailBody(reviewData.emailBody || "")
    setIsEditingEmail(false)
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
            Assigned to: {reviewData.reviewAssignedTo?.join(", ")}
          </p>
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
          {getActiveRecipients().map((recipient) => {
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
          })}
          {getActiveRecipients().length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No team members configured. Click &quot;Manage Team&quot; to add members.
            </p>
          )}
        </div>
        {selectedRecipients.length === 0 && getActiveRecipients().length > 0 && (
          <p className="text-xs text-amber-600 mt-2">
            Select at least one team member to assign this client to
          </p>
        )}
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
            <div>
              <p className="text-xs">
                <span className="text-muted-foreground">To:</span>{" "}
                <span className={selectedRecipients.length === 0 ? "text-amber-600 italic" : "font-medium"}>
                  {selectedRecipients.length === 0
                    ? "No recipient selected"
                    : selectedRecipients.map(r => r.email).join(", ")}
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

      {/* Send Button */}
      <Button
        onClick={onSend}
        disabled={selectedRecipients.length === 0}
        className="w-full bg-[#407B9D] hover:bg-[#366a88] text-white"
      >
        <Send className="w-4 h-4 mr-2" />
        Send Internal Assignment
      </Button>

      {/* Manage Team Modal */}
      <ManageTeamModal
        isOpen={showManageTeamModal}
        onClose={() => setShowManageTeamModal(false)}
        onRecipientsUpdated={() => {
          // Refresh recipients - keep only those that are still active
          const activeRecipients = getActiveRecipients()
          const stillActiveSelected = selectedRecipients.filter(
            sr => activeRecipients.some(ar => ar.email === sr.email)
          )
          setSelectedRecipients(stillActiveSelected)
        }}
      />
    </div>
  )
}
