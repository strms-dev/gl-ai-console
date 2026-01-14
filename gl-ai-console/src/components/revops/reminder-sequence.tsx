"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  ReminderSequenceStatus,
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Clock,
  Play,
  Pause,
  KeyRound,
  AlertTriangle,
  Mail,
  Loader2,
} from "lucide-react"

interface ReminderSequenceProps {
  dealId: string
  platform: "qbo" | "xero" | "other" | null
  followUpEmailSentAt: string | null
  status: ReminderSequenceStatus
  enrolledAt: string | null
  accessReceivedAt: string | null
  onEnroll: () => Promise<void>
  onUnenroll: () => Promise<void>
  onAccessReceived: () => Promise<void>
  isEnrolling: boolean
  isUnenrolling: boolean
  isProcessingAccess: boolean
}

/**
 * Calculate business days between two dates (excluding weekends)
 */
function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}

/**
 * Get platform display name
 */
function getPlatformName(platform: "qbo" | "xero" | "other" | null): string {
  const names = {
    qbo: "QuickBooks Online",
    xero: "Xero",
    other: "Other"
  }
  return platform ? names[platform] : "Unknown"
}

/**
 * Get sequence name based on platform
 */
function getSequenceName(platform: "qbo" | "xero" | "other" | null): string {
  const names = {
    qbo: "QBO Access",
    xero: "Xero Access",
    other: "N/A"
  }
  return platform ? names[platform] : "Unknown"
}

export function ReminderSequence({
  platform,
  followUpEmailSentAt,
  status,
  enrolledAt,
  accessReceivedAt,
  onEnroll,
  onUnenroll,
  onAccessReceived,
  isEnrolling,
  isUnenrolling,
  isProcessingAccess,
}: ReminderSequenceProps) {
  // Calculate business days since follow-up email was sent
  const businessDaysElapsed = followUpEmailSentAt
    ? calculateBusinessDays(new Date(followUpEmailSentAt), new Date())
    : null

  const isOtherPlatform = platform === "other"
  const isLoading = isEnrolling || isUnenrolling || isProcessingAccess

  // ==========================================
  // ACCESS RECEIVED STATE (Completed)
  // ==========================================
  if (status === "access_received" && accessReceivedAt) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Access Received
          </h4>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          The client has granted access. This stage is complete.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Platform</Label>
            <p className="font-medium mt-1">{getPlatformName(platform)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Access Received</Label>
            <p className="font-medium mt-1">{formatDate(accessReceivedAt)}</p>
          </div>
          {enrolledAt && (
            <div>
              <Label className="text-muted-foreground">Was Enrolled At</Label>
              <p className="font-medium mt-1">{formatDate(enrolledAt)}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==========================================
  // ENROLLED STATE
  // ==========================================
  if (status === "enrolled") {
    return (
      <div className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Enrolled in Sequence
            </h4>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-300">
            <Play className="w-3.5 h-3.5" />
            Enrolled
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Contact is enrolled in the <strong>{getSequenceName(platform)}</strong> HubSpot sequence.
          They will receive automated reminder emails until access is received.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <Label className="text-muted-foreground">Enrolled At</Label>
            <p className="font-medium mt-1">{formatDate(enrolledAt)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Platform</Label>
            <p className="font-medium mt-1">{getPlatformName(platform)}</p>
          </div>
        </div>

        {/* Action explanation */}
        <div className="p-3 bg-blue-100/50 rounded-lg mb-4 text-sm">
          <ul className="space-y-1 text-blue-800">
            <li>
              <strong>Unenroll</strong> removes the contact from the sequence but keeps them at this stage for manual follow-up.
            </li>
            <li>
              <strong>Access Received</strong> removes them from the sequence AND moves to Internal Team Assignment.
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onUnenroll}
            disabled={isLoading}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            {isUnenrolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unenrolling...
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Unenroll
              </>
            )}
          </Button>
          <Button
            onClick={onAccessReceived}
            disabled={isLoading}
            className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
          >
            {isProcessingAccess ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 mr-2" />
                Mark Access Received
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ==========================================
  // NOT ENROLLED STATE (Other Platform)
  // ==========================================
  if (isOtherPlatform) {
    return (
      <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Reminder Sequence
            </h4>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
            <Clock className="w-3.5 h-3.5" />
            Not Enrolled
          </span>
        </div>

        {/* Follow-up email timing */}
        {followUpEmailSentAt && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <Label className="text-muted-foreground">Follow-up Email Sent</Label>
              <p className="font-medium mt-1">{formatDate(followUpEmailSentAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Business Days Elapsed</Label>
              <p className="font-medium mt-1">
                {businessDaysElapsed} day{businessDaysElapsed !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <Label className="text-muted-foreground">Platform</Label>
          <p className="font-medium mt-1">{getPlatformName(platform)}</p>
        </div>

        {/* Warning for other platform */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">No automated sequence available</p>
            <p>
              This platform does not have an automated HubSpot sequence. Please follow up manually
              with the contact, or create a HubSpot sequence and enroll them directly in HubSpot.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={onAccessReceived}
            disabled={isLoading}
            className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
          >
            {isProcessingAccess ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 mr-2" />
                Mark Access Received
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ==========================================
  // NOT ENROLLED STATE (QBO/Xero)
  // ==========================================
  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-gray-500" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Reminder Sequence
          </h4>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
          <Clock className="w-3.5 h-3.5" />
          Not Enrolled
        </span>
      </div>

      {/* Follow-up email timing */}
      {followUpEmailSentAt && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <Label className="text-muted-foreground">Follow-up Email Sent</Label>
            <p className="font-medium mt-1">{formatDate(followUpEmailSentAt)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Business Days Elapsed</Label>
            <p className="font-medium mt-1">
              {businessDaysElapsed} day{businessDaysElapsed !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Label className="text-muted-foreground">Platform</Label>
        <p className="font-medium mt-1">{getPlatformName(platform)}</p>
      </div>

      {/* Enroll explanation */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-sm text-blue-800">
        <p>
          Clicking <strong>Enroll Now</strong> will add this contact to the{" "}
          <strong>{getSequenceName(platform)}</strong> HubSpot sequence.
          They will receive automated reminder emails until they grant access or respond.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
        <Button
          onClick={onEnroll}
          disabled={isLoading}
          className="bg-[#407B9D] hover:bg-[#366a88] text-white"
        >
          {isEnrolling ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enrolling...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Enroll Now
            </>
          )}
        </Button>
        <Button
          onClick={onAccessReceived}
          disabled={isLoading}
          className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
        >
          {isProcessingAccess ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4 mr-2" />
              Mark Access Received
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
