"use client"

import {
  SalesPipelineTimelineState,
  SalesPipelineStageId,
  SalesPipelineStageStatus,
  SalesIntakeFormData,
  GLReviewFormData,
  GLReviewComparisonSelections,
  GLReviewCustomValues,
  QuoteLineItem,
  LostReason,
  createInitialTimelineState,
  createTestGLReviewFormData,
  createTestGLReviewFieldConfidence,
  createTestTeamGLReviewFormData
} from "./sales-pipeline-timeline-types"
import { updatePipelineDeal } from "./revops-pipeline-store"
import {
  replaceRevOpsFile,
  deleteRevOpsFilesByType,
  getRevOpsFileByType
} from "./supabase/revops-files"
import {
  fetchSalesIntakeByDealId,
  updateSalesIntakeSupabase,
  confirmSalesIntakeSupabase,
  deleteSalesIntakeSupabase
} from "./supabase/revops-sales-intakes"
import {
  fetchFollowUpEmailByDealId,
  initializeFollowUpEmailSupabase,
  updateFollowUpEmailSupabase,
  markFollowUpEmailSentSupabase,
  markHubspotDealMovedSupabase,
  deleteFollowUpEmailSupabase
} from "./supabase/revops-follow-up-emails"
import {
  getReminderSequenceData,
  initializeReminderSequence,
  markEnrolledInSequenceSupabase,
  markUnenrolledFromSequenceSupabase,
  markAccessReceivedSupabase,
  resetReminderSequenceSupabase,
  getInternalReviewData,
  initializeInternalReviewSupabase,
  updateInternalReviewSupabase,
  markInternalReviewSentSupabase,
  resetInternalReviewSupabase
} from "./supabase/revops-stage-data"
import type { RevOpsPipelineFile } from "./supabase/types"

// n8n webhook URLs
const SALES_INTAKE_AI_WEBHOOK_URL = "https://n8n.srv1055749.hstgr.cloud/webhook/sales-intake-ai"
const INTERNAL_ASSIGNMENT_WEBHOOK_URL = "https://n8n.srv1055749.hstgr.cloud/webhook/revops-internal-assignment"

const TIMELINE_STORAGE_KEY = "revops-pipeline-timelines"
const FILES_STORAGE_KEY = "revops-pipeline-files" // Kept for backward compatibility migration

// Mapping from stage IDs to display names for automation stage
const STAGE_ID_TO_DISPLAY_NAME: Record<SalesPipelineStageId, string> = {
  "demo-call": "Demo Call",
  "sales-intake": "Sales Intake",
  "follow-up-email": "Follow-Up Email",
  "reminder-sequence": "Reminder Sequence",
  "internal-review": "Internal Team Assignment",
  "gl-review": "General Ledger Review",
  "gl-review-comparison": "GL Review Comparison",
  "create-quote": "Create Quote",
  "quote-sent": "Quote Sent",
  "quote-approved": "Quote Approved",
  "prepare-engagement": "Prepare Engagement Walkthrough",
  "internal-engagement-review": "EA Internal Review",
  "send-engagement": "Send Engagement",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
}

/**
 * Update the deal's automation stage to match the current timeline stage
 */
async function updateDealAutomationStage(dealId: string, stageId: SalesPipelineStageId): Promise<void> {
  const displayName = STAGE_ID_TO_DISPLAY_NAME[stageId]
  if (displayName) {
    await updatePipelineDeal(dealId, { stage: displayName })
  }
}

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
          toEmail: "",
          ccEmail: "",
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

    // Migrate existing follow-up-email data to add ccEmail if missing
    if (existing.stages["follow-up-email"]?.data && !("ccEmail" in existing.stages["follow-up-email"].data)) {
      existing.stages["follow-up-email"].data.ccEmail = ""
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

    // Migrate existing deals to add create-quote stage if missing
    if (!existing.stages["create-quote"]) {
      existing.stages["create-quote"] = {
        status: "pending",
        completedAt: null,
        data: {
          accountingMonthlyPrice: null,
          accountingPriceCalculatedAt: null,
          accountingPriceBreakdown: null,
          lineItems: [],
          isEdited: false,
          hubspotSynced: false,
          hubspotSyncedAt: null,
          hubspotQuoteLink: null,
          hubspotQuotePdfUrl: null,
          quoteConfirmedAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing create-quote stage to add new HubSpot fields if missing
    if (existing.stages["create-quote"] && existing.stages["create-quote"].data.hubspotQuoteLink === undefined) {
      existing.stages["create-quote"].data.hubspotQuoteLink = null
      existing.stages["create-quote"].data.hubspotQuotePdfUrl = null
      needsSave = true
    }

    // Migrate existing deals to add quote-sent stage if missing
    if (!existing.stages["quote-sent"]) {
      existing.stages["quote-sent"] = {
        status: "pending",
        completedAt: null,
        data: {
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          sentTo: "",
          followUpSequenceStarted: false,
          followUpSequenceStartedAt: null,
          nextFollowUpAt: null,
          followUpCount: 0,
          prospectRespondedAt: null,
          responseType: null
        }
      }
      needsSave = true
    }

    // Migrate existing deals to add quote-approved stage if missing
    if (!existing.stages["quote-approved"]) {
      existing.stages["quote-approved"] = {
        status: "pending",
        completedAt: null,
        data: {
          approvedAt: null,
          approvedBy: null,
          approvalNotes: "",
          acknowledgmentSentAt: null,
          movedToEngagementAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing deals to add prepare-engagement stage if missing
    if (!existing.stages["prepare-engagement"]) {
      existing.stages["prepare-engagement"] = {
        status: "pending",
        completedAt: null,
        data: {
          walkthroughText: "",
          walkthroughGeneratedAt: null,
          isGenerating: false,
          isEdited: false,
          walkthroughConfirmedAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing prepare-engagement stage to new walkthrough format
    if (existing.stages["prepare-engagement"] && (existing.stages["prepare-engagement"].data as unknown as Record<string, unknown>).ignitionDraftStarted !== undefined) {
      existing.stages["prepare-engagement"].data = {
        walkthroughText: "",
        walkthroughGeneratedAt: null,
        isGenerating: false,
        isEdited: false,
        walkthroughConfirmedAt: null
      }
      needsSave = true
    }

    // Migrate existing deals to add internal-engagement-review stage if missing
    if (!existing.stages["internal-engagement-review"]) {
      existing.stages["internal-engagement-review"] = {
        status: "pending",
        completedAt: null,
        data: {
          recipients: [],
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          readyToSendAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing internal-engagement-review stage to new email format
    if (existing.stages["internal-engagement-review"] && (existing.stages["internal-engagement-review"].data as unknown as Record<string, unknown>).reviewInProgress !== undefined) {
      existing.stages["internal-engagement-review"].data = {
        recipients: [],
        emailSubject: "",
        emailBody: "",
        isEdited: false,
        sentAt: null,
        readyToSendAt: null
      }
      needsSave = true
    }

    // Migrate existing deals to add send-engagement stage if missing
    if (!existing.stages["send-engagement"]) {
      existing.stages["send-engagement"] = {
        status: "pending",
        completedAt: null,
        data: {
          customerEmailSubject: "",
          customerEmailBody: "",
          isEdited: false,
          sentViaHubspotAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing send-engagement stage to new simplified format
    if (existing.stages["send-engagement"] && (existing.stages["send-engagement"].data as unknown as Record<string, unknown>).ignitionSentAt !== undefined) {
      existing.stages["send-engagement"].data = {
        customerEmailSubject: (existing.stages["send-engagement"].data as unknown as Record<string, unknown>).customerEmailSubject as string || "",
        customerEmailBody: (existing.stages["send-engagement"].data as unknown as Record<string, unknown>).customerEmailBody as string || "",
        isEdited: false,
        sentViaHubspotAt: null
      }
      needsSave = true
    }

    // Migrate existing deals to add closed-won stage if missing
    if (!existing.stages["closed-won"]) {
      existing.stages["closed-won"] = {
        status: "pending",
        completedAt: null,
        data: {
          closedAt: null,
          finalDealValue: null,
          servicesIncluded: [],
          closingNotes: "",
          hubspotSynced: false,
          hubspotSyncedAt: null
        }
      }
      needsSave = true
    }

    // Migrate existing deals to add closed-lost stage if missing
    if (!existing.stages["closed-lost"]) {
      existing.stages["closed-lost"] = {
        status: "pending",
        completedAt: null,
        data: {
          closedAt: null,
          lostReason: null,
          lostReasonDetails: "",
          lostFromStage: null,
          hubspotSynced: false,
          hubspotSyncedAt: null
        }
      }
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

  // Save the actual file to Supabase if provided (replaceRevOpsFile handles existing files)
  if (file) {
    try {
      await replaceRevOpsFile(dealId, 'revops-demo-call-transcript', file, 'User')
    } catch (error) {
      console.error('Error uploading demo transcript to Supabase:', error)
      // Continue with state update even if upload fails
    }
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

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "sales-intake")

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

  // Delete the file from Supabase
  try {
    await deleteRevOpsFilesByType(dealId, 'revops-demo-call-transcript')
  } catch (error) {
    console.error('Error deleting demo transcript from Supabase:', error)
    // Continue with state update even if delete fails
  }

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

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "demo-call")

  return existing
}

/**
 * Get demo transcript file from Supabase
 */
export async function getDemoTranscriptFile(
  dealId: string
): Promise<RevOpsPipelineFile | null> {
  try {
    return await getRevOpsFileByType(dealId, 'revops-demo-call-transcript')
  } catch (error) {
    console.error('Error getting demo transcript from Supabase:', error)
    return null
  }
}

/**
 * Sync localStorage state with Supabase file (used when localStorage was cleared)
 * This only updates localStorage state - does NOT upload to Supabase
 */
export async function syncDemoTranscriptState(
  dealId: string,
  fileName: string,
  uploadedAt: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Only update state - do NOT upload file (it already exists in Supabase)
  existing.stages["demo-call"].status = "completed"
  existing.stages["demo-call"].completedAt = uploadedAt
  existing.stages["demo-call"].data.transcriptUploaded = true
  existing.stages["demo-call"].data.transcriptFileName = fileName
  existing.stages["demo-call"].data.transcriptUploadedAt = uploadedAt

  // Move to sales-intake stage
  existing.currentStage = "sales-intake"
  existing.stages["sales-intake"].status = "in_progress"

  existing.updatedAt = new Date().toISOString()

  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "sales-intake")

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
 * Trigger AI auto-fill for sales intake via n8n webhook
 * Returns true if webhook was triggered successfully
 * The actual data will be populated by the n8n workflow into Supabase
 */
export async function triggerSalesIntakeAI(
  dealId: string
): Promise<boolean> {
  try {
    const response = await fetch(SALES_INTAKE_AI_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deal_id: dealId })
    })

    if (!response.ok) {
      console.error('Failed to trigger sales intake AI:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('Error triggering sales intake AI:', error)
    return false
  }
}

/**
 * Load sales intake data from Supabase and sync to localStorage
 * Returns the form data if found, null otherwise
 */
export async function loadSalesIntakeFromSupabase(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  try {
    const intakeData = await fetchSalesIntakeByDealId(dealId)

    if (!intakeData) {
      return null
    }

    // Sync Supabase data to localStorage state
    const timelines = getAllTimelines()
    const existing = timelines[dealId]

    if (!existing) return null

    existing.stages["sales-intake"].data = {
      formData: intakeData.formData,
      isAutoFilled: intakeData.isAutoFilled,
      autoFilledAt: intakeData.autoFilledAt,
      confirmedAt: intakeData.confirmedAt,
      fieldConfidence: intakeData.fieldConfidence
    }

    if (intakeData.isAutoFilled && !intakeData.isConfirmed) {
      existing.stages["sales-intake"].status = "in_progress"
    } else if (intakeData.isConfirmed) {
      existing.stages["sales-intake"].status = "completed"
      existing.stages["sales-intake"].completedAt = intakeData.confirmedAt
    }

    existing.updatedAt = new Date().toISOString()
    saveAllTimelines(timelines)

    return existing
  } catch (error) {
    console.error('Error loading sales intake from Supabase:', error)
    return null
  }
}

/**
 * Update sales intake form data (for user edits)
 * Updates both localStorage and Supabase
 */
export async function updateSalesIntakeForm(
  dealId: string,
  formData: SalesIntakeFormData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Update localStorage
  existing.stages["sales-intake"].data = {
    ...existing.stages["sales-intake"].data,
    formData
  }

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update Supabase (async, don't block on errors)
  try {
    await updateSalesIntakeSupabase(dealId, formData)
  } catch (error) {
    console.error('Error updating sales intake in Supabase:', error)
    // Continue - localStorage is already updated
  }

  return existing
}

/**
 * Confirm sales intake form (complete the stage)
 * Updates both localStorage and Supabase
 */
export async function confirmSalesIntake(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Update localStorage
  existing.stages["sales-intake"].data.confirmedAt = now
  existing.stages["sales-intake"].status = "completed"
  existing.stages["sales-intake"].completedAt = now

  // Move to follow-up-email stage
  existing.currentStage = "follow-up-email"
  existing.stages["follow-up-email"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update Supabase - save final form data and mark as confirmed
  try {
    const formData = existing.stages["sales-intake"].data.formData
    if (formData) {
      await updateSalesIntakeSupabase(dealId, formData)
    }
    await confirmSalesIntakeSupabase(dealId)
  } catch (error) {
    console.error('Error confirming sales intake in Supabase:', error)
    // Continue - localStorage is already updated
  }

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "follow-up-email")

  return existing
}

/**
 * Reset sales intake form (clear data and go back to action-required)
 * Clears both localStorage and Supabase
 */
export async function resetSalesIntake(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Reset localStorage
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

  // Delete from Supabase
  try {
    await deleteSalesIntakeSupabase(dealId)
  } catch (error) {
    console.error('Error deleting sales intake from Supabase:', error)
    // Continue - localStorage is already reset
  }

  return existing
}

// ============================================
// Follow-Up Email Stage Functions
// ============================================

/**
 * Load follow-up email data from Supabase
 * Returns the state with follow-up email data loaded from database
 */
export async function loadFollowUpEmailFromSupabase(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  try {
    const emailData = await fetchFollowUpEmailByDealId(dealId)

    if (!emailData) {
      return null
    }

    // Get current timeline state
    const timelines = getAllTimelines()
    const existing = timelines[dealId]

    if (!existing) return null

    // Update state from Supabase data
    existing.stages["follow-up-email"].data = {
      templateType: emailData.templateType,
      toEmail: emailData.toEmail,
      ccEmail: emailData.ccEmail,
      emailSubject: emailData.emailSubject,
      emailBody: emailData.emailBody,
      isEdited: emailData.isEdited,
      sentAt: emailData.sentAt,
      hubspotDealMoved: emailData.hubspotDealMoved,
      hubspotDealMovedAt: emailData.hubspotDealMovedAt
    }

    // Update stage status based on data
    if (emailData.sentAt) {
      existing.stages["follow-up-email"].status = "completed"
      existing.stages["follow-up-email"].completedAt = emailData.sentAt
    } else if (emailData.templateType) {
      existing.stages["follow-up-email"].status = "in_progress"
    }

    existing.updatedAt = new Date().toISOString()

    // Save to localStorage for cache
    saveAllTimelines(timelines)

    return existing
  } catch (error) {
    console.error('Error loading follow-up email from Supabase:', error)
    return null
  }
}

/**
 * Initialize follow-up email with template based on accounting platform
 * Stores data in Supabase (source of truth)
 */
export async function initializeFollowUpEmail(
  dealId: string,
  templateType: "qbo" | "xero" | "other",
  toEmail: string,
  ccEmail: string,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Store in Supabase (source of truth)
  try {
    await initializeFollowUpEmailSupabase(dealId, templateType, toEmail, ccEmail, subject, body)
  } catch (error) {
    console.error('Error initializing follow-up email in Supabase:', error)
    throw error
  }

  // Update local state for immediate UI response
  existing.stages["follow-up-email"].data = {
    templateType,
    toEmail,
    ccEmail,
    emailSubject: subject,
    emailBody: body,
    isEdited: false,
    sentAt: null,
    hubspotDealMoved: false,
    hubspotDealMovedAt: null
  }

  existing.updatedAt = new Date().toISOString()

  // Save to localStorage for cache
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update follow-up email content (for user edits)
 * Stores data in Supabase (source of truth)
 */
export async function updateFollowUpEmail(
  dealId: string,
  toEmail: string,
  ccEmail: string,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Store in Supabase (source of truth)
  try {
    await updateFollowUpEmailSupabase(dealId, toEmail, ccEmail, subject, body)
  } catch (error) {
    console.error('Error updating follow-up email in Supabase:', error)
    throw error
  }

  // Update local state for immediate UI response
  existing.stages["follow-up-email"].data.toEmail = toEmail
  existing.stages["follow-up-email"].data.ccEmail = ccEmail
  existing.stages["follow-up-email"].data.emailSubject = subject
  existing.stages["follow-up-email"].data.emailBody = body
  existing.stages["follow-up-email"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()

  // Save to localStorage for cache
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
 * Stores data in Supabase (source of truth)
 */
export async function markFollowUpEmailSent(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date()
  const nowISO = now.toISOString()

  // Store in Supabase (source of truth)
  try {
    await markFollowUpEmailSentSupabase(dealId)
  } catch (error) {
    console.error('Error marking follow-up email as sent in Supabase:', error)
    throw error
  }

  // Update local state for immediate UI response
  existing.stages["follow-up-email"].data.sentAt = nowISO
  existing.stages["follow-up-email"].status = "completed"
  existing.stages["follow-up-email"].completedAt = nowISO

  // Move to reminder-sequence stage (manual enrollment only - no auto-scheduling)
  existing.currentStage = "reminder-sequence"
  existing.stages["reminder-sequence"].status = "in_progress"
  existing.stages["reminder-sequence"].data.status = "not_enrolled"

  // Set platform based on accounting platform from sales intake
  const accountingPlatform = existing.stages["sales-intake"].data.formData?.accountingPlatform
  let platform: "qbo" | "xero" | "other"
  if (accountingPlatform === "qbo" || accountingPlatform === "xero") {
    platform = accountingPlatform
  } else {
    platform = "other"
  }
  existing.stages["reminder-sequence"].data.platform = platform

  // Initialize reminder sequence in Supabase (source of truth)
  await initializeReminderSequence(dealId, platform)

  existing.updatedAt = nowISO

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "reminder-sequence")

  // Save to localStorage for cache
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark HubSpot deal as moved to Need Info
 * Stores data in Supabase (source of truth)
 */
export async function markHubspotDealMoved(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Store in Supabase (source of truth)
  try {
    await markHubspotDealMovedSupabase(dealId)
  } catch (error) {
    console.error('Error marking HubSpot deal as moved in Supabase:', error)
    throw error
  }

  // Update local state for immediate UI response
  existing.stages["follow-up-email"].data.hubspotDealMoved = true
  existing.stages["follow-up-email"].data.hubspotDealMovedAt = now

  existing.updatedAt = now

  // Save to localStorage for cache
  saveAllTimelines(timelines)

  return existing
}

/**
 * Reset follow-up email stage
 * Deletes from Supabase and resets local state
 */
export async function resetFollowUpEmail(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Delete from Supabase (source of truth)
  try {
    await deleteFollowUpEmailSupabase(dealId)
  } catch (error) {
    console.error('Error deleting follow-up email from Supabase:', error)
    // Continue - still reset local state
  }

  // Update local state
  existing.stages["follow-up-email"].data = {
    templateType: null,
    toEmail: "",
    ccEmail: "",
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

  // Save to localStorage for cache
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// Reminder Sequence Stage Functions
// ============================================

export interface EnrollSequenceResult {
  success: boolean
  sequenceId?: string
  sequenceName?: string
  contactId?: string
  error?: string
  requiresManualFollowUp?: boolean
}

export interface UnenrollSequenceResult {
  success: boolean
  wasEnrolled?: boolean
  error?: string
}

/**
 * Mark contact as enrolled in HubSpot sequence (manual tracking only)
 * The user will manually enroll the contact in HubSpot via the sequence link
 */
export async function enrollInSequence(
  dealId: string
): Promise<void> {
  console.log('Marking contact as enrolled for deal:', dealId)

  // Update Supabase
  await markEnrolledInSequenceSupabase(dealId)

  // Update local timeline state
  const timelines = getAllTimelines()
  const existing = timelines[dealId]
  if (existing) {
    const now = new Date().toISOString()
    existing.stages["reminder-sequence"].data.status = "enrolled"
    existing.stages["reminder-sequence"].data.enrolledAt = now
    existing.updatedAt = now
    saveAllTimelines(timelines)
  }
}

/**
 * Mark contact as unenrolled from HubSpot sequence (without access received)
 * Used when user wants to unenroll before client grants access
 */
export async function unenrollFromSequence(
  dealId: string
): Promise<void> {
  console.log('Marking contact as unenrolled for deal:', dealId)

  // Update Supabase
  await markUnenrolledFromSequenceSupabase(dealId)

  // Update local timeline state
  const timelines = getAllTimelines()
  const existing = timelines[dealId]
  if (existing) {
    const now = new Date().toISOString()
    existing.stages["reminder-sequence"].data.status = "not_enrolled"
    existing.stages["reminder-sequence"].data.unenrolledAt = now
    existing.updatedAt = now
    saveAllTimelines(timelines)
  }
}

/**
 * Mark accounting access as received
 * 1. Updates Supabase
 * 2. Advances to internal-review stage
 * (Unenrollment from HubSpot is handled manually by the user)
 */
export async function markAccessReceived(
  dealId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Marking access received for deal:', dealId)

    // 1. Update Supabase
    await markAccessReceivedSupabase(dealId)

    // 2. Update local timeline state and advance to next stage
    const timelines = getAllTimelines()
    const existing = timelines[dealId]
    if (existing) {
      const now = new Date().toISOString()

      // Update reminder-sequence stage
      existing.stages["reminder-sequence"].data.status = "access_received"
      existing.stages["reminder-sequence"].data.accessReceivedAt = now
      existing.stages["reminder-sequence"].data.unenrolledAt = now
      existing.stages["reminder-sequence"].status = "completed"
      existing.stages["reminder-sequence"].completedAt = now

      // Move to internal-review stage
      existing.currentStage = "internal-review"
      existing.stages["internal-review"].status = "in_progress"

      existing.updatedAt = now
      saveAllTimelines(timelines)

      // Update deal's automation stage
      await updateDealAutomationStage(dealId, "internal-review")
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking access received:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Load reminder sequence data from Supabase and update local state
 */
export async function loadReminderSequenceData(
  dealId: string
): Promise<void> {
  try {
    const data = await getReminderSequenceData(dealId)

    const timelines = getAllTimelines()
    const existing = timelines[dealId]
    if (existing) {
      // Update data from Supabase
      existing.stages["reminder-sequence"].data = {
        status: data.status,
        platform: data.platform,
        enrolledAt: data.enrolledAt,
        unenrolledAt: data.unenrolledAt,
        accessReceivedAt: data.accessReceivedAt
      }

      // Also update stage status based on access received
      if (data.status === "access_received" && data.accessReceivedAt) {
        existing.stages["reminder-sequence"].status = "completed"
        existing.stages["reminder-sequence"].completedAt = data.accessReceivedAt
      } else if (data.status || data.platform) {
        // If we have any data, stage should be in_progress at minimum
        if (existing.stages["reminder-sequence"].status === "pending") {
          existing.stages["reminder-sequence"].status = "in_progress"
        }
      }

      saveAllTimelines(timelines)
    }
  } catch (error) {
    console.error('Error loading reminder sequence data:', error)
  }
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

  // Reset Supabase data
  await resetReminderSequenceSupabase(dealId)

  // Reset local state
  existing.stages["reminder-sequence"].data = {
    status: "not_enrolled",
    platform: null,
    enrolledAt: null,
    unenrolledAt: null,
    accessReceivedAt: null
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
 * Load internal review data from Supabase and update local state
 */
export async function loadInternalReviewData(
  dealId: string
): Promise<void> {
  try {
    const data = await getInternalReviewData(dealId)

    const timelines = getAllTimelines()
    const existing = timelines[dealId]
    if (existing && data) {
      // Update data from Supabase
      existing.stages["internal-review"].data = {
        recipients: data.toRecipients,
        ccTimEnabled: data.ccTimEnabled,
        emailSubject: data.emailSubject,
        emailBody: data.emailBody,
        isEdited: data.isEdited,
        sentAt: data.sentAt,
        reviewAssignedTo: data.toRecipients.map(r => r.email),
        reviewCompletedAt: null,
        reviewNotes: null
      }

      // Also update stage status based on sentAt
      if (data.sentAt) {
        existing.stages["internal-review"].status = "completed"
        existing.stages["internal-review"].completedAt = data.sentAt

        // If internal review is complete, gl-review should be in_progress
        if (existing.stages["gl-review"].status === "pending") {
          existing.stages["gl-review"].status = "in_progress"
          existing.currentStage = "gl-review"
        }
      } else if (data.emailBody) {
        // If we have email body, stage should be in_progress at minimum
        if (existing.stages["internal-review"].status === "pending") {
          existing.stages["internal-review"].status = "in_progress"
        }
      }

      saveAllTimelines(timelines)
    }
  } catch (error) {
    console.error('Error loading internal review data:', error)
  }
}

/**
 * Initialize internal review email with template
 * Only initializes if no data exists in Supabase (prevents overwriting edits)
 */
export async function initializeInternalReview(
  dealId: string,
  recipients: { name: string; email: string }[],
  ccTimEnabled: boolean,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  // Check if data already exists in Supabase before initializing
  const existingData = await getInternalReviewData(dealId)
  if (existingData && existingData.emailBody) {
    console.log("Internal review data already exists in Supabase, skipping initialization")
    // Load existing data instead of overwriting
    await loadInternalReviewData(dealId)
    const timelines = getAllTimelines()
    return timelines[dealId] || null
  }

  // Save to Supabase (only if no existing data)
  await initializeInternalReviewSupabase(dealId, recipients, ccTimEnabled, subject, body)

  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["internal-review"].data = {
    recipients,
    ccTimEnabled,
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
  ccTimEnabled: boolean,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  // Save to Supabase
  await updateInternalReviewSupabase(dealId, recipients, ccTimEnabled, subject, body)

  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["internal-review"].data.recipients = recipients
  existing.stages["internal-review"].data.ccTimEnabled = ccTimEnabled
  existing.stages["internal-review"].data.emailSubject = subject
  existing.stages["internal-review"].data.emailBody = body
  existing.stages["internal-review"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark internal review email as sent - calls n8n webhook to send the email
 */
export async function markInternalReviewSent(
  dealId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call n8n webhook to send the email
    const response = await fetch(INTERNAL_ASSIGNMENT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deal_id: dealId })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to send internal assignment email")
    }

    // Update Supabase
    await markInternalReviewSentSupabase(dealId)

    // Update localStorage
    const timelines = getAllTimelines()
    const existing = timelines[dealId]

    if (!existing) {
      return { success: true } // Email sent but no local state to update
    }

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

    // Update deal's automation stage
    await updateDealAutomationStage(dealId, "gl-review")

    return { success: true }
  } catch (error) {
    console.error("Error sending internal assignment email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    }
  }
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
  // Reset Supabase data
  await resetInternalReviewSupabase(dealId)

  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["internal-review"].data = {
    recipients: [],
    ccTimEnabled: true,
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

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "gl-review-comparison")

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

  // Move to Create Quote stage
  existing.currentStage = "create-quote"
  existing.stages["create-quote"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "create-quote")

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

// ============================================
// Create Quote Stage Functions
// ============================================

/**
 * Placeholder pricing calculator - returns a mock price based on GL Review data
 * In production, this would be replaced with actual pricing logic
 */
function calculatePlaceholderPrice(finalReviewData: GLReviewFormData | null): {
  price: number
  breakdown: string
} {
  if (!finalReviewData) {
    return { price: 0, breakdown: "No review data available" }
  }

  // Count filled accounts
  const accountCount = finalReviewData.accounts.filter(a => a.name.trim() !== "").length

  // Count eCommerce platforms
  const ecommerceCount = Object.values(finalReviewData.ecommerce).filter(v => v && v !== "").length

  // Base price calculation (placeholder logic)
  let basePrice = 500
  basePrice += accountCount * 50  // $50 per account
  basePrice += ecommerceCount * 100  // $100 per eCommerce platform

  // Adjust for catchup bookkeeping
  if (finalReviewData.catchupRequired === "yes") {
    basePrice += 200
  }

  // Adjust for revenue allocations
  if (finalReviewData.revenueCoaAllocations === ">5") {
    basePrice += 150
  } else if (finalReviewData.revenueCoaAllocations === "3-5") {
    basePrice += 75
  }

  const breakdown = `Base: $500 + Accounts (${accountCount} × $50) + eCommerce (${ecommerceCount} × $100)` +
    (finalReviewData.catchupRequired === "yes" ? " + Catchup: $200" : "") +
    (finalReviewData.revenueCoaAllocations === ">5" ? " + Custom COA: $150" :
     finalReviewData.revenueCoaAllocations === "3-5" ? " + COA Allocations: $75" : "")

  return { price: basePrice, breakdown }
}

/**
 * Initialize create quote stage with calculated pricing
 */
export async function initializeCreateQuote(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Get the final review data from comparison stage
  const finalReviewData = existing.stages["gl-review-comparison"].data.finalReviewData

  // Calculate placeholder price
  const { price, breakdown } = calculatePlaceholderPrice(finalReviewData)

  // Create initial line item for accounting services
  const accountingLineItem: QuoteLineItem = {
    id: `line-${Date.now()}`,
    service: "Monthly Accounting Services",
    description: "Full-service bookkeeping and accounting",
    monthlyPrice: price,
    isCustom: false
  }

  existing.stages["create-quote"].data = {
    accountingMonthlyPrice: price,
    accountingPriceCalculatedAt: now,
    accountingPriceBreakdown: breakdown,
    lineItems: [accountingLineItem],
    isEdited: false,
    hubspotSynced: false,
    hubspotSyncedAt: null,
    quoteConfirmedAt: null
  }

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Add a line item to the quote
 */
export async function addQuoteLineItem(
  dealId: string,
  service: string,
  description: string,
  monthlyPrice: number
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  const newLineItem: QuoteLineItem = {
    id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    service,
    description,
    monthlyPrice,
    isCustom: true
  }

  existing.stages["create-quote"].data.lineItems.push(newLineItem)
  existing.stages["create-quote"].data.isEdited = true

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update a line item in the quote
 */
export async function updateQuoteLineItem(
  dealId: string,
  lineItemId: string,
  updates: Partial<QuoteLineItem>
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  const index = existing.stages["create-quote"].data.lineItems.findIndex(item => item.id === lineItemId)
  if (index === -1) return null

  existing.stages["create-quote"].data.lineItems[index] = {
    ...existing.stages["create-quote"].data.lineItems[index],
    ...updates
  }
  existing.stages["create-quote"].data.isEdited = true

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Remove a line item from the quote
 */
export async function removeQuoteLineItem(
  dealId: string,
  lineItemId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["create-quote"].data.lineItems =
    existing.stages["create-quote"].data.lineItems.filter(item => item.id !== lineItemId)
  existing.stages["create-quote"].data.isEdited = true

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Push quote to HubSpot and create quote with link/PDF
 */
export async function pushQuoteToHubspot(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // In production, this would call the HubSpot API
  // For now, we generate placeholder links
  const quoteId = `QT-${Date.now()}`

  existing.stages["create-quote"].data.hubspotSynced = true
  existing.stages["create-quote"].data.hubspotSyncedAt = now
  existing.stages["create-quote"].data.hubspotQuoteLink = `https://app.hubspot.com/quotes/${quoteId}`
  existing.stages["create-quote"].data.hubspotQuotePdfUrl = `https://app.hubspot.com/quotes/${quoteId}/pdf`

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Confirm quote and move to Quote Sent stage
 */
export async function confirmQuoteAndMoveToSent(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["create-quote"].data.quoteConfirmedAt = now
  existing.stages["create-quote"].status = "completed"
  existing.stages["create-quote"].completedAt = now

  // Move to Quote Sent stage
  existing.currentStage = "quote-sent"
  existing.stages["quote-sent"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "quote-sent")

  return existing
}

// ============================================
// Quote Sent Stage Functions
// ============================================

/**
 * Initialize quote sent email
 */
export async function initializeQuoteSentEmail(
  dealId: string,
  recipientEmail: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Get company and contact name from sales intake
  const salesIntake = existing.stages["sales-intake"].data.formData
  const companyName = salesIntake?.companyName || "your company"
  const contactName = salesIntake?.contactName || "there"

  // Calculate total monthly price
  const totalMonthly = existing.stages["create-quote"].data.lineItems
    .reduce((sum, item) => sum + item.monthlyPrice, 0)

  // Build services list
  const servicesList = existing.stages["create-quote"].data.lineItems
    .map(item => `• ${item.service}: $${item.monthlyPrice}/month`)
    .join("\n")

  const subject = `Growth Lab Proposal for ${companyName}`
  const body = `Hi ${contactName},

Thank you for your interest in Growth Lab Financial. Based on our review, I'm pleased to share our proposal for ${companyName}.

Proposed Services:
${servicesList}

Total Monthly Investment: $${totalMonthly}/month

If this looks good, just reply to this email and I'll prepare the engagement agreement for your review.

Please let me know if you have any questions!

Best regards,
Tim`

  existing.stages["quote-sent"].data.emailSubject = subject
  existing.stages["quote-sent"].data.emailBody = body
  existing.stages["quote-sent"].data.sentTo = recipientEmail

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update quote sent email content
 */
export async function updateQuoteSentEmail(
  dealId: string,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["quote-sent"].data.emailSubject = subject
  existing.stages["quote-sent"].data.emailBody = body
  existing.stages["quote-sent"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark quote email as sent and start follow-up sequence
 */
export async function markQuoteEmailSent(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date()
  const nowISO = now.toISOString()

  existing.stages["quote-sent"].data.sentAt = nowISO
  existing.stages["quote-sent"].data.followUpSequenceStarted = true
  existing.stages["quote-sent"].data.followUpSequenceStartedAt = nowISO
  existing.stages["quote-sent"].data.nextFollowUpAt = addBusinessDays(now, 3).toISOString()
  existing.stages["quote-sent"].data.followUpCount = 0

  existing.updatedAt = nowISO
  saveAllTimelines(timelines)

  return existing
}

/**
 * Record prospect response to quote
 */
export async function recordQuoteResponse(
  dealId: string,
  responseType: "approved" | "declined"
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["quote-sent"].data.prospectRespondedAt = now
  existing.stages["quote-sent"].data.responseType = responseType
  existing.stages["quote-sent"].data.followUpSequenceStarted = false  // Stop follow-ups

  if (responseType === "approved") {
    // Complete this stage and skip Quote Approved - go directly to Prepare Engagement
    existing.stages["quote-sent"].status = "completed"
    existing.stages["quote-sent"].completedAt = now

    // Skip Quote Approved stage
    existing.stages["quote-approved"].status = "skipped"
    existing.stages["quote-approved"].completedAt = now
    existing.stages["quote-approved"].data.approvedAt = now
    existing.stages["quote-approved"].data.movedToEngagementAt = now

    // Move to Prepare Engagement
    existing.currentStage = "prepare-engagement"
    existing.stages["prepare-engagement"].status = "in_progress"

    existing.updatedAt = now
    saveAllTimelines(timelines)

    // Update deal's automation stage
    await updateDealAutomationStage(dealId, "prepare-engagement")
  } else if (responseType === "declined") {
    // Complete quote-sent stage
    existing.stages["quote-sent"].status = "completed"
    existing.stages["quote-sent"].completedAt = now

    // Mark all remaining stages as N/A (skipped)
    const stagesToSkip: (keyof typeof existing.stages)[] = [
      "quote-approved",
      "prepare-engagement",
      "internal-engagement-review",
      "send-engagement",
      "closed-won"
    ]

    for (const stageId of stagesToSkip) {
      existing.stages[stageId].status = "skipped"
    }

    // Move to Closed Lost
    existing.currentStage = "closed-lost"
    existing.stages["closed-lost"].status = "in_progress"
    existing.stages["closed-lost"].data.lostFromStage = "quote-sent"
    existing.stages["closed-lost"].data.lostReason = "declined"
    existing.stages["closed-lost"].data.closedAt = now

    existing.updatedAt = now
    saveAllTimelines(timelines)

    // Update deal's automation stage
    await updateDealAutomationStage(dealId, "closed-lost")
  } else {
    existing.updatedAt = now
    saveAllTimelines(timelines)
  }

  return existing
}

// ============================================
// Quote Approved Stage Functions
// ============================================

/**
 * Update approval notes
 */
export async function updateQuoteApprovalNotes(
  dealId: string,
  notes: string,
  approvedBy?: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["quote-approved"].data.approvalNotes = notes
  if (approvedBy) {
    existing.stages["quote-approved"].data.approvedBy = approvedBy
  }

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Send acknowledgment email (placeholder)
 */
export async function sendQuoteAcknowledgment(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["quote-approved"].data.acknowledgmentSentAt = now

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Move to Prepare Engagement stage
 */
export async function moveToPreparingEngagement(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["quote-approved"].data.movedToEngagementAt = now
  existing.stages["quote-approved"].status = "completed"
  existing.stages["quote-approved"].completedAt = now

  existing.currentStage = "prepare-engagement"
  existing.stages["prepare-engagement"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "prepare-engagement")

  return existing
}

// ============================================
// Prepare Engagement Walkthrough Stage Functions
// ============================================

/**
 * Generate walkthrough placeholder text based on quote and sales data
 */
function generateWalkthroughText(
  companyName: string,
  contactName: string,
  lineItems: { service: string; monthlyPrice: number }[]
): string {
  const totalMonthly = lineItems.reduce((sum, item) => sum + item.monthlyPrice, 0)
  const servicesList = lineItems.map(item => `- ${item.service}: $${item.monthlyPrice}/month`).join("\n")

  return `ENGAGEMENT WALKTHROUGH
For: ${companyName}

Dear ${contactName},

Thank you for choosing Growth Lab Financial. This document outlines our engagement and what you can expect as our client.

SERVICES INCLUDED:
${servicesList}

TOTAL MONTHLY INVESTMENT: $${totalMonthly}/month

WHAT HAPPENS NEXT:
1. Onboarding Call - We'll schedule a 30-minute call to gather your login credentials and understand your current setup.

2. Data Migration - Our team will review your existing books and set up proper chart of accounts.

3. Monthly Process - You'll receive:
   • Monthly financial statements by the 15th
   • Quarterly check-in calls
   • Unlimited email support

TERMS:
- Billing: Monthly, due on the 1st
- Start Date: Upon signature
- Cancellation: 30-day notice required

We're excited to partner with ${companyName} and help you focus on growing your business while we handle the numbers.

Please review this walkthrough carefully. Once approved, we'll send the formal engagement agreement for signature.

Best regards,
The Growth Lab Team`
}

/**
 * Start generating walkthrough with AI (placeholder - sets generating state)
 */
export async function startWalkthroughGeneration(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["prepare-engagement"].data.isGenerating = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Complete walkthrough generation - generates the actual text
 */
export async function completeWalkthroughGeneration(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Get data for walkthrough
  const salesIntake = existing.stages["sales-intake"].data.formData
  const companyName = salesIntake?.companyName || "Company"
  const contactName = salesIntake?.contactName || "Valued Client"
  const lineItems = existing.stages["create-quote"].data.lineItems

  // Generate walkthrough text
  const walkthroughText = generateWalkthroughText(companyName, contactName, lineItems)

  existing.stages["prepare-engagement"].data.walkthroughText = walkthroughText
  existing.stages["prepare-engagement"].data.walkthroughGeneratedAt = now
  existing.stages["prepare-engagement"].data.isGenerating = false

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update walkthrough text (for user edits)
 */
export async function updateWalkthroughText(
  dealId: string,
  text: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["prepare-engagement"].data.walkthroughText = text
  existing.stages["prepare-engagement"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Confirm walkthrough and move to EA Internal Review stage
 */
export async function confirmWalkthroughAndMoveToReview(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["prepare-engagement"].data.walkthroughConfirmedAt = now
  existing.stages["prepare-engagement"].status = "completed"
  existing.stages["prepare-engagement"].completedAt = now

  // Move to EA Internal Review
  existing.currentStage = "internal-engagement-review"
  existing.stages["internal-engagement-review"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "internal-engagement-review")

  return existing
}

// ============================================
// EA Internal Review Stage Functions
// ============================================

/**
 * Generate internal review email template
 */
function generateEAInternalReviewEmail(
  companyName: string,
  contactName: string,
  totalMonthly: number,
  walkthroughText: string
): { subject: string; body: string } {
  return {
    subject: `Engagement Review Required: ${companyName} - $${totalMonthly.toLocaleString()}/mo`,
    body: `Hi team,

An engagement walkthrough has been prepared for ${companyName} and is ready for internal review before sending to the customer.

Client Details:
- Company: ${companyName}
- Contact: ${contactName}
- Deal Value: $${totalMonthly.toLocaleString()}/mo

Please review the walkthrough below and confirm:
1. Services and pricing are accurate
2. Terms are appropriate for this client
3. Any special considerations are noted

WALKTHROUGH DOCUMENT:
---
${walkthroughText}
---

Reply to this email with any feedback or changes needed. Once approved, we will send the engagement agreement to the customer for signature.

Thanks,
Tim`
  }
}

/**
 * Initialize EA Internal Review email with template
 */
export async function initializeEAInternalReview(
  dealId: string,
  recipients: { name: string; email: string }[]
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Get data for email
  const salesIntake = existing.stages["sales-intake"].data.formData
  const companyName = salesIntake?.companyName || "Company"
  const contactName = salesIntake?.contactName || "Client"
  const totalMonthly = existing.stages["create-quote"].data.lineItems
    .reduce((sum, item) => sum + item.monthlyPrice, 0)
  const walkthroughText = existing.stages["prepare-engagement"].data.walkthroughText

  const { subject, body } = generateEAInternalReviewEmail(
    companyName,
    contactName,
    totalMonthly,
    walkthroughText
  )

  existing.stages["internal-engagement-review"].data = {
    recipients,
    emailSubject: subject,
    emailBody: body,
    isEdited: false,
    sentAt: null,
    readyToSendAt: null
  }

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update EA Internal Review email content
 */
export async function updateEAInternalReviewEmail(
  dealId: string,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["internal-engagement-review"].data.emailSubject = subject
  existing.stages["internal-engagement-review"].data.emailBody = body
  existing.stages["internal-engagement-review"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark EA Internal Review email as sent
 */
export async function markEAInternalReviewSent(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["internal-engagement-review"].data.sentAt = now

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark EA Internal Review as ready to send to customer
 */
export async function markEAReadyToSend(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["internal-engagement-review"].data.readyToSendAt = now
  existing.stages["internal-engagement-review"].status = "completed"
  existing.stages["internal-engagement-review"].completedAt = now

  // Move to Send Engagement
  existing.currentStage = "send-engagement"
  existing.stages["send-engagement"].status = "in_progress"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "send-engagement")

  return existing
}

// ============================================
// Send Engagement Stage Functions - Simplified
// ============================================

/**
 * Initialize customer email for send engagement
 */
export async function initializeEngagementCustomerEmail(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  // Get company and contact name from sales intake
  const salesIntake = existing.stages["sales-intake"].data.formData
  const companyName = salesIntake?.companyName || "your company"
  const contactName = salesIntake?.contactName || "there"
  const lineItems = existing.stages["create-quote"].data.lineItems
  const totalMonthly = lineItems.reduce((sum, item) => sum + item.monthlyPrice, 0)

  const serviceList = lineItems.map(item => `- ${item.service}: $${item.monthlyPrice}/mo`).join("\n")

  const subject = `Welcome to Growth Lab - Engagement Confirmation for ${companyName}`
  const body = `Hi ${contactName},

Welcome to Growth Lab! We're excited to officially begin our partnership with ${companyName}.

Here's a summary of your services:

${serviceList}

Total: $${totalMonthly.toLocaleString()}/month

WHAT HAPPENS NEXT:
1. You'll receive an onboarding email with next steps
2. We'll schedule a kickoff call to gather your login credentials
3. Your dedicated team will begin the transition process

If you have any questions, please don't hesitate to reach out.

We look forward to supporting ${companyName}'s financial success!

Best regards,
Tim`

  existing.stages["send-engagement"].data.customerEmailSubject = subject
  existing.stages["send-engagement"].data.customerEmailBody = body

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Update customer email subject and body
 */
export async function updateEngagementCustomerEmail(
  dealId: string,
  subject: string,
  body: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["send-engagement"].data.customerEmailSubject = subject
  existing.stages["send-engagement"].data.customerEmailBody = body
  existing.stages["send-engagement"].data.isEdited = true

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Send via HubSpot and move deal to Closed Won - completes the pipeline
 */
export async function sendViaHubspotAndCloseWon(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Mark as sent via HubSpot
  existing.stages["send-engagement"].data.sentViaHubspotAt = now

  // Complete Send Engagement stage
  existing.stages["send-engagement"].status = "completed"
  existing.stages["send-engagement"].completedAt = now

  // Mark Closed Won as completed (pipeline is done!)
  existing.stages["closed-won"].status = "completed"
  existing.stages["closed-won"].completedAt = now
  existing.currentStage = "closed-won"

  // Calculate final deal value from quote
  const totalMonthly = existing.stages["create-quote"].data.lineItems
    .reduce((sum, item) => sum + item.monthlyPrice, 0)

  existing.stages["closed-won"].data.closedAt = now
  existing.stages["closed-won"].data.finalDealValue = totalMonthly
  existing.stages["closed-won"].data.servicesIncluded = existing.stages["create-quote"].data.lineItems
    .map(item => ({ service: item.service, monthlyPrice: item.monthlyPrice }))

  // Mark Closed Lost as skipped (deal was won, not lost)
  existing.stages["closed-lost"].status = "skipped"

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "closed-won")

  return existing
}

// ============================================
// Closed Won Stage Functions
// ============================================

/**
 * Update closing notes
 */
export async function updateClosingNotes(
  dealId: string,
  notes: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["closed-won"].data.closingNotes = notes

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark closed won as synced to HubSpot (placeholder)
 */
export async function markClosedWonSyncedToHubspot(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["closed-won"].data.hubspotSynced = true
  existing.stages["closed-won"].data.hubspotSyncedAt = now

  // Mark as completed
  existing.stages["closed-won"].status = "completed"
  existing.stages["closed-won"].completedAt = now

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

// ============================================
// Closed Lost Stage Functions
// ============================================

/**
 * Mark deal as lost from any stage
 */
export async function markDealAsLost(
  dealId: string,
  reason: LostReason,
  details: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  // Record which stage we came from
  const previousStage = existing.currentStage

  // Mark previous stage as skipped if not completed
  if (existing.stages[previousStage].status !== "completed") {
    existing.stages[previousStage].status = "skipped"
  }

  // Move to Closed Lost
  existing.currentStage = "closed-lost"
  existing.stages["closed-lost"].status = "in_progress"
  existing.stages["closed-lost"].data.closedAt = now
  existing.stages["closed-lost"].data.lostReason = reason
  existing.stages["closed-lost"].data.lostReasonDetails = details
  existing.stages["closed-lost"].data.lostFromStage = previousStage

  existing.updatedAt = now
  saveAllTimelines(timelines)

  // Update deal's automation stage
  await updateDealAutomationStage(dealId, "closed-lost")

  return existing
}

/**
 * Update lost reason details
 */
export async function updateLostReasonDetails(
  dealId: string,
  reason: LostReason,
  details: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  existing.stages["closed-lost"].data.lostReason = reason
  existing.stages["closed-lost"].data.lostReasonDetails = details

  existing.updatedAt = new Date().toISOString()
  saveAllTimelines(timelines)

  return existing
}

/**
 * Mark closed lost as synced to HubSpot (placeholder)
 */
export async function markClosedLostSyncedToHubspot(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["closed-lost"].data.hubspotSynced = true
  existing.stages["closed-lost"].data.hubspotSyncedAt = now

  // Mark as completed
  existing.stages["closed-lost"].status = "completed"
  existing.stages["closed-lost"].completedAt = now

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}
