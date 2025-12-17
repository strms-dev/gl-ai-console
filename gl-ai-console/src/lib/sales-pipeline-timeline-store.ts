"use client"

import {
  SalesPipelineTimelineState,
  SalesPipelineStageId,
  SalesPipelineStageStatus,
  SalesIntakeFormData,
  GLReviewFormData,
  GLReviewComparisonSelections,
  GLReviewCustomValues,
  createInitialTimelineState,
  createTestSalesIntakeFormData,
  createTestFieldConfidence,
  createTestGLReviewFormData,
  createTestGLReviewFieldConfidence,
  createTestTeamGLReviewFormData
} from "./sales-pipeline-timeline-types"

const TIMELINE_STORAGE_KEY = "revops-pipeline-timelines"
const FILES_STORAGE_KEY = "revops-pipeline-files"

// File data stored as base64 for localStorage persistence
interface StoredFileData {
  fileName: string
  fileSize: number
  fileType: string
  base64Data: string
  uploadedAt: string
}

/**
 * Get all stored files from localStorage
 */
function getAllFiles(): Record<string, StoredFileData> {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem(FILES_STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error reading files from localStorage:", error)
    return {}
  }
}

/**
 * Save all files to localStorage
 */
function saveAllFiles(files: Record<string, StoredFileData>): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files))
  } catch (error) {
    console.error("Error saving files to localStorage:", error)
  }
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Convert base64 string back to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeType })
}

/**
 * Save file to localStorage
 */
export async function saveFileToStorage(dealId: string, fileTypeId: string, file: File): Promise<void> {
  const files = getAllFiles()
  const key = `${dealId}-${fileTypeId}`

  const base64Data = await fileToBase64(file)

  files[key] = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    base64Data,
    uploadedAt: new Date().toISOString()
  }

  saveAllFiles(files)
}

/**
 * Get file from localStorage
 */
export function getFileFromStorage(dealId: string, fileTypeId: string): { blob: Blob; fileName: string; fileSize: number; uploadedAt: string } | null {
  const files = getAllFiles()
  const key = `${dealId}-${fileTypeId}`
  const storedFile = files[key]

  if (!storedFile) return null

  const blob = base64ToBlob(storedFile.base64Data, storedFile.fileType)

  return {
    blob,
    fileName: storedFile.fileName,
    fileSize: storedFile.fileSize,
    uploadedAt: storedFile.uploadedAt
  }
}

/**
 * Delete file from localStorage
 */
export function deleteFileFromStorage(dealId: string, fileTypeId: string): void {
  const files = getAllFiles()
  const key = `${dealId}-${fileTypeId}`

  delete files[key]
  saveAllFiles(files)
}

/**
 * Get all timeline states from localStorage
 */
function getAllTimelines(): Record<string, SalesPipelineTimelineState> {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem(TIMELINE_STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error reading timelines from localStorage:", error)
    return {}
  }
}

/**
 * Save all timelines to localStorage
 */
function saveAllTimelines(timelines: Record<string, SalesPipelineTimelineState>): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(timelines))
  } catch (error) {
    console.error("Error saving timelines to localStorage:", error)
  }
}

/**
 * Get timeline state for a specific deal
 */
export async function getTimelineState(dealId: string): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  return timelines[dealId] || null
}

/**
 * Get or create timeline state for a deal
 * Also migrates existing deals to add any new stages that were added after their creation
 */
export async function getOrCreateTimelineState(dealId: string): Promise<SalesPipelineTimelineState> {
  const existing = await getTimelineState(dealId)

  if (existing) {
    let needsSave = false
    const timelines = getAllTimelines()

    // Migrate existing deals to add follow-up-email stage if missing
    if (!existing.stages["follow-up-email"]) {
      existing.stages["follow-up-email"] = {
        status: "pending",
        completedAt: null,
        data: {
          templateType: null,
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          hubspotDealMoved: false,
          hubspotDealMovedAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing deals to add reminder-sequence stage if missing
    if (!existing.stages["reminder-sequence"]) {
      existing.stages["reminder-sequence"] = {
        status: "pending",
        completedAt: null,
        data: {
          status: "not_enrolled",
          sequenceType: null,
          scheduledEnrollmentAt: null,
          enrolledAt: null,
          enrolledBy: null,
          unenrolledAt: null,
          unenrollmentReason: null,
          accessReceivedAt: null,
          accessPlatform: null,
          contactRespondedAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing deals to add internal-review stage if missing
    if (!existing.stages["internal-review"]) {
      existing.stages["internal-review"] = {
        status: "pending",
        completedAt: null,
        data: {
          recipients: [],
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          reviewAssignedTo: null,
          reviewCompletedAt: null,
          reviewNotes: null
        }
      }
      needsSave = true
    }

    // Migrate existing deals to add gl-review stage if missing
    if (!existing.stages["gl-review"]) {
      existing.stages["gl-review"] = {
        status: "pending",
        completedAt: null,
        data: {
          formData: null,
          isAutoFilled: false,
          autoFilledAt: null,
          confirmedAt: null,
          fieldConfidence: null
        }
      }
      needsSave = true
    }

    // Migrate existing deals to add gl-review-comparison stage if missing
    if (!existing.stages["gl-review-comparison"]) {
      existing.stages["gl-review-comparison"] = {
        status: "pending",
        completedAt: null,
        data: {
          teamReviewData: null,
          teamReviewSubmittedAt: null,
          teamReviewSubmittedBy: null,
          aiReviewData: null,
          finalReviewData: null,
          fieldSelections: null,
          customValues: null,
          comparisonCompletedAt: null,
          movedToCreateQuoteAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing comparison stage to add customValues if missing
    if (existing.stages["gl-review-comparison"] && existing.stages["gl-review-comparison"].data.customValues === undefined) {
      existing.stages["gl-review-comparison"].data.customValues = null
      needsSave = true
    }

    if (needsSave) {
      existing.updatedAt = new Date().toISOString()
      timelines[dealId] = existing
      saveAllTimelines(timelines)
    }

    return existing
  }

  const newState = createInitialTimelineState(dealId)
  const timelines = getAllTimelines()
  timelines[dealId] = newState
  saveAllTimelines(timelines)

  return newState
}

/**
 * Update timeline state
 */
export async function updateTimelineState(
  dealId: string,
  updates: Partial<SalesPipelineTimelineState>
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const updated: SalesPipelineTimelineState = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  timelines[dealId] = updated
  saveAllTimelines(timelines)

  return updated
}

/**
 * Update a specific stage status
 */
export async function updateStageStatus(
  dealId: string,
  stageId: SalesPipelineStageId,
  status: SalesPipelineStageStatus
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Update stage status based on stage type
  if (stageId === "demo-call") {
    existing.stages["demo-call"] = {
      ...existing.stages["demo-call"],
      status,
      completedAt: status === "completed" ? now : existing.stages["demo-call"].completedAt
    }
  } else if (stageId === "sales-intake") {
    existing.stages["sales-intake"] = {
      ...existing.stages["sales-intake"],
      status,
      completedAt: status === "completed" ? now : existing.stages["sales-intake"].completedAt
    }
  } else if (stageId === "follow-up-email") {
    existing.stages["follow-up-email"] = {
      ...existing.stages["follow-up-email"],
      status,
      completedAt: status === "completed" ? now : existing.stages["follow-up-email"].completedAt
    }
  } else if (stageId === "reminder-sequence") {
    existing.stages["reminder-sequence"] = {
      ...existing.stages["reminder-sequence"],
      status,
      completedAt: status === "completed" ? now : existing.stages["reminder-sequence"].completedAt
    }
  } else if (stageId === "internal-review") {
    existing.stages["internal-review"] = {
      ...existing.stages["internal-review"],
      status,
      completedAt: status === "completed" ? now : existing.stages["internal-review"].completedAt
    }
  } else if (stageId === "gl-review") {
    existing.stages["gl-review"] = {
      ...existing.stages["gl-review"],
      status,
      completedAt: status === "completed" ? now : existing.stages["gl-review"].completedAt
    }
  } else if (stageId === "gl-review-comparison") {
    existing.stages["gl-review-comparison"] = {
      ...existing.stages["gl-review-comparison"],
      status,
      completedAt: status === "completed" ? now : existing.stages["gl-review-comparison"].completedAt
    }
  }

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// Stage-Specific Update Functions
// ============================================

/**
 * Demo Call Stage: Upload transcript
 */
export async function uploadDemoTranscript(
  dealId: string,
  fileName: string,
  file?: File
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Save the actual file to localStorage if provided
  if (file) {
    await saveFileToStorage(dealId, 'revops-demo-call-transcript', file)
  }

  const now = new Date().toISOString()
  existing.stages["demo-call"].status = "completed"
  existing.stages["demo-call"].completedAt = now
  existing.stages["demo-call"].data.transcriptUploaded = true
  existing.stages["demo-call"].data.transcriptFileName = fileName
  existing.stages["demo-call"].data.transcriptUploadedAt = now

  // Move to sales-intake stage
  existing.currentStage = "sales-intake"
  existing.stages["sales-intake"].status = "in_progress"

  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Demo Call Stage: Clear transcript
 */
export async function clearDemoTranscript(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Delete the file from localStorage
  deleteFileFromStorage(dealId, 'revops-demo-call-transcript')

  existing.stages["demo-call"].status = "in_progress"
  existing.stages["demo-call"].completedAt = null
  existing.stages["demo-call"].data.transcriptUploaded = false
  existing.stages["demo-call"].data.transcriptFileName = null
  existing.stages["demo-call"].data.transcriptUploadedAt = null

  // Revert sales-intake stage back to pending
  existing.currentStage = "demo-call"
  existing.stages["sales-intake"].status = "pending"

  existing.updatedAt = new Date().toISOString()

  saveAllTimelines(timelines)
  return existing
}

/**
 * Delete timeline state for a deal
 */
export async function deleteTimelineState(dealId: string): Promise<boolean> {
  const timelines = getAllTimelines()

  if (!timelines[dealId]) return false

  delete timelines[dealId]
  saveAllTimelines(timelines)

  return true
}

// ============================================
// Sales Intake Stage Functions
// ============================================

/**
 * Auto-fill sales intake form with test data
 */
export async function autoFillSalesIntake(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  const testData = createTestSalesIntakeFormData()
  const testConfidence = createTestFieldConfidence()

  existing.stages["sales-intake"].data = {
    formData: testData,
    isAutoFilled: true,
    autoFilledAt: now,
    confirmedAt: null,
    fieldConfidence: testConfidence
  }
  existing.stages["sales-intake"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update sales intake form data (for user edits)
 */
export async function updateSalesIntakeForm(
  dealId: string,
  formData: SalesIntakeFormData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["sales-intake"].data = {
    ...existing.stages["sales-intake"].data,
    formData
  }

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Confirm sales intake form (complete the stage)
 */
export async function confirmSalesIntake(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["sales-intake"].data.confirmedAt = now
  existing.stages["sales-intake"].status = "completed"
  existing.stages["sales-intake"].completedAt = now

  // Move to follow-up-email stage
  existing.currentStage = "follow-up-email"
  existing.stages["follow-up-email"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Reset sales intake form (clear data and go back to action-required)
 */
export async function resetSalesIntake(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["sales-intake"].data = {
    formData: null,
    isAutoFilled: false,
    autoFilledAt: null,
    confirmedAt: null,
    fieldConfidence: null
  }
  existing.stages["sales-intake"].status = "in_progress"
  existing.stages["sales-intake"].completedAt = null

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// Follow-Up Email Stage Functions
// ============================================

/**
 * Initialize follow-up email with template based on accounting platform
 */
export async function initializeFollowUpEmail(
  dealId: string,
  templateType: "qbo" | "xero" | "other",
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["follow-up-email"].data = {
    templateType,
    emailSubject: subject,
    emailBody: body,
    isEdited: false,
    sentAt: null,
    hubspotDealMoved: false,
    hubspotDealMovedAt: null
  }

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update follow-up email content (for user edits)
 */
export async function updateFollowUpEmail(
  dealId: string,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["follow-up-email"].data.emailSubject = subject
  existing.stages["follow-up-email"].data.emailBody = body
  existing.stages["follow-up-email"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Calculate date 3 business days from a given date
 */
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let addedDays = 0

  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++
    }
  }

  return result
}

/**
 * Mark follow-up email as sent
 */
export async function markFollowUpEmailSent(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date()
  const nowISO = now.toISOString()

  existing.stages["follow-up-email"].data.sentAt = nowISO
  existing.stages["follow-up-email"].status = "completed"
  existing.stages["follow-up-email"].completedAt = nowISO

  // Move to reminder-sequence stage and schedule auto-enrollment
  existing.currentStage = "reminder-sequence"
  existing.stages["reminder-sequence"].status = "in_progress"

  // Calculate scheduled enrollment date (3 business days from now)
  const scheduledDate = addBusinessDays(now, 3)
  existing.stages["reminder-sequence"].data.status = "scheduled"
  existing.stages["reminder-sequence"].data.scheduledEnrollmentAt = scheduledDate.toISOString()

  // Set sequence type based on accounting platform from sales intake
  const accountingPlatform = existing.stages["sales-intake"].data.formData?.accountingPlatform
  if (accountingPlatform === "qbo" || accountingPlatform === "xero") {
    existing.stages["reminder-sequence"].data.sequenceType = accountingPlatform
  } else {
    existing.stages["reminder-sequence"].data.sequenceType = "other"
  }

  existing.updatedAt = nowISO
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark HubSpot deal as moved to Need Info
 */
export async function markHubspotDealMoved(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["follow-up-email"].data.hubspotDealMoved = true
  existing.stages["follow-up-email"].data.hubspotDealMovedAt = now

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Reset follow-up email stage
 */
export async function resetFollowUpEmail(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["follow-up-email"].data = {
    templateType: null,
    emailSubject: "",
    emailBody: "",
    isEdited: false,
    sentAt: null,
    hubspotDealMoved: false,
    hubspotDealMovedAt: null
  }
  existing.stages["follow-up-email"].status = "in_progress"
  existing.stages["follow-up-email"].completedAt = null

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// Reminder Sequence Stage Functions
// ============================================

/**
 * Manually enroll contact in HubSpot sequence
 */
export async function enrollInSequence(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["reminder-sequence"].data.status = "enrolled"
  existing.stages["reminder-sequence"].data.enrolledAt = now
  existing.stages["reminder-sequence"].data.enrolledBy = "manual"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark contact as auto-enrolled (called by automation)
 */
export async function markAutoEnrolled(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["reminder-sequence"].data.status = "enrolled"
  existing.stages["reminder-sequence"].data.enrolledAt = now
  existing.stages["reminder-sequence"].data.enrolledBy = "auto"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Manually unenroll contact from sequence
 */
export async function unenrollFromSequence(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["reminder-sequence"].data.status = "unenrolled_response"
  existing.stages["reminder-sequence"].data.unenrolledAt = now
  existing.stages["reminder-sequence"].data.unenrollmentReason = "manual"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark contact as responded (auto-unenrolls from sequence)
 */
export async function markContactResponded(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["reminder-sequence"].data.contactRespondedAt = now
  existing.stages["reminder-sequence"].data.status = "unenrolled_response"
  existing.stages["reminder-sequence"].data.unenrolledAt = now
  existing.stages["reminder-sequence"].data.unenrollmentReason = "response"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark accounting access as received (auto-unenrolls and completes stage)
 */
export async function markAccessReceived(
  dealId: string,
  platform: "qbo" | "xero" | "other"
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["reminder-sequence"].data.accessReceivedAt = now
  existing.stages["reminder-sequence"].data.accessPlatform = platform

  // If enrolled, unenroll
  if (existing.stages["reminder-sequence"].data.status === "enrolled") {
    existing.stages["reminder-sequence"].data.status = "unenrolled_access"
    existing.stages["reminder-sequence"].data.unenrolledAt = now
    existing.stages["reminder-sequence"].data.unenrollmentReason = "access_received"
  } else {
    existing.stages["reminder-sequence"].data.status = "unenrolled_access"
  }

  // Complete the stage
  existing.stages["reminder-sequence"].status = "completed"
  existing.stages["reminder-sequence"].completedAt = now

  // Move to internal-review stage
  existing.currentStage = "internal-review"
  existing.stages["internal-review"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Reset reminder sequence stage
 */
export async function resetReminderSequence(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["reminder-sequence"].data = {
    status: "not_enrolled",
    sequenceType: null,
    scheduledEnrollmentAt: null,
    enrolledAt: null,
    enrolledBy: null,
    unenrolledAt: null,
    unenrollmentReason: null,
    accessReceivedAt: null,
    accessPlatform: null,
    contactRespondedAt: null
  }
  existing.stages["reminder-sequence"].status = "in_progress"
  existing.stages["reminder-sequence"].completedAt = null

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// Internal Review Stage Functions
// ============================================

/**
 * Initialize internal review email with template
 */
export async function initializeInternalReview(
  dealId: string,
  recipients: { name: string; email: string }[],
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["internal-review"].data = {
    recipients,
    emailSubject: subject,
    emailBody: body,
    isEdited: false,
    sentAt: null,
    reviewAssignedTo: null,
    reviewCompletedAt: null,
    reviewNotes: null
  }

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update internal review email content (for user edits)
 */
export async function updateInternalReviewEmail(
  dealId: string,
  recipients: { name: string; email: string }[],
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["internal-review"].data.recipients = recipients
  existing.stages["internal-review"].data.emailSubject = subject
  existing.stages["internal-review"].data.emailBody = body
  existing.stages["internal-review"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark internal review email as sent
 */
export async function markInternalReviewSent(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["internal-review"].data.sentAt = now
  existing.stages["internal-review"].data.reviewAssignedTo =
    existing.stages["internal-review"].data.recipients.map(r => r.email)
  existing.stages["internal-review"].status = "completed"
  existing.stages["internal-review"].completedAt = now

  // Move to gl-review stage
  existing.currentStage = "gl-review"
  existing.stages["gl-review"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark internal review as completed
 */
export async function markInternalReviewCompleted(
  dealId: string,
  notes?: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["internal-review"].data.reviewCompletedAt = now
  if (notes) {
    existing.stages["internal-review"].data.reviewNotes = notes
  }

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Reset internal review stage
 */
export async function resetInternalReview(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["internal-review"].data = {
    recipients: [],
    emailSubject: "",
    emailBody: "",
    isEdited: false,
    sentAt: null,
    reviewAssignedTo: null,
    reviewCompletedAt: null,
    reviewNotes: null
  }
  existing.stages["internal-review"].status = "in_progress"
  existing.stages["internal-review"].completedAt = null

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// GL Review Stage Functions
// ============================================

/**
 * Auto-fill GL Review form with test data
 */
export async function autoFillGLReview(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  const testData = createTestGLReviewFormData()
  const testConfidence = createTestGLReviewFieldConfidence()

  // Pre-fill email, company name, and lead name from sales intake if available
  const salesIntakeData = existing.stages["sales-intake"].data.formData
  if (salesIntakeData) {
    testData.email = salesIntakeData.emailAddress || testData.email
    testData.companyName = salesIntakeData.companyName || testData.companyName
    testData.leadName = salesIntakeData.contactName || testData.leadName
  }

  existing.stages["gl-review"].data = {
    formData: testData,
    isAutoFilled: true,
    autoFilledAt: now,
    confirmedAt: null,
    fieldConfidence: testConfidence
  }
  existing.stages["gl-review"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update GL Review form data (for user edits)
 */
export async function updateGLReviewForm(
  dealId: string,
  formData: GLReviewFormData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["gl-review"].data = {
    ...existing.stages["gl-review"].data,
    formData
  }

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Confirm GL Review form (complete the stage)
 */
export async function confirmGLReview(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["gl-review"].data.confirmedAt = now
  existing.stages["gl-review"].status = "completed"
  existing.stages["gl-review"].completedAt = now

  // Move to GL Review Comparison stage
  existing.currentStage = "gl-review-comparison"
  existing.stages["gl-review-comparison"].status = "in_progress"

  // Copy the AI review data to the comparison stage for reference
  existing.stages["gl-review-comparison"].data.aiReviewData =
    existing.stages["gl-review"].data.formData

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Reset GL Review form (clear data and go back to in_progress)
 */
export async function resetGLReview(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["gl-review"].data = {
    formData: null,
    isAutoFilled: false,
    autoFilledAt: null,
    confirmedAt: null,
    fieldConfidence: null
  }
  existing.stages["gl-review"].status = "in_progress"
  existing.stages["gl-review"].completedAt = null

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// GL Review Comparison Stage Functions
// ============================================

/**
 * Simulate team member submitting their GL review (for testing)
 * In production, this would be called when the team member submits their review
 */
export async function submitTeamGLReview(
  dealId: string,
  submittedBy?: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Use test data for simulation - in production this would come from team's actual input
  const teamReviewData = createTestTeamGLReviewFormData()

  // If we have AI data, pre-fill some fields from it (email, company, lead name)
  const aiData = existing.stages["gl-review-comparison"].data.aiReviewData
  if (aiData) {
    teamReviewData.email = aiData.email
    teamReviewData.companyName = aiData.companyName
    teamReviewData.leadName = aiData.leadName
  }

  existing.stages["gl-review-comparison"].data.teamReviewData = teamReviewData
  existing.stages["gl-review-comparison"].data.teamReviewSubmittedAt = now
  existing.stages["gl-review-comparison"].data.teamReviewSubmittedBy = submittedBy || "Team Member"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update field selections in the comparison
 */
export async function updateComparisonSelections(
  dealId: string,
  selections: GLReviewComparisonSelections
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["gl-review-comparison"].data.fieldSelections = selections

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update the final review data based on selections
 */
export async function updateFinalReviewData(
  dealId: string,
  finalData: GLReviewFormData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["gl-review-comparison"].data.finalReviewData = finalData

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update custom values for fields that were manually edited
 */
export async function updateCustomValues(
  dealId: string,
  customValues: GLReviewCustomValues
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["gl-review-comparison"].data.customValues = customValues

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Complete the comparison and move to Create Quote stage
 */
export async function submitComparisonAndMoveToQuote(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Complete the comparison stage
  existing.stages["gl-review-comparison"].data.comparisonCompletedAt = now
  existing.stages["gl-review-comparison"].data.movedToCreateQuoteAt = now
  existing.stages["gl-review-comparison"].status = "completed"
  existing.stages["gl-review-comparison"].completedAt = now

  // In the future, move to Create Quote stage
  // existing.currentStage = "create-quote"
  // existing.stages["create-quote"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Reset the comparison stage (go back to waiting for team review)
 */
export async function resetGLReviewComparison(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Keep the AI review data but reset everything else
  const aiReviewData = existing.stages["gl-review-comparison"].data.aiReviewData

  existing.stages["gl-review-comparison"].data = {
    teamReviewData: null,
    teamReviewSubmittedAt: null,
    teamReviewSubmittedBy: null,
    aiReviewData: aiReviewData,
    finalReviewData: null,
    fieldSelections: null,
    customValues: null,
    comparisonCompletedAt: null,
    movedToCreateQuoteAt: null
  }
  existing.stages["gl-review-comparison"].status = "in_progress"
  existing.stages["gl-review-comparison"].completedAt = null

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}
