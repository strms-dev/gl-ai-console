"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ReminderSequenceStatus,
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Clock,
  Play,
  KeyRound,
  AlertTriangle,
  Mail,
  Loader2,
  ExternalLink,
  User,
  UserMinus,
} from "lucide-react"

// HubSpot sequence URLs
const HUBSPOT_SEQUENCE_URLS = {
  qbo: "https://app.hubspot.com/sequences/4723689/sequence/279171609",
  xero: "https://app.hubspot.com/sequences/4723689/sequence/293844634"
}

type DialogType = "enroll" | "unenroll" | "access_received" | null

interface ReminderSequenceProps {
  platform: "qbo" | "xero" | "other" | null
  followUpEmailSentAt: string | null
  status: ReminderSequenceStatus
  enrolledAt: string | null
  accessReceivedAt: string | null
  contactName: string
  contactEmail: string
  onEnroll: () => Promise<void>
  onUnenroll: () => Promise<void>
  onAccessReceived: () => Promise<void>
  isProcessing: boolean
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
  contactName,
  contactEmail,
  onEnroll,
  onUnenroll,
  onAccessReceived,
  isProcessing,
}: ReminderSequenceProps) {
  // State for dialogs
  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [hasConfirmed, setHasConfirmed] = useState(false)

  // Calculate business days since follow-up email was sent
  const businessDaysElapsed = followUpEmailSentAt
    ? calculateBusinessDays(new Date(followUpEmailSentAt), new Date())
    : null

  const isOtherPlatform = platform === "other"
  const sequenceUrl = platform && platform !== "other" ? HUBSPOT_SEQUENCE_URLS[platform] : null
  const displayName = contactName || "Unknown Contact"
  const displayEmail = contactEmail || ""

  // Handle enroll button click - open HubSpot sequence, then show confirmation dialog
  const handleEnrollClick = () => {
    if (sequenceUrl) {
      window.open(sequenceUrl, "_blank")
    }
    setActiveDialog("enroll")
  }

  // Handle unenroll button click - open HubSpot sequence, then show confirmation dialog
  const handleUnenrollClick = () => {
    if (sequenceUrl) {
      window.open(sequenceUrl, "_blank")
    }
    setActiveDialog("unenroll")
  }

  // Handle mark access received when enrolled - open HubSpot for unenroll first
  const handleAccessReceivedWhenEnrolled = () => {
    if (sequenceUrl) {
      window.open(sequenceUrl, "_blank")
    }
    setActiveDialog("access_received")
  }

  // Handle dialog confirm based on type
  const handleDialogConfirm = async () => {
    const dialogType = activeDialog
    setActiveDialog(null)
    setHasConfirmed(false)

    if (dialogType === "enroll") {
      await onEnroll()
    } else if (dialogType === "unenroll") {
      await onUnenroll()
    } else if (dialogType === "access_received") {
      await onAccessReceived()
    }
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setActiveDialog(null)
    setHasConfirmed(false)
  }

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
            <Label className="text-muted-foreground">Contact</Label>
            <p className="font-medium mt-1">{displayName}</p>
            {displayEmail && <p className="text-muted-foreground text-xs">{displayEmail}</p>}
          </div>
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
      <>
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

          {/* Contact info */}
          <div className="p-3 bg-white/80 border border-blue-200 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  <strong>{displayName}</strong> is enrolled in the{" "}
                  <strong>{getSequenceName(platform)}</strong> sequence.
                </p>
                {displayEmail && (
                  <p className="text-xs text-blue-700 mt-0.5">{displayEmail}</p>
                )}
                {sequenceUrl && (
                  <a
                    href={sequenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View sequence in HubSpot
                  </a>
                )}
              </div>
            </div>
          </div>

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

          {/* Instructions */}
          <div className="p-3 bg-blue-100/50 rounded-lg mb-4 text-sm text-blue-800">
            <p>
              When the client grants access, click <strong>Mark Access Received</strong>.
              You&apos;ll be prompted to confirm unenrollment from the sequence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
            <Button
              onClick={handleAccessReceivedWhenEnrolled}
              disabled={isProcessing}
              className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              {isProcessing ? (
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
            <Button
              variant="outline"
              onClick={handleUnenrollClick}
              disabled={isProcessing}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Unenroll
            </Button>
          </div>
        </div>

        {/* Confirmation Dialogs for Enrolled State */}
        <Dialog open={activeDialog !== null} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-md">
            {/* UNENROLL CONFIRMATION */}
            {activeDialog === "unenroll" && (
              <>
                <DialogHeader>
                  <DialogTitle>Confirm Unenrollment</DialogTitle>
                  <DialogDescription>
                    The {getSequenceName(platform)} sequence has opened in HubSpot.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Checkbox
                      id="confirm-unenroll-enrolled"
                      checked={hasConfirmed}
                      onCheckedChange={(checked) => setHasConfirmed(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="confirm-unenroll-enrolled" className="text-sm cursor-pointer">
                      I have unenrolled <strong>{displayName}</strong> from the {getSequenceName(platform)} sequence in HubSpot
                    </label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDialogConfirm}
                    disabled={!hasConfirmed || isProcessing}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Confirm Unenrolled
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}

            {/* ACCESS RECEIVED CONFIRMATION (when enrolled) */}
            {activeDialog === "access_received" && (
              <>
                <DialogHeader>
                  <DialogTitle>Confirm Unenrollment &amp; Access Received</DialogTitle>
                  <DialogDescription>
                    The {getSequenceName(platform)} sequence has opened in HubSpot so you can unenroll the contact.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Checkbox
                      id="confirm-access-enrolled"
                      checked={hasConfirmed}
                      onCheckedChange={(checked) => setHasConfirmed(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="confirm-access-enrolled" className="text-sm cursor-pointer">
                      I have unenrolled <strong>{displayName}</strong> (or confirmed they are no longer enrolled) and the client has granted access
                    </label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDialogConfirm}
                    disabled={!hasConfirmed || isProcessing}
                    className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Yes, Access Received
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </>
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
            Manual Follow-up
          </span>
        </div>

        {/* Contact info for manual follow-up */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Contact for Manual Follow-up:</p>
              <p className="text-sm text-amber-800 mt-1">
                <strong>{displayName}</strong>
              </p>
              {displayEmail && (
                <a
                  href={`mailto:${displayEmail}`}
                  className="text-sm text-amber-700 hover:underline"
                >
                  {displayEmail}
                </a>
              )}
            </div>
          </div>
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
              with the contact until they grant access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={onAccessReceived}
            disabled={isProcessing}
            className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
          >
            {isProcessing ? (
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
    <>
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

        {/* Contact info box */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Contact:</p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>{displayName}</strong>
              </p>
              {displayEmail && (
                <p className="text-xs text-blue-700">{displayEmail}</p>
              )}
            </div>
          </div>
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

        {/* Instructions */}
        <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg mb-4 text-sm text-gray-700">
          <p className="mb-2">
            <strong>If client has not responded in 3+ business days:</strong> Click{" "}
            <strong>Enroll in HubSpot</strong> to open the sequence and enroll the contact.
          </p>
          <p>
            <strong>If client already granted access:</strong> Click{" "}
            <strong>Mark Access Received</strong> to complete this stage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleEnrollClick}
            disabled={isProcessing}
            className="bg-[#407B9D] hover:bg-[#366a88] text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Enroll in HubSpot
          </Button>
          <Button
            onClick={onAccessReceived}
            disabled={isProcessing}
            className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
          >
            {isProcessing ? (
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

      {/* Confirmation Dialogs */}
      <Dialog open={activeDialog !== null} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          {/* ENROLL CONFIRMATION */}
          {activeDialog === "enroll" && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Enrollment</DialogTitle>
                <DialogDescription>
                  The {getSequenceName(platform)} sequence has opened in HubSpot.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="confirm-enroll"
                    checked={hasConfirmed}
                    onCheckedChange={(checked) => setHasConfirmed(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="confirm-enroll" className="text-sm cursor-pointer">
                    I have enrolled <strong>{displayName}</strong> in the {getSequenceName(platform)} sequence in HubSpot
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDialogConfirm}
                  disabled={!hasConfirmed || isProcessing}
                  className="bg-[#407B9D] hover:bg-[#366a88] text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Enrolled
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* UNENROLL CONFIRMATION */}
          {activeDialog === "unenroll" && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Unenrollment</DialogTitle>
                <DialogDescription>
                  The {getSequenceName(platform)} sequence has opened in HubSpot.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Checkbox
                    id="confirm-unenroll"
                    checked={hasConfirmed}
                    onCheckedChange={(checked) => setHasConfirmed(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="confirm-unenroll" className="text-sm cursor-pointer">
                    I have unenrolled <strong>{displayName}</strong> from the {getSequenceName(platform)} sequence in HubSpot
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDialogConfirm}
                  disabled={!hasConfirmed || isProcessing}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Confirm Unenrolled
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* ACCESS RECEIVED CONFIRMATION (when enrolled) */}
          {activeDialog === "access_received" && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Unenrollment &amp; Access Received</DialogTitle>
                <DialogDescription>
                  The {getSequenceName(platform)} sequence has opened in HubSpot so you can unenroll the contact.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Checkbox
                    id="confirm-access"
                    checked={hasConfirmed}
                    onCheckedChange={(checked) => setHasConfirmed(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="confirm-access" className="text-sm cursor-pointer">
                    I have unenrolled <strong>{displayName}</strong> (or confirmed they are no longer enrolled) and the client has granted access
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDialogConfirm}
                  disabled={!hasConfirmed || isProcessing}
                  className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Yes, Access Received
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
