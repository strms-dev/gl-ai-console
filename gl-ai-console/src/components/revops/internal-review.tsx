"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  InternalReviewStageData,
  SalesIntakeFormData,
  DEFAULT_INTERNAL_RECIPIENTS,
  INTERNAL_ASSIGNMENT_EMAIL
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Users,
  Send,
  Pencil,
  Eye,
  X,
  UserPlus,
  Trash2
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
  const [isEditing, setIsEditing] = useState(false)
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [editRecipients, setEditRecipients] = useState<{ name: string; email: string }[]>([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [newRecipientName, setNewRecipientName] = useState("")
  const [newRecipientEmail, setNewRecipientEmail] = useState("")

  // Use ref to track if we've already initialized to prevent infinite loops
  const hasInitialized = useRef(false)

  // Initialize email template when component mounts
  useEffect(() => {
    // Only initialize once when we have salesIntakeData and no recipients yet
    if (reviewData.recipients.length === 0 && salesIntakeData && !hasInitialized.current) {
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

      onInitialize(DEFAULT_INTERNAL_RECIPIENTS, template.subject, body)
    }

    // Reset the flag if recipients is cleared (for re-initialization)
    if (reviewData.recipients.length === 0) {
      hasInitialized.current = false
    }
  }, [reviewData.recipients.length, salesIntakeData, accessPlatform, onInitialize])

  const handleStartEdit = () => {
    setEditSubject(reviewData.emailSubject)
    setEditBody(reviewData.emailBody)
    setEditRecipients([...reviewData.recipients])
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    onUpdate(editRecipients, editSubject, editBody)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditSubject(reviewData.emailSubject)
    setEditBody(reviewData.emailBody)
    setEditRecipients([...reviewData.recipients])
    setIsEditing(false)
  }

  const handleToggleRecipient = (email: string, checked: boolean) => {
    if (checked) {
      const defaultRecipient = DEFAULT_INTERNAL_RECIPIENTS.find(r => r.email === email)
      if (defaultRecipient && !editRecipients.find(r => r.email === email)) {
        setEditRecipients([...editRecipients, defaultRecipient])
      }
    } else {
      setEditRecipients(editRecipients.filter(r => r.email !== email))
    }
  }

  const handleAddCustomRecipient = () => {
    if (newRecipientName && newRecipientEmail) {
      setEditRecipients([...editRecipients, { name: newRecipientName, email: newRecipientEmail }])
      setNewRecipientName("")
      setNewRecipientEmail("")
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setEditRecipients(editRecipients.filter(r => r.email !== email))
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

  // If no recipients yet (loading state)
  if (reviewData.recipients.length === 0) {
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

  // Show email template for review/edit
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
          {reviewData.isEdited && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <Pencil className="w-3 h-3 mr-1" />
              Edited
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        {isEditing
          ? "Edit the email content and recipients below, then save your changes."
          : "Review the email template and select recipients before sending to the internal team for GL review."}
      </p>

      {isEditing ? (
        // Edit mode
        <div className="space-y-4">
          {/* Recipients Selection */}
          <div className="space-y-3">
            <Label>Recipients</Label>
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-2">Default team members:</p>
              {DEFAULT_INTERNAL_RECIPIENTS.map((recipient) => (
                <div key={recipient.email} className="flex items-center gap-2">
                  <Checkbox
                    id={recipient.email}
                    checked={editRecipients.some(r => r.email === recipient.email)}
                    onCheckedChange={(checked: boolean) => handleToggleRecipient(recipient.email, checked)}
                  />
                  <label
                    htmlFor={recipient.email}
                    className="text-sm cursor-pointer"
                  >
                    {recipient.name} ({recipient.email})
                  </label>
                </div>
              ))}
            </div>

            {/* Custom recipients */}
            {editRecipients.filter(r => !DEFAULT_INTERNAL_RECIPIENTS.some(d => d.email === r.email)).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Custom recipients:</p>
                {editRecipients
                  .filter(r => !DEFAULT_INTERNAL_RECIPIENTS.some(d => d.email === r.email))
                  .map((recipient) => (
                    <div key={recipient.email} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded border">
                      <span className="text-sm">{recipient.name} ({recipient.email})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient(recipient.email)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}

            {/* Add custom recipient */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="newRecipientName" className="text-xs">Name</Label>
                <Input
                  id="newRecipientName"
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                  placeholder="John Doe"
                  className="h-8"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="newRecipientEmail" className="text-xs">Email</Label>
                <Input
                  id="newRecipientEmail"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCustomRecipient}
                disabled={!newRecipientName || !newRecipientEmail}
                className="h-8"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
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
        <div className="space-y-4">
          {/* Recipients Display */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <Label className="text-muted-foreground text-xs">Recipients</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {reviewData.recipients.map((recipient) => (
                <span
                  key={recipient.email}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30"
                >
                  {recipient.name}
                </span>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <p className="text-sm">
                <span className="text-muted-foreground">To:</span>{" "}
                <span className="font-medium">{reviewData.recipients.map(r => r.email).join(", ")}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Subject:</span>{" "}
                <span className="font-medium">{reviewData.emailSubject}</span>
              </p>
            </div>
            <div className="p-4 bg-white max-h-[300px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-[#463939]">
                {reviewData.emailBody}
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
              onClick={onSend}
              className="bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send via HubSpot
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
