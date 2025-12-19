"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  SendEngagementStageData
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Mail,
  Pencil,
  X,
  Trophy,
  Loader2
} from "lucide-react"

interface SendEngagementProps {
  engagementData: SendEngagementStageData
  companyName: string
  contactName: string
  contactEmail: string
  totalMonthly: number
  onInitializeEmail: () => void
  onUpdateEmail: (subject: string, body: string) => void
  onSendViaHubspot: () => void
}

export function SendEngagement({
  engagementData,
  companyName,
  contactName,
  contactEmail,
  totalMonthly,
  onInitializeEmail,
  onUpdateEmail,
  onSendViaHubspot
}: SendEngagementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Track initialization
  const hasInitialized = useRef(false)

  // Initialize email template when component mounts
  useEffect(() => {
    if (!engagementData.customerEmailSubject && !hasInitialized.current) {
      hasInitialized.current = true
      onInitializeEmail()
    }
  }, [engagementData.customerEmailSubject, onInitializeEmail])

  const handleStartEdit = () => {
    setEditSubject(engagementData.customerEmailSubject)
    setEditBody(engagementData.customerEmailBody)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    onUpdateEmail(editSubject, editBody)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditSubject(engagementData.customerEmailSubject)
    setEditBody(engagementData.customerEmailBody)
    setIsEditing(false)
  }

  const handleSendViaHubspot = () => {
    setIsSending(true)
    // Simulate HubSpot API delay
    setTimeout(() => {
      onSendViaHubspot()
      setIsSending(false)
    }, 2000)
  }

  const isSent = !!engagementData.sentViaHubspotAt

  // If sent, show success state
  if (isSent) {
    return (
      <div className="mt-4 p-6 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8E4BB] mb-4">
            <Trophy className="w-8 h-8 text-[#5A8A4A]" />
          </div>
          <h4
            className="text-xl font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Deal Closed Won!
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Engagement email sent to <strong>{companyName}</strong> via HubSpot.
            <br />
            Deal has been moved to Closed Won.
          </p>
          <div className="inline-block bg-white rounded-lg px-4 py-2 border border-[#C8E4BB]">
            <span className="text-lg font-semibold text-[#5A8A4A]">
              ${totalMonthly.toLocaleString()}/mo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Sent on {new Date(engagementData.sentViaHubspotAt!).toLocaleDateString()} at{" "}
            {new Date(engagementData.sentViaHubspotAt!).toLocaleTimeString()}
          </p>
        </div>
      </div>
    )
  }

  // If email template not yet initialized
  if (!engagementData.customerEmailSubject) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Mail className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Preparing Customer Email...
          </h4>
          <p className="text-sm text-muted-foreground">
            Loading the engagement confirmation email template.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Send Engagement Confirmation
          </h4>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        Send the engagement confirmation email to <strong>{contactName}</strong> at <strong>{companyName}</strong>.
        This will complete the sales pipeline and mark the deal as Closed Won.
      </p>

      {/* Email Content */}
      {isEditing ? (
        <div className="space-y-3 mb-4">
          <div>
            <Label htmlFor="emailSubject" className="text-sm">Subject</Label>
            <Input
              id="emailSubject"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="emailBody" className="text-sm">Email Body</Label>
            <Textarea
              id="emailBody"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={12}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
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
                <span className="font-medium">{contactEmail}</span>
              </p>
              <p className="text-xs">
                <span className="text-muted-foreground">Subject:</span>{" "}
                <span className="font-medium">{engagementData.customerEmailSubject}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="h-6 text-xs text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="p-3 bg-white max-h-[250px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-xs text-[#463939]">
              {engagementData.customerEmailBody}
            </pre>
          </div>
        </div>
      )}

      {/* Send Button */}
      {!isEditing && (
        <Button
          onClick={handleSendViaHubspot}
          disabled={isSending}
          className="w-full bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending via HubSpot...
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              Send via HubSpot and Move to Closed Won
            </>
          )}
        </Button>
      )}
    </div>
  )
}
