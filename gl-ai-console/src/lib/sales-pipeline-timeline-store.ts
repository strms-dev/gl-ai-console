"use client"

import {
  SalesPipelineTimelineState,
  SalesPipelineStageId,
  SalesPipelineStageStatus,
  SalesIntakeData,
  FollowUpEmailData,
  InternalAssignmentData,
  QuoteData,
  ProposalData,
  NegotiationData,
  ClosedOutcome,
  AccountingSystem,
  createInitialTimelineState
} from "./sales-pipeline-timeline-types"

const TIMELINE_STORAGE_KEY = "revops-pipeline-timelines"

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
 */
export async function getOrCreateTimelineState(dealId: string): Promise<SalesPipelineTimelineState> {
  const existing = await getTimelineState(dealId)
  if (existing) return existing

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
  const stage = existing.stages[stageId]

  existing.stages[stageId] = {
    ...stage,
    status,
    completedAt: status === "completed" ? now : stage.completedAt
  }

  existing.updatedAt = now
  saveAllTimelines(timelines)

  return existing
}

/**
 * Move to next stage
 */
export async function advanceToNextStage(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const stageOrder: SalesPipelineStageId[] = [
    "demo-call",
    "needs-info",
    "access-received",
    "create-quote",
    "proposal-sent",
    "negotiation",
    "closed"
  ]

  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const currentIndex = stageOrder.indexOf(existing.currentStage)
  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) return existing

  const now = new Date().toISOString()

  // Complete current stage
  existing.stages[existing.currentStage].status = "completed"
  existing.stages[existing.currentStage].completedAt = now

  // Move to next stage
  const nextStage = stageOrder[currentIndex + 1]
  existing.currentStage = nextStage
  existing.stages[nextStage].status = "in_progress"
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
  fileName: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["demo-call"].data.transcriptUploaded = true
  existing.stages["demo-call"].data.transcriptFileName = fileName
  existing.stages["demo-call"].data.transcriptUploadedAt = now
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Demo Call Stage: Save intake analysis data
 */
export async function saveIntakeAnalysis(
  dealId: string,
  intakeData: SalesIntakeData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["demo-call"].data.intakeAnalyzed = true
  existing.stages["demo-call"].data.intakeData = intakeData
  existing.stages["demo-call"].data.intakeConfirmedAt = now
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Needs Info Stage: Save email template
 */
export async function saveFollowUpEmail(
  dealId: string,
  emailData: FollowUpEmailData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["needs-info"].data.emailTemplate = emailData
  existing.stages["needs-info"].data.accessRequestedAt = now
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Needs Info Stage: Mark email as sent
 */
export async function markFollowUpEmailSent(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["needs-info"].data.emailSent = true
  if (existing.stages["needs-info"].data.emailTemplate) {
    existing.stages["needs-info"].data.emailTemplate.sentAt = now
  }
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Needs Info Stage: Enroll in reminder sequence
 */
export async function enrollInReminderSequence(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["needs-info"].data.reminderEnrolled = true
  if (existing.stages["needs-info"].data.emailTemplate) {
    existing.stages["needs-info"].data.emailTemplate.reminderEnrolledAt = now
  }
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Access Received Stage: Mark access received
 */
export async function markAccessReceived(
  dealId: string,
  accessType: AccountingSystem
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["access-received"].data.accessType = accessType
  existing.stages["access-received"].data.accessReceivedAt = now
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Access Received Stage: Save internal assignment
 */
export async function saveInternalAssignment(
  dealId: string,
  assignment: InternalAssignmentData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["access-received"].data.internalAssignment = assignment
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Access Received Stage: Mark review completed
 */
export async function markReviewCompleted(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["access-received"].data.reviewCompleted = true
  existing.stages["access-received"].data.reviewCompletedAt = now
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Create Quote Stage: Save quote data
 */
export async function saveQuoteData(
  dealId: string,
  quoteData: QuoteData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["create-quote"].data.quoteData = quoteData
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Create Quote Stage: Mark proposal drafted
 */
export async function markProposalDrafted(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["create-quote"].data.proposalDrafted = true
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Proposal Sent Stage: Save proposal data
 */
export async function saveProposalData(
  dealId: string,
  proposal: ProposalData
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["proposal-sent"].data.proposal = proposal
  existing.stages["proposal-sent"].data.sentAt = now
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Proposal Sent Stage: Mark proposal viewed
 */
export async function markProposalViewed(
  dealId: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()
  existing.stages["proposal-sent"].data.viewedAt = now
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Negotiation Stage: Add negotiation note
 */
export async function addNegotiationNote(
  dealId: string,
  note: string
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  if (!existing.stages["negotiation"].data.data) {
    existing.stages["negotiation"].data.data = {
      notes: [],
      adjustedTerms: null,
      finalPrice: null
    }
  }

  existing.stages["negotiation"].data.data.notes.push(`[${now}] ${note}`)
  existing.stages["negotiation"].data.inProgress = true
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Negotiation Stage: Update terms
 */
export async function updateNegotiationTerms(
  dealId: string,
  terms: string,
  finalPrice: number
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  if (!existing.stages["negotiation"].data.data) {
    existing.stages["negotiation"].data.data = {
      notes: [],
      adjustedTerms: null,
      finalPrice: null
    }
  }

  existing.stages["negotiation"].data.data.adjustedTerms = terms
  existing.stages["negotiation"].data.data.finalPrice = finalPrice
  existing.updatedAt = now

  saveAllTimelines(timelines)
  return existing
}

/**
 * Close Deal: Mark as won or lost
 */
export async function closeDeal(
  dealId: string,
  outcome: ClosedOutcome,
  reason: string,
  finalValue?: number
): Promise<SalesPipelineTimelineState | null> {
  const timelines = getAllTimelines()
  const existing = timelines[dealId]

  if (!existing) return null

  const now = new Date().toISOString()

  existing.stages["closed"].data.outcome = outcome
  existing.stages["closed"].data.closedAt = now

  if (outcome === "won") {
    existing.stages["closed"].data.wonReason = reason
    existing.stages["closed"].data.finalDealValue = finalValue || null
  } else {
    existing.stages["closed"].data.lostReason = reason
  }

  existing.stages["closed"].status = "completed"
  existing.stages["closed"].completedAt = now
  existing.currentStage = "closed"
  existing.updatedAt = now

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

/**
 * Check if a 3-day reminder should be shown
 * Returns true if email was sent but access not received after 3 business days
 */
export function shouldShowReminderPrompt(state: SalesPipelineTimelineState): boolean {
  const needsInfoData = state.stages["needs-info"].data

  if (!needsInfoData.emailSent || needsInfoData.reminderEnrolled) {
    return false
  }

  const accessData = state.stages["access-received"].data
  if (accessData.accessReceivedAt) {
    return false // Access already received
  }

  const sentAt = needsInfoData.emailTemplate?.sentAt
  if (!sentAt) return false

  // Calculate 3 business days (roughly 5 calendar days to be safe)
  const sentDate = new Date(sentAt)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))

  return daysDiff >= 3
}
