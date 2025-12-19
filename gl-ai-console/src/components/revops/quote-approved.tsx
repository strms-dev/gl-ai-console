"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  QuoteApprovedStageData
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  ThumbsUp,
  FileText,
  Send,
  ArrowRight
} from "lucide-react"

interface QuoteApprovedProps {
  approvalData: QuoteApprovedStageData
  companyName: string
  totalMonthly: number
  onUpdateNotes: (notes: string) => void
  onSendAcknowledgment: () => void
  onMoveToEngagement: () => void
}

export function QuoteApproved({
  approvalData,
  companyName,
  totalMonthly,
  onUpdateNotes,
  onSendAcknowledgment,
  onMoveToEngagement
}: QuoteApprovedProps) {
  const [notes, setNotes] = useState(approvalData.approvalNotes || "")
  const [notesChanged, setNotesChanged] = useState(false)

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setNotesChanged(true)
  }

  const handleSaveNotes = () => {
    onUpdateNotes(notes)
    setNotesChanged(false)
  }

  const isMovedToEngagement = !!approvalData.movedToEngagementAt

  // If already moved to engagement, show completed state
  if (isMovedToEngagement) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Quote Approved - Moving to Engagement
          </h4>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Approved on {approvalData.approvedAt ? new Date(approvalData.approvedAt).toLocaleDateString() : ""}
            {approvalData.approvedBy && <span> by {approvalData.approvedBy}</span>}
          </p>
          <p className="mt-1">
            Deal value: <strong>${totalMonthly.toLocaleString()}/mo</strong>
          </p>
          {approvalData.acknowledgmentSentAt && (
            <p className="mt-1 text-[#5A8A4A]">
              Acknowledgment sent on {new Date(approvalData.acknowledgmentSentAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {approvalData.approvalNotes && (
          <div className="mt-3 p-3 bg-white rounded-lg border">
            <Label className="text-xs text-muted-foreground">Approval Notes</Label>
            <p className="text-sm mt-1">{approvalData.approvalNotes}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-[#5A8A4A]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Quote Approved!
          </h4>
        </div>
        <span className="text-lg font-bold text-[#5A8A4A]">
          ${totalMonthly.toLocaleString()}/mo
        </span>
      </div>

      <div className="p-4 bg-white/50 rounded-lg border border-[#C8E4BB]/40 mb-4">
        <p className="text-sm text-[#5A8A4A]" style={{ fontFamily: "var(--font-body)" }}>
          Congratulations! <strong>{companyName}</strong> has approved the quote.
          {approvalData.approvedAt && (
            <span>
              {" "}Approved on {new Date(approvalData.approvedAt).toLocaleDateString()}
              {approvalData.approvedBy && ` by ${approvalData.approvedBy}`}.
            </span>
          )}
        </p>
      </div>

      {/* Approval Notes */}
      <div className="mb-4">
        <Label htmlFor="approvalNotes" className="text-sm font-medium">
          Approval Notes (Optional)
        </Label>
        <Textarea
          id="approvalNotes"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add any notes about the approval, special requests, or things to remember for the engagement..."
          rows={3}
          className="mt-1"
        />
        {notesChanged && (
          <Button
            size="sm"
            onClick={handleSaveNotes}
            className="mt-2 h-7 bg-[#407B9D] hover:bg-[#366a88] text-white"
          >
            Save Notes
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#C8E4BB]/40">
        <Button
          variant="outline"
          onClick={onSendAcknowledgment}
          disabled={!!approvalData.acknowledgmentSentAt}
          className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
        >
          <Send className="w-4 h-4 mr-2" />
          {approvalData.acknowledgmentSentAt ? "Acknowledgment Sent" : "Send Acknowledgment Email"}
        </Button>
        <Button
          onClick={onMoveToEngagement}
          className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Prepare Engagement Agreement
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
