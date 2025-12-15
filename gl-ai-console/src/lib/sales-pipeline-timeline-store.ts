"use client"

import {
  SalesPipelineTimelineState,
  SalesPipelineStageId,
  SalesPipelineStageStatus,
  createInitialTimelineState
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
  existing.stages["demo-call"].data.transcriptUploaded = true
  existing.stages["demo-call"].data.transcriptFileName = fileName
  existing.stages["demo-call"].data.transcriptUploadedAt = now
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

  existing.stages["demo-call"].data.transcriptUploaded = false
  existing.stages["demo-call"].data.transcriptFileName = null
  existing.stages["demo-call"].data.transcriptUploadedAt = null
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
