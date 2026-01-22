"use client"

import { Button } from "@/components/ui/button"
import {
  SimplifiedClosedWonStageData,
  HUBSPOT_STAGE_NAMES
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Trophy,
  DollarSign,
  AlertCircle,
  RotateCcw
} from "lucide-react"

interface ClosedWonProps {
  stageData: SimplifiedClosedWonStageData
  companyName: string
  onConfirm: () => void
  onReset?: () => void
}

export function ClosedWon({
  stageData,
  companyName,
  onConfirm,
  onReset
}: ClosedWonProps) {
  const isConfirmed = !!stageData.confirmedAt

  // Completed state - show celebration
  if (isConfirmed) {
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
          {stageData.confirmedAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Closed on {new Date(stageData.confirmedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Deal Value Card */}
        {stageData.finalDealValue && (
          <div className="bg-white rounded-lg border border-[#C8E4BB] p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold text-[#5A8A4A]">
                  ${stageData.finalDealValue.toLocaleString()}
                  <span className="text-lg font-normal text-muted-foreground">/mo</span>
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-[#C8E4BB]" />
            </div>
          </div>
        )}

        {/* Auto-sync badge */}
        {stageData.isAutoSynced && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Synced from HubSpot
            </span>
          </div>
        )}

        {/* Reset button */}
        {onReset && (
          <div className="mt-4 pt-3 border-t border-[#C8E4BB]">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
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

  // Pending state
  return (
    <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full border-2 border-[#C8E4BB]" />
        <h4
          className="text-lg font-medium text-[#463939]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Closed Won
        </h4>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        Confirm that the deal has been successfully closed and the engagement is signed.
      </p>

      {/* Deal Value Preview */}
      {stageData.finalDealValue && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-[#C8E4BB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Deal Value</p>
              <p className="text-xl font-bold text-[#5A8A4A]">
                ${stageData.finalDealValue.toLocaleString()}/mo
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-[#C8E4BB]" />
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        onClick={onConfirm}
        className="w-full bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
      >
        <Trophy className="w-4 h-4 mr-2" />
        Confirm Closed Won
      </Button>

      {/* HubSpot reminder */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Make sure deal is in <strong>&quot;{HUBSPOT_STAGE_NAMES["closed-won"]}&quot;</strong> in HubSpot
          </p>
        </div>
      </div>
    </div>
  )
}
