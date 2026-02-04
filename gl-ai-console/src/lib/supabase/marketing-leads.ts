// Marketing Lead Discovery Supabase CRUD Operations
// This file handles all database operations for Lead Discovery tables:
// - marketing_influencers
// - marketing_hypothesis_workflows

import { supabase } from '@/lib/supabase/client'
import type {
  MarketingInfluencer,
  MarketingInfluencerInsert,
  MarketingInfluencerUpdate,
  MarketingHypothesisWorkflow,
  MarketingHypothesisWorkflowInsert,
  MarketingHypothesisWorkflowUpdate,
} from './marketing-types'

// Import frontend types for mapping
import type {
  Influencer,
  InfluencerPlatform,
  InfluencerStatus,
  ICPMatchLevel,
  LeadHypothesis,
  HypothesisStatus,
} from '@/lib/lead-discovery-types'

// ===================
// Type Mappers (Database -> Frontend)
// ===================

/**
 * Convert database influencer to frontend Influencer format
 */
function mapToInfluencer(dbItem: MarketingInfluencer): Influencer {
  return {
    id: dbItem.id,
    name: dbItem.name,
    platform: dbItem.platform as InfluencerPlatform,
    profileUrl: dbItem.profile_url,
    followerCount: dbItem.follower_count || 0,
    averageEngagement: dbItem.average_engagement ? Number(dbItem.average_engagement) : 0,
    niche: dbItem.niche || [],
    icpMatch: dbItem.icp_match as ICPMatchLevel,
    icpMatchReason: dbItem.icp_match_reason || '',
    status: dbItem.status as InfluencerStatus,
    addedToTrigifyAt: dbItem.added_to_trigify_at || undefined,
    discoveredAt: dbItem.discovered_at,
    discoveredBy: dbItem.discovered_by,
  }
}

/**
 * Convert frontend Influencer to database insert format
 */
function mapFromInfluencer(influencer: Influencer): MarketingInfluencerInsert {
  return {
    id: influencer.id,
    name: influencer.name,
    platform: influencer.platform,
    profile_url: influencer.profileUrl,
    follower_count: influencer.followerCount,
    average_engagement: influencer.averageEngagement,
    niche: influencer.niche,
    icp_match: influencer.icpMatch,
    icp_match_reason: influencer.icpMatchReason || null,
    status: influencer.status,
    discovered_by: influencer.discoveredBy,
    added_to_trigify_at: influencer.addedToTrigifyAt || null,
    discovered_at: influencer.discoveredAt,
  }
}

/**
 * Convert database hypothesis workflow to frontend LeadHypothesis format
 * Note: This is a simplified mapping - full workflow data is stored in the database
 */
function mapToLeadHypothesis(dbItem: MarketingHypothesisWorkflow): LeadHypothesis {
  return {
    id: dbItem.id,
    title: dbItem.target_description, // Use target_description as title
    description: dbItem.target_description,
    targetCriteria: dbItem.search_criteria?.map(sc => `${sc.field}: ${sc.value}`) || [],
    estimatedLeadCount: 0, // Not stored in DB, would come from Clay/n8n
    confidenceScore: 75, // Default confidence
    dataSource: dbItem.lead_source,
    status: mapDbStatusToHypothesisStatus(dbItem.status),
    leadsGenerated: 0, // Not stored in DB, would come from Clay
    createdAt: dbItem.created_at,
    createdBy: 'ai', // Default to AI-generated
    validatedAt: dbItem.approved_at || undefined,
  }
}

/**
 * Map database status to frontend HypothesisStatus
 */
function mapDbStatusToHypothesisStatus(
  dbStatus: MarketingHypothesisWorkflow['status']
): HypothesisStatus {
  switch (dbStatus) {
    case 'draft':
      return 'draft'
    case 'approved':
      return 'approved'
    case 'completed':
      return 'completed'
    default:
      return 'draft'
  }
}

// ===================
// Influencer Frontend Functions
// ===================

/**
 * Fetch all influencers formatted for frontend
 */
export async function fetchInfluencersForUI(
  status?: InfluencerStatus | InfluencerStatus[]
): Promise<Influencer[]> {
  const filters: InfluencerFilters = {}
  if (status) {
    filters.status = status as MarketingInfluencer['status'] | MarketingInfluencer['status'][]
  }
  const dbItems = await fetchInfluencers(filters)
  return dbItems.map(mapToInfluencer)
}

/**
 * Fetch discovered influencers (pending review)
 */
export async function fetchDiscoveredInfluencers(): Promise<Influencer[]> {
  return fetchInfluencersForUI('discovered')
}

/**
 * Fetch approved influencers
 */
export async function fetchApprovedInfluencers(): Promise<Influencer[]> {
  return fetchInfluencersForUI('approved')
}

/**
 * Fetch influencers in Trigify
 */
export async function fetchTrigifyInfluencers(): Promise<Influencer[]> {
  return fetchInfluencersForUI('added_to_trigify')
}

/**
 * Add influencers from discovery (batch insert)
 */
export async function addInfluencersToSupabase(
  influencers: Influencer[]
): Promise<Influencer[]> {
  const dbInserts = influencers.map(mapFromInfluencer)
  const { data, error } = await supabase
    .from('marketing_influencers')
    .insert(dbInserts as never[])
    .select()

  if (error) {
    console.error('Error adding influencers:', error)
    throw error
  }

  return (data as MarketingInfluencer[]).map(mapToInfluencer)
}

/**
 * Approve an influencer (for UI)
 */
export async function approveInfluencerInSupabase(id: string): Promise<Influencer> {
  await approveInfluencer(id)
  const dbItem = await fetchInfluencerById(id)
  if (!dbItem) throw new Error('Influencer not found after approval')
  return mapToInfluencer(dbItem)
}

/**
 * Reject an influencer (delete from DB)
 */
export async function rejectInfluencerInSupabase(id: string): Promise<void> {
  await deleteInfluencer(id)
}

/**
 * Add influencer to Trigify
 */
export async function addInfluencerToTrigifyInSupabase(id: string): Promise<Influencer> {
  await markInfluencerAddedToTrigify(id)
  const dbItem = await fetchInfluencerById(id)
  if (!dbItem) throw new Error('Influencer not found after adding to Trigify')
  return mapToInfluencer(dbItem)
}

/**
 * Remove influencer from Trigify (back to approved)
 */
export async function removeInfluencerFromTrigifyInSupabase(id: string): Promise<Influencer> {
  await updateInfluencer(id, { status: 'approved', added_to_trigify_at: null })
  const dbItem = await fetchInfluencerById(id)
  if (!dbItem) throw new Error('Influencer not found after removing from Trigify')
  return mapToInfluencer(dbItem)
}

// ===================
// Hypothesis Frontend Functions
// ===================

/**
 * Fetch all hypothesis workflows formatted for frontend
 */
export async function fetchHypothesesForUI(
  status?: HypothesisStatus
): Promise<LeadHypothesis[]> {
  const filters: HypothesisWorkflowFilters = {}
  if (status) {
    // Map frontend status to DB status
    if (status === 'draft' || status === 'validating') {
      filters.status = 'draft'
    } else if (status === 'approved' || status === 'active') {
      filters.status = 'approved'
    } else if (status === 'completed') {
      filters.status = 'completed'
    }
  }
  const dbItems = await fetchHypothesisWorkflows(filters)
  return dbItems.map(mapToLeadHypothesis)
}

/**
 * Fetch active hypotheses (draft or approved)
 */
export async function fetchActiveHypotheses(): Promise<LeadHypothesis[]> {
  const dbItems = await fetchHypothesisWorkflows({
    status: ['draft', 'approved'],
  })
  return dbItems.map(mapToLeadHypothesis)
}

/**
 * Approve a hypothesis workflow (for UI)
 */
export async function approveHypothesisInSupabase(id: string): Promise<LeadHypothesis> {
  await approveHypothesisWorkflow(id)
  const dbItem = await fetchHypothesisWorkflowById(id)
  if (!dbItem) throw new Error('Hypothesis not found after approval')
  return mapToLeadHypothesis(dbItem)
}

/**
 * Reject a hypothesis (delete from DB)
 */
export async function rejectHypothesisInSupabase(id: string): Promise<void> {
  await deleteHypothesisWorkflow(id)
}

/**
 * Move hypothesis back to draft
 */
export async function moveToPendingInSupabase(id: string): Promise<LeadHypothesis> {
  await updateHypothesisWorkflow(id, { status: 'draft', approved_at: null })
  const dbItem = await fetchHypothesisWorkflowById(id)
  if (!dbItem) throw new Error('Hypothesis not found after moving to pending')
  return mapToLeadHypothesis(dbItem)
}

// ===================
// Influencer Functions
// ===================

export interface InfluencerFilters {
  status?: MarketingInfluencer['status'] | MarketingInfluencer['status'][]
  platform?: MarketingInfluencer['platform'] | MarketingInfluencer['platform'][]
  icpMatch?: MarketingInfluencer['icp_match'] | MarketingInfluencer['icp_match'][]
  discoveredBy?: string
  search?: string
}

/**
 * Fetch all influencers with optional filters
 */
export async function fetchInfluencers(
  filters?: InfluencerFilters
): Promise<MarketingInfluencer[]> {
  let query = supabase
    .from('marketing_influencers')
    .select('*')
    .order('discovered_at', { ascending: false })

  if (filters) {
    // Filter by status
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status)
      } else {
        query = query.eq('status', filters.status)
      }
    }

    // Filter by platform
    if (filters.platform) {
      if (Array.isArray(filters.platform)) {
        query = query.in('platform', filters.platform)
      } else {
        query = query.eq('platform', filters.platform)
      }
    }

    // Filter by ICP match level
    if (filters.icpMatch) {
      if (Array.isArray(filters.icpMatch)) {
        query = query.in('icp_match', filters.icpMatch)
      } else {
        query = query.eq('icp_match', filters.icpMatch)
      }
    }

    // Filter by who discovered
    if (filters.discoveredBy) {
      query = query.eq('discovered_by', filters.discoveredBy)
    }

    // Search by name
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching influencers:', error)
    throw error
  }

  return (data as MarketingInfluencer[]) || []
}

/**
 * Fetch a single influencer by ID
 */
export async function fetchInfluencerById(
  id: string
): Promise<MarketingInfluencer | null> {
  const { data, error } = await supabase
    .from('marketing_influencers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching influencer:', error)
    throw error
  }

  return data as MarketingInfluencer
}

/**
 * Create a new influencer
 */
export async function createInfluencer(
  influencer: MarketingInfluencerInsert
): Promise<string> {
  const { data, error } = await supabase
    .from('marketing_influencers')
    .insert(influencer as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating influencer:', error)
    throw error
  }

  return (data as { id: string }).id
}

/**
 * Create multiple influencers at once
 */
export async function createInfluencers(
  influencers: MarketingInfluencerInsert[]
): Promise<string[]> {
  const { data, error } = await supabase
    .from('marketing_influencers')
    .insert(influencers as never[])
    .select()

  if (error) {
    console.error('Error creating influencers:', error)
    throw error
  }

  return (data as { id: string }[]).map((item) => item.id)
}

/**
 * Update an influencer
 */
export async function updateInfluencer(
  id: string,
  updates: MarketingInfluencerUpdate
): Promise<void> {
  const { error } = await supabase
    .from('marketing_influencers')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)

  if (error) {
    console.error('Error updating influencer:', error)
    throw error
  }
}

/**
 * Delete an influencer
 */
export async function deleteInfluencer(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_influencers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting influencer:', error)
    throw error
  }
}

/**
 * Approve an influencer (change status from discovered to approved)
 */
export async function approveInfluencer(id: string): Promise<void> {
  await updateInfluencer(id, { status: 'approved' })
}

/**
 * Reject an influencer
 */
export async function rejectInfluencer(id: string): Promise<void> {
  await updateInfluencer(id, { status: 'rejected' })
}

/**
 * Mark influencer as added to Trigify
 */
export async function markInfluencerAddedToTrigify(id: string): Promise<void> {
  await updateInfluencer(id, {
    status: 'added_to_trigify',
    added_to_trigify_at: new Date().toISOString(),
  })
}

// ===================
// Hypothesis Workflow Functions
// ===================

export interface HypothesisWorkflowFilters {
  status?: MarketingHypothesisWorkflow['status'] | MarketingHypothesisWorkflow['status'][]
  currentStep?: MarketingHypothesisWorkflow['current_step']
  entryMode?: MarketingHypothesisWorkflow['entry_mode']
  leadSource?: MarketingHypothesisWorkflow['lead_source']
  search?: string
}

/**
 * Fetch all hypothesis workflows with optional filters
 */
export async function fetchHypothesisWorkflows(
  filters?: HypothesisWorkflowFilters
): Promise<MarketingHypothesisWorkflow[]> {
  let query = supabase
    .from('marketing_hypothesis_workflows')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters) {
    // Filter by status
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status)
      } else {
        query = query.eq('status', filters.status)
      }
    }

    // Filter by current step
    if (filters.currentStep) {
      query = query.eq('current_step', filters.currentStep)
    }

    // Filter by entry mode
    if (filters.entryMode) {
      query = query.eq('entry_mode', filters.entryMode)
    }

    // Filter by lead source
    if (filters.leadSource) {
      query = query.eq('lead_source', filters.leadSource)
    }

    // Search by target description
    if (filters.search) {
      query = query.ilike('target_description', `%${filters.search}%`)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching hypothesis workflows:', error)
    throw error
  }

  return (data as MarketingHypothesisWorkflow[]) || []
}

/**
 * Fetch a single hypothesis workflow by ID
 */
export async function fetchHypothesisWorkflowById(
  id: string
): Promise<MarketingHypothesisWorkflow | null> {
  const { data, error } = await supabase
    .from('marketing_hypothesis_workflows')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching hypothesis workflow:', error)
    throw error
  }

  return data as MarketingHypothesisWorkflow
}

/**
 * Create a new hypothesis workflow
 */
export async function createHypothesisWorkflow(
  workflow: MarketingHypothesisWorkflowInsert
): Promise<string> {
  const { data, error } = await supabase
    .from('marketing_hypothesis_workflows')
    .insert(workflow as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating hypothesis workflow:', error)
    throw error
  }

  return (data as { id: string }).id
}

/**
 * Update a hypothesis workflow
 */
export async function updateHypothesisWorkflow(
  id: string,
  updates: MarketingHypothesisWorkflowUpdate
): Promise<void> {
  const { error } = await supabase
    .from('marketing_hypothesis_workflows')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)

  if (error) {
    console.error('Error updating hypothesis workflow:', error)
    throw error
  }
}

/**
 * Delete a hypothesis workflow
 */
export async function deleteHypothesisWorkflow(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_hypothesis_workflows')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting hypothesis workflow:', error)
    throw error
  }
}

/**
 * Approve a hypothesis workflow
 */
export async function approveHypothesisWorkflow(id: string): Promise<void> {
  await updateHypothesisWorkflow(id, {
    status: 'approved',
    approved_at: new Date().toISOString(),
  })
}

/**
 * Complete a hypothesis workflow
 */
export async function completeHypothesisWorkflow(id: string): Promise<void> {
  await updateHypothesisWorkflow(id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  })
}

/**
 * Advance to the next step in the hypothesis workflow
 */
export async function advanceHypothesisWorkflowStep(
  id: string,
  currentStep: MarketingHypothesisWorkflow['current_step']
): Promise<void> {
  const stepOrder: MarketingHypothesisWorkflow['current_step'][] = [
    'who_where',
    'how_what',
    'email_copy',
    'linkedin_copy',
  ]

  const currentIndex = stepOrder.indexOf(currentStep)
  if (currentIndex < stepOrder.length - 1) {
    await updateHypothesisWorkflow(id, {
      current_step: stepOrder[currentIndex + 1],
    })
  }
}

// ===================
// Lead Discovery Stats
// ===================

export interface LeadDiscoveryStats {
  totalInfluencers: number
  discoveredInfluencers: number
  approvedInfluencers: number
  inTrigifyInfluencers: number
  rejectedInfluencers: number
  highMatchInfluencers: number
  totalHypotheses: number
  draftHypotheses: number
  approvedHypotheses: number
  completedHypotheses: number
}

/**
 * Get lead discovery statistics
 */
export async function getLeadDiscoveryStats(): Promise<LeadDiscoveryStats> {
  // Using imported supabase client

  // Fetch influencer counts
  const { data: influencers, error: influencerError } = await supabase
    .from('marketing_influencers')
    .select('status, icp_match')

  if (influencerError) {
    console.error('Error fetching influencer stats:', influencerError)
    throw influencerError
  }

  // Fetch hypothesis counts
  const { data: hypotheses, error: hypothesisError } = await supabase
    .from('marketing_hypothesis_workflows')
    .select('status')

  if (hypothesisError) {
    console.error('Error fetching hypothesis stats:', hypothesisError)
    throw hypothesisError
  }

  const influencerList = influencers || []
  const hypothesisList = hypotheses || []

  return {
    totalInfluencers: influencerList.length,
    discoveredInfluencers: influencerList.filter((i) => i.status === 'discovered').length,
    approvedInfluencers: influencerList.filter((i) => i.status === 'approved').length,
    inTrigifyInfluencers: influencerList.filter((i) => i.status === 'added_to_trigify').length,
    rejectedInfluencers: influencerList.filter((i) => i.status === 'rejected').length,
    highMatchInfluencers: influencerList.filter((i) => i.icp_match === 'high').length,
    totalHypotheses: hypothesisList.length,
    draftHypotheses: hypothesisList.filter((h) => h.status === 'draft').length,
    approvedHypotheses: hypothesisList.filter((h) => h.status === 'approved').length,
    completedHypotheses: hypothesisList.filter((h) => h.status === 'completed').length,
  }
}
