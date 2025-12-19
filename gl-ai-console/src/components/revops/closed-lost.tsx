"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ClosedLostStageData,
  LostReason,
  SalesPipelineStageId
} from "@/lib/sales-pipeline-timeline-types"
import {
  XCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ClosedLostProps {
  lostData: ClosedLostStageData
  companyName: string
  onUpdateDetails: (reason: LostReason, details: string) => void
  onSyncToHubspot: () => void
}

// Map lost reason to display labels
const LOST_REASON_LABELS: Record<LostReason, string> = {
  no_response: "No Response",
  declined: "Declined / Not Interested",
  competitor: "Chose Competitor",
  timing: "Bad Timing",
  budget: "Budget Constraints",
  other: "Other"
}

// Map stage IDs to readable names
const STAGE_LABELS: Record<SalesPipelineStageId, string> = {
  "demo-call": "Demo Call",
  "sales-intake": "Sales Intake",
  "follow-up-email": "Follow-Up Email",
  "reminder-sequence": "Reminder Sequence",
  "internal-review": "Internal Review",
  "gl-review": "GL Review",
  "gl-review-comparison": "GL Review Comparison",
  "create-quote": "Create Quote",
  "quote-sent": "Quote Sent",
  "quote-approved": "Quote Approved",
  "prepare-engagement": "Prepare Engagement",
  "internal-engagement-review": "Internal Engagement Review",
  "send-engagement": "Send Engagement",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost"
}

export function ClosedLost({
  lostData,
  companyName,
  onUpdateDetails,
  onSyncToHubspot
}: ClosedLostProps) {
  const [reason, setReason] = useState<LostReason | "">(lostData.lostReason || "")
  const [details, setDetails] = useState(lostData.lostReasonDetails || "")
  const [hasChanges, setHasChanges] = useState(false)

  const handleReasonChange = (value: LostReason) => {
    setReason(value)
    setHasChanges(true)
  }

  const handleDetailsChange = (value: string) => {
    setDetails(value)
    setHasChanges(true)
  }

  const handleSave = () => {
    if (reason) {
      onUpdateDetails(reason, details)
      setHasChanges(false)
    }
  }

  const isConfirmed = !!lostData.closedAt

  return (
    <div className="mt-4 p-4 border-2 border-red-200 rounded-lg bg-red-50/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h4
            className="text-lg font-medium text-red-700"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Deal Closed - Lost
          </h4>
          <p className="text-sm text-muted-foreground">
            <strong>{companyName}</strong>
          </p>
        </div>
      </div>

      {/* Closed Info */}
      {isConfirmed && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <div className="text-sm">
              <p className="text-red-700">
                Closed on {new Date(lostData.closedAt!).toLocaleDateString()}
              </p>
              {lostData.lostFromStage && (
                <p className="text-muted-foreground mt-1">
                  Lost from stage: <strong>{STAGE_LABELS[lostData.lostFromStage]}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lost Reason Selection */}
      <div className="mb-4">
        <Label htmlFor="lostReason" className="text-sm font-medium">
          Lost Reason
        </Label>
        <Select
          value={reason}
          onValueChange={(value) => handleReasonChange(value as LostReason)}
        >
          <SelectTrigger className="mt-1 bg-white">
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LOST_REASON_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Details */}
      <div className="mb-4">
        <Label htmlFor="lostDetails" className="text-sm font-medium">
          Details &amp; Learnings
        </Label>
        <Textarea
          id="lostDetails"
          value={details}
          onChange={(e) => handleDetailsChange(e.target.value)}
          placeholder="Add details about why the deal was lost and any learnings for future reference..."
          rows={4}
          className="mt-1 bg-white"
        />
      </div>

      {/* Save Button */}
      {hasChanges && reason && (
        <Button
          onClick={handleSave}
          className="w-full mb-4 bg-red-600 hover:bg-red-700 text-white"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      )}

      {/* HubSpot Sync */}
      <div className="pt-4 border-t border-red-200">
        <Button
          variant="outline"
          onClick={onSyncToHubspot}
          disabled={lostData.hubspotSynced || !isConfirmed}
          className={lostData.hubspotSynced
            ? "w-full border-red-300 text-red-600"
            : "w-full border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
          }
        >
          {lostData.hubspotSynced ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Synced to HubSpot
              {lostData.hubspotSyncedAt && (
                <span className="text-xs ml-2 text-muted-foreground">
                  ({new Date(lostData.hubspotSyncedAt).toLocaleDateString()})
                </span>
              )}
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Sync to HubSpot
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
