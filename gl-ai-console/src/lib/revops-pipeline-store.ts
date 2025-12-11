"use client"

// Application-level interface for Pipeline Deals
export interface PipelineDeal {
  id: string
  dealName: string
  companyName: string
  stage: string
  hsStage: string | null
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "revops-pipeline-deals"

/**
 * Generate a unique ID for new deals
 */
function generateId(): string {
  return `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all pipeline deals from localStorage
 */
export async function getPipelineDeals(): Promise<PipelineDeal[]> {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as PipelineDeal[]
  } catch (error) {
    console.error("Error reading pipeline deals from localStorage:", error)
    return []
  }
}

/**
 * Save all pipeline deals to localStorage
 */
function saveDeals(deals: PipelineDeal[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals))
  } catch (error) {
    console.error("Error saving pipeline deals to localStorage:", error)
  }
}

/**
 * Get a single pipeline deal by ID
 */
export async function getPipelineDealById(id: string): Promise<PipelineDeal | null> {
  const deals = await getPipelineDeals()
  return deals.find((deal) => deal.id === id) || null
}

/**
 * Add a new pipeline deal
 */
export async function addPipelineDeal(
  deal: Omit<PipelineDeal, "id" | "createdAt" | "updatedAt">
): Promise<PipelineDeal> {
  const deals = await getPipelineDeals()
  const now = new Date().toISOString()

  const newDeal: PipelineDeal = {
    id: generateId(),
    dealName: deal.dealName,
    companyName: deal.companyName,
    stage: deal.stage,
    hsStage: deal.hsStage,
    createdAt: now,
    updatedAt: now,
  }

  deals.unshift(newDeal) // Add to beginning of array
  saveDeals(deals)

  return newDeal
}

/**
 * Update an existing pipeline deal
 */
export async function updatePipelineDeal(
  id: string,
  updates: Partial<Omit<PipelineDeal, "id" | "createdAt" | "updatedAt">>
): Promise<PipelineDeal | null> {
  const deals = await getPipelineDeals()
  const index = deals.findIndex((deal) => deal.id === id)

  if (index === -1) return null

  const updatedDeal: PipelineDeal = {
    ...deals[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  deals[index] = updatedDeal
  saveDeals(deals)

  return updatedDeal
}

/**
 * Delete a pipeline deal
 */
export async function deletePipelineDeal(id: string): Promise<boolean> {
  const deals = await getPipelineDeals()
  const filteredDeals = deals.filter((deal) => deal.id !== id)

  if (filteredDeals.length === deals.length) return false

  saveDeals(filteredDeals)
  return true
}
