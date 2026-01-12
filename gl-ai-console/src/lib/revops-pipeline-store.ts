"use client"

import {
  fetchPipelineDeals,
  fetchPipelineDealById,
  createPipelineDeal,
  updatePipelineDealSupabase,
  deletePipelineDealSupabase
} from "./supabase/revops-pipeline"
import { deleteRevOpsDealFiles } from "./supabase/revops-files"
import type { RevOpsPipelineDeal, RevOpsPipelineDealInsert, RevOpsPipelineDealUpdate } from "./supabase/types"

// Application-level interface for Pipeline Deals (camelCase)
export interface PipelineDeal {
  id: string
  dealName: string
  companyName: string
  firstName: string | null
  lastName: string | null
  email: string | null
  stage: string
  hsStage: string | null
  hsDealId: string | null
  hsDealUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Convert database row (snake_case) to application type (camelCase)
 */
function dbToApp(dbDeal: RevOpsPipelineDeal): PipelineDeal {
  return {
    id: dbDeal.id,
    dealName: dbDeal.deal_name,
    companyName: dbDeal.company_name,
    firstName: dbDeal.first_name,
    lastName: dbDeal.last_name,
    email: dbDeal.email,
    stage: dbDeal.stage,
    hsStage: dbDeal.hs_stage,
    hsDealId: dbDeal.hs_deal_id,
    hsDealUrl: dbDeal.hs_deal_url,
    createdAt: dbDeal.created_at,
    updatedAt: dbDeal.updated_at,
  }
}

/**
 * Convert application type (camelCase) to database insert (snake_case)
 */
function appToDbInsert(appDeal: Omit<PipelineDeal, "id" | "createdAt" | "updatedAt">): RevOpsPipelineDealInsert {
  return {
    deal_name: appDeal.dealName,
    company_name: appDeal.companyName,
    first_name: appDeal.firstName,
    last_name: appDeal.lastName,
    email: appDeal.email,
    stage: appDeal.stage,
    hs_stage: appDeal.hsStage,
    hs_deal_id: appDeal.hsDealId,
    hs_deal_url: appDeal.hsDealUrl,
  }
}

/**
 * Convert application update (camelCase) to database update (snake_case)
 */
function appToDbUpdate(updates: Partial<Omit<PipelineDeal, "id" | "createdAt" | "updatedAt">>): RevOpsPipelineDealUpdate {
  const dbUpdate: RevOpsPipelineDealUpdate = {}

  if (updates.dealName !== undefined) dbUpdate.deal_name = updates.dealName
  if (updates.companyName !== undefined) dbUpdate.company_name = updates.companyName
  if (updates.firstName !== undefined) dbUpdate.first_name = updates.firstName
  if (updates.lastName !== undefined) dbUpdate.last_name = updates.lastName
  if (updates.email !== undefined) dbUpdate.email = updates.email
  if (updates.stage !== undefined) dbUpdate.stage = updates.stage
  if (updates.hsStage !== undefined) dbUpdate.hs_stage = updates.hsStage
  if (updates.hsDealId !== undefined) dbUpdate.hs_deal_id = updates.hsDealId
  if (updates.hsDealUrl !== undefined) dbUpdate.hs_deal_url = updates.hsDealUrl

  return dbUpdate
}

/**
 * Get all pipeline deals from Supabase
 */
export async function getPipelineDeals(): Promise<PipelineDeal[]> {
  try {
    const dbDeals = await fetchPipelineDeals()
    return dbDeals.map(dbToApp)
  } catch (error) {
    console.error("Error fetching pipeline deals:", error)
    return []
  }
}

/**
 * Get a single pipeline deal by ID
 */
export async function getPipelineDealById(id: string): Promise<PipelineDeal | null> {
  try {
    const dbDeal = await fetchPipelineDealById(id)
    return dbDeal ? dbToApp(dbDeal) : null
  } catch (error) {
    console.error("Error fetching pipeline deal:", error)
    return null
  }
}

/**
 * Add a new pipeline deal
 */
export async function addPipelineDeal(
  deal: Omit<PipelineDeal, "id" | "createdAt" | "updatedAt">
): Promise<PipelineDeal> {
  const dbInsert = appToDbInsert(deal)
  const dbDeal = await createPipelineDeal(dbInsert)
  return dbToApp(dbDeal)
}

/**
 * Update an existing pipeline deal
 */
export async function updatePipelineDeal(
  id: string,
  updates: Partial<Omit<PipelineDeal, "id" | "createdAt" | "updatedAt">>
): Promise<PipelineDeal | null> {
  try {
    const dbUpdate = appToDbUpdate(updates)
    const dbDeal = await updatePipelineDealSupabase(id, dbUpdate)
    return dbToApp(dbDeal)
  } catch (error) {
    console.error("Error updating pipeline deal:", error)
    return null
  }
}

/**
 * Delete a pipeline deal
 * Also cleans up associated files from storage
 */
export async function deletePipelineDeal(id: string): Promise<boolean> {
  try {
    // Delete files from storage first (DB records cascade automatically via FK)
    await deleteRevOpsDealFiles(id)

    // Delete the deal (will cascade delete file metadata via FK constraint)
    await deletePipelineDealSupabase(id)
    return true
  } catch (error) {
    console.error("Error deleting pipeline deal:", error)
    return false
  }
}
