"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  ReminderSequenceStageData,
  ReminderSequenceStatus,
  SalesIntakeFormData
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Clock,
  Play,
  Pause,
  KeyRound,
  Calendar,
  AlertCircle,
  Mail,
  UserCheck
} from "lucide-react"

interface ReminderSequenceProps {
  sequenceData: ReminderSequenceStageData
  salesIntakeData: SalesIntakeFormData | null
  onEnroll: () => void
  onUnenroll: () => void
  onMarkAccessReceived: (platform: "qbo" | "xero" | "other") => void
}

export function ReminderSequence({
  sequenceData,
  salesIntakeData,
  onEnroll,
  onUnenroll,
  onMarkAccessReceived,
}: ReminderSequenceProps) {
  // Get platform from sales intake form data
  const getPlatformFromIntake = (): "qbo" | "xero" | "other" => {
    if (salesIntakeData?.accountingPlatform === "qbo") return "qbo"
    if (salesIntakeData?.accountingPlatform === "xero") return "xero"
    if (salesIntakeData?.accountingPlatform === "other") return "other"
    return "qbo" // default fallback
  }

  const selectedPlatform = getPlatformFromIntake()

  // Calculate days until auto-enrollment
  const getDaysUntilEnrollment = (): number | null => {
    if (!sequenceData.scheduledEnrollmentAt) return null
    const scheduledDate = new Date(sequenceData.scheduledEnrollmentAt)
    const now = new Date()
    const diffTime = scheduledDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  // Get sequence name based on type
  const getSequenceName = (): string => {
    const names = {
      qbo: "QuickBooks Online",
      xero: "Xero",
      other: "Reports Request"
    }
    return sequenceData.sequenceType ? names[sequenceData.sequenceType] : "Unknown"
  }

  // Get status badge color and text
  const getStatusConfig = (status: ReminderSequenceStatus) => {
    const configs = {
      not_enrolled: {
        color: "bg-gray-100 text-gray-700 border-gray-300",
        label: "Not Enrolled",
        icon: Clock
      },
      scheduled: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-300",
        label: "Scheduled",
        icon: Calendar
      },
      enrolled: {
        color: "bg-blue-50 text-blue-700 border-blue-300",
        label: "Enrolled",
        icon: Play
      },
      unenrolled_response: {
        color: "bg-green-50 text-green-700 border-green-300",
        label: "Contact Responded",
        icon: Mail
      },
      unenrolled_access: {
        color: "bg-green-50 text-green-700 border-green-300",
        label: "Access Received",
        icon: KeyRound
      }
    }
    return configs[status]
  }

  const statusConfig = getStatusConfig(sequenceData.status)
  const StatusIcon = statusConfig.icon
  const daysUntilEnrollment = getDaysUntilEnrollment()

  // Completed state - access received
  if (sequenceData.status === "unenrolled_access" && sequenceData.accessReceivedAt) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Platform</Label>
            <p className="font-medium mt-1">
              {sequenceData.accessPlatform === "qbo" ? "QuickBooks Online" :
               sequenceData.accessPlatform === "xero" ? "Xero" : "Other"}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Received At</Label>
            <p className="font-medium mt-1">{formatDate(sequenceData.accessReceivedAt)}</p>
          </div>
          {sequenceData.enrolledAt && (
            <div>
              <Label className="text-muted-foreground">Was Enrolled</Label>
              <p className="font-medium mt-1">{formatDate(sequenceData.enrolledAt)}</p>
            </div>
          )}
          {sequenceData.unenrolledAt && (
            <div>
              <Label className="text-muted-foreground">Auto-Unenrolled</Label>
              <p className="font-medium mt-1">{formatDate(sequenceData.unenrolledAt)}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Contact responded state
  if (sequenceData.status === "unenrolled_response" && sequenceData.contactRespondedAt) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#5A8A4A]" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contact Responded
            </h4>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          The contact responded to the follow-up email. They have been automatically unenrolled from the reminder sequence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <Label className="text-muted-foreground">Responded At</Label>
            <p className="font-medium mt-1">{formatDate(sequenceData.contactRespondedAt)}</p>
          </div>
          {sequenceData.enrolledAt && (
            <div>
              <Label className="text-muted-foreground">Was Enrolled</Label>
              <p className="font-medium mt-1">{formatDate(sequenceData.enrolledAt)}</p>
            </div>
          )}
        </div>

        {/* Still need to mark access received to complete */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Mark when access is received to complete this stage:</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Platform: <strong>{selectedPlatform === "qbo" ? "QuickBooks Online" : selectedPlatform === "xero" ? "Xero" : "Other"}</strong>
            </span>
            <Button
              onClick={() => onMarkAccessReceived(selectedPlatform)}
              className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Mark Access Received
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Enrolled state
  if (sequenceData.status === "enrolled") {
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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Contact is currently enrolled in the <strong>{getSequenceName()}</strong> HubSpot reminder sequence.
          They will be automatically unenrolled when they respond or grant access.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <Label className="text-muted-foreground">Enrolled At</Label>
            <p className="font-medium mt-1">{formatDate(sequenceData.enrolledAt)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Enrolled By</Label>
            <p className="font-medium mt-1 capitalize">{sequenceData.enrolledBy || "Unknown"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onUnenroll}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <Pause className="w-4 h-4 mr-2" />
            Unenroll
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Platform: <strong>{selectedPlatform === "qbo" ? "QuickBooks Online" : selectedPlatform === "xero" ? "Xero" : "Other"}</strong>
            </span>
            <Button
              onClick={() => onMarkAccessReceived(selectedPlatform)}
              className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Access Received
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Scheduled state (waiting for auto-enrollment)
  if (sequenceData.status === "scheduled") {
    return (
      <div className="mt-4 p-4 border border-yellow-300 rounded-lg bg-yellow-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Auto-Enrollment Scheduled
            </h4>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {daysUntilEnrollment !== null && daysUntilEnrollment > 0
              ? `${daysUntilEnrollment} day${daysUntilEnrollment === 1 ? "" : "s"} remaining`
              : "Due today"}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          If no response is received, the contact will be automatically enrolled in the{" "}
          <strong>{getSequenceName()}</strong> HubSpot reminder sequence on{" "}
          <strong>{formatDate(sequenceData.scheduledEnrollmentAt)}</strong>.
        </p>

        <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-yellow-700" />
          <span className="text-sm text-yellow-800">
            Waiting for contact response or manual override
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
          <Button
            onClick={onEnroll}
            className="bg-[#407B9D] hover:bg-[#366a88] text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Enroll Now
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Platform: <strong>{selectedPlatform === "qbo" ? "QuickBooks Online" : selectedPlatform === "xero" ? "Xero" : "Other"}</strong>
            </span>
            <Button
              onClick={() => onMarkAccessReceived(selectedPlatform)}
              className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Access Received
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Default / Not enrolled state
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        The reminder sequence has not been scheduled. This typically happens automatically when the follow-up email is sent.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onEnroll}
          className="bg-[#407B9D] hover:bg-[#366a88] text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          Enroll Now
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Platform: <strong>{selectedPlatform === "qbo" ? "QuickBooks Online" : selectedPlatform === "xero" ? "Xero" : "Other"}</strong>
          </span>
          <Button
            onClick={() => onMarkAccessReceived(selectedPlatform)}
            className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
          >
            <KeyRound className="w-4 h-4 mr-2" />
            Access Received
          </Button>
        </div>
      </div>
    </div>
  )
}
