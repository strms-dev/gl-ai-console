"use client"

import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink
} from "lucide-react"

export interface SimplifiedStageCardProps {
  /** Stage title matching HubSpot stage name */
  stageTitle: string
  /** HubSpot stage name for the reminder */
  hubspotStageName: string
  /** Description of what this stage represents */
  description: string
  /** Label for the primary confirm button */
  confirmButtonLabel: string
  /** Whether this stage has been confirmed */
  isConfirmed: boolean
  /** Timestamp when confirmed */
  confirmedAt?: string
  /** Whether this stage was auto-synced from HubSpot */
  isAutoSynced?: boolean
  /** Whether this stage was skipped (auto-completed because deal moved past it) */
  isSkipped?: boolean
  /** Reason for skipping (e.g., "Deal moved past this stage") */
  skippedReason?: string
  /** Callback when confirm button is clicked */
  onConfirm: () => void
  /** Optional secondary action (e.g., "Quote Declined") */
  secondaryAction?: {
    label: string
    onClick: () => void
    variant: "destructive" | "outline"
  }
  /** Optional content to show in the completed state (e.g., deal value) */
  completedContent?: React.ReactNode
  /** Optional link to show (e.g., HubSpot quote link) */
  externalLink?: {
    label: string
    url: string
  }
  /** Whether this is a terminal stage (Closed Won/Lost) */
  isTerminal?: boolean
  /** Variant for special styling (won/lost) */
  variant?: "default" | "success" | "error"
}

export function SimplifiedStageCard({
  stageTitle,
  hubspotStageName,
  description,
  confirmButtonLabel,
  isConfirmed,
  confirmedAt,
  isAutoSynced,
  isSkipped,
  skippedReason,
  onConfirm,
  secondaryAction,
  completedContent,
  externalLink,
  // isTerminal is kept for API compatibility but not used in this version
  isTerminal: _isTerminal,
  variant = "default"
}: SimplifiedStageCardProps) {
  // Determine styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          border: "border-[#C8E4BB]",
          bg: "bg-[#C8E4BB]/10",
          iconColor: "text-[#5A8A4A]",
          textColor: "text-[#5A8A4A]"
        }
      case "error":
        return {
          border: "border-red-200",
          bg: "bg-red-50/50",
          iconColor: "text-red-500",
          textColor: "text-red-700"
        }
      default:
        return {
          border: "border-[#407B9D]/30",
          bg: "bg-white",
          iconColor: "text-[#407B9D]",
          textColor: "text-[#463939]"
        }
    }
  }

  const styles = getVariantStyles()

  // Completed state
  if (isConfirmed) {
    // Special styling for skipped stages
    const skippedStyles = isSkipped
      ? "border-gray-200 bg-gray-50/50 opacity-75"
      : variant === "success"
      ? "border-[#C8E4BB] bg-[#C8E4BB]/10"
      : variant === "error"
      ? "border-red-200 bg-red-50/50"
      : "border-[#C8E4BB] bg-[#C8E4BB]/10"

    return (
      <div className={`mt-4 p-4 border rounded-lg ${skippedStyles}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSkipped ? (
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
            ) : variant === "error" ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
            )}
            <h4
              className={`text-lg font-medium ${isSkipped ? "text-gray-500" : variant === "error" ? "text-red-700" : "text-[#463939]"}`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {stageTitle}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {isSkipped && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 italic">
                Skipped
              </span>
            )}
            {isAutoSynced && !isSkipped && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
                <ExternalLink className="w-3 h-3 mr-1" />
                Auto-synced
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          {isSkipped && skippedReason ? (
            <p className="text-gray-400 italic">{skippedReason}</p>
          ) : confirmedAt && (
            <p className={variant === "error" ? "text-red-600" : "text-[#5A8A4A]"}>
              {isAutoSynced ? "Synced" : "Confirmed"} on {new Date(confirmedAt).toLocaleDateString()} at {new Date(confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Optional completed content (e.g., deal value for Closed Won) */}
        {completedContent && (
          <div className="mt-4">
            {completedContent}
          </div>
        )}

        {/* External link if provided */}
        {externalLink && (
          <a
            href={externalLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-sm text-[#407B9D] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {externalLink.label}
          </a>
        )}
      </div>
    )
  }

  // Pending state
  return (
    <div className={`mt-4 p-4 border rounded-lg ${styles.border} ${styles.bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-5 h-5 rounded-full border-2 ${styles.border}`} />
        <h4
          className={`text-lg font-medium ${styles.textColor}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {stageTitle}
        </h4>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        {description}
      </p>

      {/* External link if provided */}
      {externalLink && (
        <div className="mb-4 p-3 bg-[#407B9D]/5 border border-[#407B9D]/20 rounded-lg">
          <a
            href={externalLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#407B9D] hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            {externalLink.label}
          </a>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onConfirm}
          className={variant === "success"
            ? "flex-1 bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            : variant === "error"
            ? "flex-1 bg-red-600 hover:bg-red-700 text-white"
            : "flex-1 bg-[#407B9D] hover:bg-[#366a88] text-white"
          }
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {confirmButtonLabel}
        </Button>

        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className={secondaryAction.variant === "destructive"
              ? "flex-1 text-red-600 border-red-300 hover:bg-red-50"
              : "flex-1 text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
            }
          >
            {secondaryAction.variant === "destructive" && (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {/* HubSpot reminder */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Make sure deal is in <strong>&quot;{hubspotStageName}&quot;</strong> in HubSpot
          </p>
        </div>
      </div>
    </div>
  )
}
