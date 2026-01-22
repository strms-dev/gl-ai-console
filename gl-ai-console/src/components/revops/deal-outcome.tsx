"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  SimplifiedClosedWonStageData,
  SimplifiedClosedLostStageData,
  LostReason,
  HUBSPOT_STAGE_NAMES
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Trophy,
  DollarSign,
  XCircle,
  AlertCircle,
  HelpCircle,
  RotateCcw
} from "lucide-react"

interface DealOutcomeProps {
  closedWonData: SimplifiedClosedWonStageData
  closedLostData: SimplifiedClosedLostStageData
  companyName: string
  onConfirmWon: () => void
  onConfirmLost: (reason: LostReason, details: string) => void
  onResetWon?: () => void
  onResetLost?: () => void
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

export function DealOutcome({
  closedWonData,
  closedLostData,
  companyName,
  onConfirmWon,
  onConfirmLost,
  onResetWon,
  onResetLost
}: DealOutcomeProps) {
  const [showLostForm, setShowLostForm] = useState(false)
  const [lostReason, setLostReason] = useState<LostReason | "">(closedLostData.lostReason || "")
  const [lostDetails, setLostDetails] = useState(closedLostData.lostReasonDetails || "")

  const isWon = !!closedWonData.confirmedAt
  const isLost = !!closedLostData.confirmedAt

  const handleConfirmLost = () => {
    if (lostReason) {
      onConfirmLost(lostReason, lostDetails)
    }
  }

  // =============================================
  // COMPLETED: Closed Won State
  // =============================================
  if (isWon) {
    return (
      <div className="mt-4 p-6 border-2 border-[#C8E4BB] rounded-lg bg-gradient-to-br from-[#C8E4BB]/20 to-[#C8E4BB]/5">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8E4BB] mb-4">
            <Trophy className="w-8 h-8 text-[#5A8A4A]" />
          </div>
          <h4
            className="text-2xl font-bold text-[#5A8A4A] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Congratulations!
          </h4>
          <p className="text-lg text-[#463939]">
            <strong>{companyName}</strong> is now a customer
          </p>
          {closedWonData.confirmedAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Closed on {new Date(closedWonData.confirmedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Deal Value Card */}
        {closedWonData.finalDealValue && (
          <div className="bg-white rounded-lg border border-[#C8E4BB] p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold text-[#5A8A4A]">
                  ${closedWonData.finalDealValue.toLocaleString()}
                  <span className="text-lg font-normal text-muted-foreground">/mo</span>
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-[#C8E4BB]" />
            </div>
          </div>
        )}

        {/* Auto-sync badge */}
        {closedWonData.isAutoSynced && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Synced from HubSpot
            </span>
          </div>
        )}

        {/* Reset button */}
        {onResetWon && (
          <div className="mt-4 pt-3 border-t border-[#C8E4BB]">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetWon}
              className="text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              Reset Stage
            </Button>
          </div>
        )}
      </div>
    )
  }

  // =============================================
  // COMPLETED: Closed Lost State
  // =============================================
  if (isLost) {
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
            {closedLostData.confirmedAt && (
              <p className="text-red-700">
                Closed on {new Date(closedLostData.confirmedAt).toLocaleDateString()}
              </p>
            )}
            {closedLostData.lostReason && (
              <p className="text-muted-foreground">
                Reason: <strong>{LOST_REASON_LABELS[closedLostData.lostReason]}</strong>
              </p>
            )}
            {closedLostData.lostReasonDetails && (
              <p className="text-muted-foreground">
                Details: {closedLostData.lostReasonDetails}
              </p>
            )}
          </div>
        </div>

        {/* Auto-sync badge */}
        {closedLostData.isAutoSynced && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Synced from HubSpot
            </span>
          </div>
        )}

        {/* Reset button */}
        {onResetLost && (
          <div className="mt-4 pt-3 border-t border-red-200">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetLost}
              className="text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              Reset Stage
            </Button>
          </div>
        )}
      </div>
    )
  }

  // =============================================
  // PENDING: Choose Outcome State
  // =============================================
  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
          <HelpCircle className="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Deal Outcome
          </h4>
          <p className="text-sm text-muted-foreground">
            Record the final outcome for <strong>{companyName}</strong>
          </p>
        </div>
      </div>

      {!showLostForm ? (
        // Choice buttons
        <div className="space-y-3">
          {/* Closed Won Option */}
          <div className="p-4 border-2 border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#C8E4BB]">
                  <Trophy className="w-5 h-5 text-[#5A8A4A]" />
                </div>
                <div>
                  <h5 className="font-medium text-[#5A8A4A]">Closed Won</h5>
                  <p className="text-sm text-muted-foreground">Deal successfully closed</p>
                </div>
              </div>
              <Button
                onClick={onConfirmWon}
                className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
              >
                Confirm Won
              </Button>
            </div>
            {closedWonData.finalDealValue && (
              <div className="mt-3 pt-3 border-t border-[#C8E4BB]/50 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#5A8A4A]" />
                <span className="text-sm text-[#5A8A4A] font-medium">
                  ${closedWonData.finalDealValue.toLocaleString()}/mo MRR
                </span>
              </div>
            )}
          </div>

          {/* Closed Lost Option */}
          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h5 className="font-medium text-red-700">Closed Lost</h5>
                  <p className="text-sm text-muted-foreground">Deal did not close</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowLostForm(true)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Mark as Lost
              </Button>
            </div>
          </div>

          {/* HubSpot reminder */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Make sure deal stage matches in HubSpot: <strong>&quot;{HUBSPOT_STAGE_NAMES["closed-won"]}&quot;</strong> or <strong>&quot;{HUBSPOT_STAGE_NAMES["closed-lost"]}&quot;</strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Lost Reason Form
        <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50/50">
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
              value={lostReason}
              onValueChange={(value) => setLostReason(value as LostReason)}
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
              value={lostDetails}
              onChange={(e) => setLostDetails(e.target.value)}
              placeholder="Add any details about why the deal was lost..."
              rows={3}
              className="mt-1 bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLostForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLost}
              disabled={!lostReason}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirm Lost
            </Button>
          </div>

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
      )}
    </div>
  )
}
