"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  SimplifiedClosedLostStageData,
  LostReason,
  HUBSPOT_STAGE_NAMES
} from "@/lib/sales-pipeline-timeline-types"
import {
  XCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Select } from "@/components/ui/select"

interface ClosedLostProps {
  stageData: SimplifiedClosedLostStageData
  companyName: string
  onConfirm: (reason: LostReason, details: string) => void
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

export function ClosedLost({
  stageData,
  companyName,
  onConfirm
}: ClosedLostProps) {
  const [reason, setReason] = useState<LostReason | "">(stageData.lostReason || "")
  const [details, setDetails] = useState(stageData.lostReasonDetails || "")

  const isConfirmed = !!stageData.confirmedAt

  const handleConfirm = () => {
    if (reason) {
      onConfirm(reason, details)
    }
  }

  // Completed state
  if (isConfirmed) {
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
        <div className="mb-4 p-3 bg-white rounded-lg border border-red-200">
          <div className="space-y-2 text-sm">
            {stageData.confirmedAt && (
              <p className="text-red-700">
                Closed on {new Date(stageData.confirmedAt).toLocaleDateString()}
              </p>
            )}
            {stageData.lostReason && (
              <p className="text-muted-foreground">
                Reason: <strong>{LOST_REASON_LABELS[stageData.lostReason]}</strong>
              </p>
            )}
            {stageData.lostReasonDetails && (
              <p className="text-muted-foreground">
                Details: {stageData.lostReasonDetails}
              </p>
            )}
          </div>
        </div>

        {/* Auto-sync badge */}
        {stageData.isAutoSynced && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Synced from HubSpot
            </span>
          </div>
        )}
      </div>
    )
  }

  // Pending state
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
            Closed Lost
          </h4>
          <p className="text-sm text-muted-foreground">
            <strong>{companyName}</strong>
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        Record the reason for losing this deal and any learnings for future reference.
      </p>

      {/* Lost Reason Selection */}
      <div className="mb-4">
        <Label htmlFor="lostReason" className="text-sm font-medium">
          Lost Reason <span className="text-red-500">*</span>
        </Label>
        <Select
          value={reason}
          onValueChange={(value) => setReason(value as LostReason)}
          className="mt-1 bg-white"
        >
          <option value="">Select a reason...</option>
          {Object.entries(LOST_REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* Details (optional) */}
      <div className="mb-4">
        <Label htmlFor="lostDetails" className="text-sm font-medium">
          Details &amp; Learnings (optional)
        </Label>
        <Textarea
          id="lostDetails"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add any details about why the deal was lost..."
          rows={3}
          className="mt-1 bg-white"
        />
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={!reason}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Confirm Closed Lost
      </Button>

      {/* HubSpot reminder */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Make sure deal is in <strong>&quot;{HUBSPOT_STAGE_NAMES["closed-lost"]}&quot;</strong> in HubSpot
          </p>
        </div>
      </div>
    </div>
  )
}
