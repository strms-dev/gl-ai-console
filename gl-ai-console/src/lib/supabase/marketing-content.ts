import { supabase } from './client'
import type {
  MarketingContentItem,
  MarketingContentItemInsert,
  MarketingContentItemUpdate,
  MarketingTopicIdea,
  MarketingTopicIdeaInsert,
  MarketingTopicIdeaUpdate,
  MarketingContentBrief,
  MarketingContentBriefInsert,
  MarketingContentBriefUpdate,
  MarketingFinalDraft,
  MarketingFinalDraftInsert,
  MarketingFinalDraftUpdate,
  MarketingRefreshRecommendation,
  MarketingRefreshRecommendationInsert,
  MarketingRefreshRecommendationUpdate,
  MarketingSyncLog,
  MarketingSyncLogInsert,
  MarketingSyncLogUpdate,
  MarketingCompetitorDomain,
  MarketingCompetitorDomainInsert,
} from './marketing-types'

// Import frontend types for mapping
import type {
  ContentItem,
  ContentType,
  TopicIdea,
  TopicIdeaStatus,
  TopicCategory,
  ContentBrief,
  BriefStatus,
  BriefStep,
  OutlineSection,
  FAQ,
  LinkRecommendation,
  FinalDraft,
  RefreshRecommendation,
  RefreshPriority,
  RefreshStatus,
  RefreshTrigger,
} from '@/lib/marketing-content-types'

// ===================
// Type Mappers (Database -> Frontend)
// ===================

/**
 * Convert database content item to frontend ContentItem format
 */
function mapToContentItem(dbItem: MarketingContentItem): ContentItem {
  return {
    id: dbItem.id,
    title: dbItem.title,
    type: dbItem.content_type as ContentType,
    url: dbItem.url || undefined,
    dateCreated: dbItem.date_created,
    lastUpdated: dbItem.last_updated || undefined,
    status: dbItem.status,
    keywords: dbItem.keywords || undefined,
    wordCount: dbItem.word_count || undefined,
    author: dbItem.author || undefined,
    description: dbItem.description || undefined,
  }
}

/**
 * Fetch content library formatted for frontend ContentItem interface
 * This is the primary function for the Content Library UI component
 */
export async function fetchContentLibraryForUI(
  contentType?: ContentType
): Promise<ContentItem[]> {
  const dbItems = await fetchContentLibrary(contentType)
  return dbItems.map(mapToContentItem)
}

/**
 * Convert database topic idea to frontend TopicIdea format
 */
function mapToTopicIdea(dbItem: MarketingTopicIdea): TopicIdea {
  return {
    id: dbItem.id,
    topic: dbItem.topic,
    gapScore: dbItem.gap_score || 0,
    rationale: dbItem.rationale,
    suggestedFormat: dbItem.suggested_format as ContentType,
    relatedContentIds: dbItem.related_content_ids || undefined,
    status: dbItem.status as TopicIdeaStatus,
    category: dbItem.category as TopicCategory,
    createdAt: dbItem.created_at,
    createdBy: dbItem.created_by,
  }
}

/**
 * Convert frontend TopicIdea to database insert format
 */
function mapFromTopicIdea(idea: TopicIdea): MarketingTopicIdeaInsert {
  return {
    id: idea.id,
    topic: idea.topic,
    gap_score: idea.gapScore,
    rationale: idea.rationale,
    suggested_format: idea.suggestedFormat,
    related_content_ids: idea.relatedContentIds || null,
    status: idea.status,
    category: idea.category,
    created_by: idea.createdBy,
  }
}

// ===================
// Topic Radar Frontend Functions
// ===================

/**
 * Fetch all topic ideas formatted for frontend
 * Optionally filter by status and/or category
 */
export async function fetchTopicIdeasForUI(
  status?: TopicIdeaStatus,
  category?: TopicCategory
): Promise<TopicIdea[]> {
  const dbItems = await fetchTopicIdeas(status, category)
  return dbItems.map(mapToTopicIdea)
}

/**
 * Fetch only new (pending) topic ideas for Topic Radar modal
 */
export async function fetchNewTopicIdeas(): Promise<TopicIdea[]> {
  return fetchTopicIdeasForUI('new')
}

/**
 * Fetch approved topic ideas (ready to become briefs)
 */
export async function fetchApprovedTopicIdeas(): Promise<TopicIdea[]> {
  return fetchTopicIdeasForUI('approved')
}

/**
 * Add new topic ideas (from AI generation)
 */
export async function addTopicIdeasToSupabase(ideas: TopicIdea[]): Promise<TopicIdea[]> {
  const dbInserts = ideas.map(mapFromTopicIdea)
  const dbItems = await createTopicIdeas(dbInserts)
  return dbItems.map(mapToTopicIdea)
}

/**
 * Approve a topic idea (move from new to approved status)
 */
export async function approveTopicIdeaInSupabase(ideaId: string): Promise<void> {
  await updateTopicIdea(ideaId, { status: 'approved' })
}

/**
 * Reject a topic idea (soft delete by setting status)
 */
export async function rejectTopicIdeaInSupabase(ideaId: string): Promise<void> {
  await updateTopicIdea(ideaId, { status: 'rejected' })
}

/**
 * Mark topic idea as in progress (brief created)
 */
export async function markTopicIdeaInProgress(ideaId: string): Promise<void> {
  await updateTopicIdea(ideaId, { status: 'in_progress' })
}

/**
 * Mark topic idea as completed
 */
export async function markTopicIdeaCompleted(ideaId: string): Promise<void> {
  await updateTopicIdea(ideaId, { status: 'completed' })
}

/**
 * Delete a topic idea permanently
 */
export async function removeTopicIdeaFromSupabase(ideaId: string): Promise<void> {
  await deleteTopicIdea(ideaId)
}

// ===================
// Brief Builder Frontend Functions
// ===================

/**
 * Convert database content brief to frontend ContentBrief format
 */
function mapToContentBrief(dbItem: MarketingContentBrief): ContentBrief {
  return {
    id: dbItem.id,
    title: dbItem.title,
    status: dbItem.status as BriefStatus,
    currentStep: dbItem.current_step as BriefStep,
    targetFormat: dbItem.target_format as ContentType,
    targetKeywords: dbItem.target_keywords || [],
    outline: (dbItem.outline || []) as OutlineSection[],
    outlineApproved: dbItem.outline_approved || undefined,
    firstDraft: dbItem.first_draft || undefined,
    faqs: (dbItem.faqs || []) as FAQ[],
    internalLinks: (dbItem.internal_links || []) as LinkRecommendation[],
    externalLinks: (dbItem.external_links || []) as LinkRecommendation[],
    recommendedAuthor: dbItem.recommended_author || undefined,
    finalDraft: dbItem.final_draft || undefined,
    notes: dbItem.notes || undefined,
    sourceTopicId: dbItem.source_topic_id || undefined,
    assignedTo: dbItem.assigned_to || undefined,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
    publishedAt: dbItem.published_at || undefined,
  }
}

/**
 * Convert frontend ContentBrief to database insert format
 */
function mapFromContentBrief(brief: ContentBrief): MarketingContentBriefInsert {
  return {
    id: brief.id,
    title: brief.title,
    status: brief.status,
    current_step: brief.currentStep,
    target_format: brief.targetFormat,
    target_keywords: brief.targetKeywords,
    outline: brief.outline as OutlineSection[],
    outline_approved: brief.outlineApproved || null,
    first_draft: brief.firstDraft || null,
    faqs: (brief.faqs || []) as FAQ[],
    internal_links: (brief.internalLinks || []) as LinkRecommendation[],
    external_links: (brief.externalLinks || []) as LinkRecommendation[],
    recommended_author: brief.recommendedAuthor || null,
    final_draft: brief.finalDraft || null,
    notes: brief.notes || null,
    source_topic_id: brief.sourceTopicId || null,
    assigned_to: brief.assignedTo || null,
  }
}

/**
 * Convert frontend ContentBrief to database update format
 */
function mapFromContentBriefUpdate(updates: Partial<ContentBrief>): MarketingContentBriefUpdate {
  const dbUpdates: MarketingContentBriefUpdate = {}

  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.currentStep !== undefined) dbUpdates.current_step = updates.currentStep
  if (updates.targetFormat !== undefined) dbUpdates.target_format = updates.targetFormat
  if (updates.targetKeywords !== undefined) dbUpdates.target_keywords = updates.targetKeywords
  if (updates.outline !== undefined) dbUpdates.outline = updates.outline as OutlineSection[]
  if (updates.outlineApproved !== undefined) dbUpdates.outline_approved = updates.outlineApproved
  if (updates.firstDraft !== undefined) dbUpdates.first_draft = updates.firstDraft || null
  if (updates.faqs !== undefined) dbUpdates.faqs = (updates.faqs || []) as FAQ[]
  if (updates.internalLinks !== undefined) dbUpdates.internal_links = (updates.internalLinks || []) as LinkRecommendation[]
  if (updates.externalLinks !== undefined) dbUpdates.external_links = (updates.externalLinks || []) as LinkRecommendation[]
  if (updates.recommendedAuthor !== undefined) dbUpdates.recommended_author = updates.recommendedAuthor || null
  if (updates.finalDraft !== undefined) dbUpdates.final_draft = updates.finalDraft || null
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
  if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo || null
  if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt || null

  return dbUpdates
}

/**
 * Fetch all content briefs formatted for frontend
 * Optionally filter by status
 */
export async function fetchBriefsForUI(
  status?: BriefStatus
): Promise<ContentBrief[]> {
  const dbItems = await fetchContentBriefs(status)
  return dbItems.map(mapToContentBrief)
}

/**
 * Fetch a single brief by ID
 */
export async function fetchBriefByIdForUI(
  id: string
): Promise<ContentBrief | null> {
  const dbItem = await fetchContentBriefById(id)
  return dbItem ? mapToContentBrief(dbItem) : null
}

/**
 * Create a new content brief
 */
export async function createBriefInSupabase(
  brief: ContentBrief
): Promise<ContentBrief> {
  const dbInsert = mapFromContentBrief(brief)
  const dbItem = await createContentBrief(dbInsert)
  return mapToContentBrief(dbItem)
}

/**
 * Update a content brief
 */
export async function updateBriefInSupabase(
  id: string,
  updates: Partial<ContentBrief>
): Promise<ContentBrief> {
  const dbUpdates = mapFromContentBriefUpdate(updates)
  const dbItem = await updateContentBrief(id, dbUpdates)
  return mapToContentBrief(dbItem)
}

/**
 * Save a brief (create if new, update if exists)
 * This matches the localStorage pattern of addBrief
 */
export async function saveBriefToSupabase(
  brief: ContentBrief
): Promise<ContentBrief> {
  // Check if brief exists
  const existing = await fetchContentBriefById(brief.id)
  if (existing) {
    // Update existing brief
    return updateBriefInSupabase(brief.id, brief)
  } else {
    // Create new brief
    return createBriefInSupabase(brief)
  }
}

/**
 * Delete a content brief
 */
export async function deleteBriefFromSupabase(id: string): Promise<void> {
  await deleteContentBrief(id)
}

// ===================
// Final Drafts Frontend Functions
// ===================

/**
 * Convert database final draft to frontend FinalDraft format
 */
function mapToFinalDraft(dbItem: MarketingFinalDraft): FinalDraft {
  return {
    id: dbItem.id,
    briefId: dbItem.brief_id || '',
    title: dbItem.title,
    targetFormat: dbItem.target_format as ContentType,
    content: dbItem.content,
    faqs: (dbItem.faqs || []) as FAQ[],
    author: dbItem.author,
    approvedAt: dbItem.approved_at,
    publishedAt: dbItem.published_at || undefined,
    keywords: dbItem.keywords || [],
  }
}

/**
 * Convert frontend FinalDraft to database insert format
 */
function mapFromFinalDraft(draft: FinalDraft): MarketingFinalDraftInsert {
  return {
    id: draft.id,
    brief_id: draft.briefId || null,
    title: draft.title,
    target_format: draft.targetFormat,
    content: draft.content,
    faqs: (draft.faqs || []) as FAQ[],
    author: draft.author,
    keywords: draft.keywords,
    approved_at: draft.approvedAt,
    published_at: draft.publishedAt || null,
  }
}

/**
 * Fetch all final drafts formatted for frontend
 * Optionally filter to only unpublished
 */
export async function fetchFinalDraftsForUI(
  unpublishedOnly?: boolean
): Promise<FinalDraft[]> {
  const dbItems = await fetchFinalDrafts(unpublishedOnly)
  return dbItems.map(mapToFinalDraft)
}

/**
 * Fetch a single final draft by ID
 */
export async function fetchFinalDraftByIdForUI(
  id: string
): Promise<FinalDraft | null> {
  const dbItem = await fetchFinalDraftById(id)
  return dbItem ? mapToFinalDraft(dbItem) : null
}

/**
 * Create a new final draft
 */
export async function createFinalDraftInSupabase(
  draft: FinalDraft
): Promise<FinalDraft> {
  const dbInsert = mapFromFinalDraft(draft)
  const dbItem = await createFinalDraft(dbInsert)
  return mapToFinalDraft(dbItem)
}

/**
 * Add a final draft (alias for create)
 */
export async function addFinalDraftToSupabase(
  draft: FinalDraft
): Promise<FinalDraft> {
  return createFinalDraftInSupabase(draft)
}

/**
 * Update a final draft (e.g., mark as published)
 */
export async function updateFinalDraftInSupabase(
  id: string,
  updates: Partial<FinalDraft>
): Promise<FinalDraft> {
  const dbUpdates: MarketingFinalDraftUpdate = {}

  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.content !== undefined) dbUpdates.content = updates.content
  if (updates.faqs !== undefined) dbUpdates.faqs = (updates.faqs || []) as FAQ[]
  if (updates.author !== undefined) dbUpdates.author = updates.author
  if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords
  if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt || null

  const dbItem = await updateFinalDraft(id, dbUpdates)
  return mapToFinalDraft(dbItem)
}

/**
 * Publish a final draft
 */
export async function publishFinalDraftInSupabase(id: string): Promise<FinalDraft> {
  return updateFinalDraftInSupabase(id, {
    publishedAt: new Date().toISOString().split('T')[0],
  })
}

/**
 * Delete a final draft
 */
export async function deleteFinalDraftFromSupabase(id: string): Promise<void> {
  await deleteFinalDraft(id)
}

// ===================
// Refresh Finder Frontend Functions
// ===================

/**
 * Convert database refresh recommendation to frontend RefreshRecommendation format
 */
function mapToRefreshRecommendation(dbItem: MarketingRefreshRecommendation): RefreshRecommendation {
  return {
    id: dbItem.id,
    contentId: dbItem.content_id,
    title: dbItem.title,
    contentType: dbItem.content_type as ContentType,
    currentRanking: dbItem.current_ranking || undefined,
    previousRanking: dbItem.previous_ranking || undefined,
    trafficChange: dbItem.traffic_change ? Number(dbItem.traffic_change) : undefined,
    lastUpdated: dbItem.last_analyzed_at,
    recommendedActions: dbItem.recommended_actions || [],
    priority: dbItem.priority as RefreshPriority,
    status: dbItem.status as RefreshStatus,
    refreshTrigger: dbItem.refresh_trigger as RefreshTrigger,
    timeSensitiveDate: dbItem.time_sensitive_date || undefined,
  }
}

/**
 * Convert frontend RefreshRecommendation to database insert format
 */
function mapFromRefreshRecommendation(rec: RefreshRecommendation): MarketingRefreshRecommendationInsert {
  return {
    id: rec.id,
    content_id: rec.contentId,
    title: rec.title,
    content_type: rec.contentType,
    current_ranking: rec.currentRanking || null,
    previous_ranking: rec.previousRanking || null,
    traffic_change: rec.trafficChange || null,
    recommended_actions: rec.recommendedActions,
    priority: rec.priority,
    status: rec.status,
    refresh_trigger: rec.refreshTrigger,
    time_sensitive_date: rec.timeSensitiveDate || null,
  }
}

/**
 * Fetch all refresh recommendations formatted for frontend
 * Optionally filter by status
 */
export async function fetchRefreshRecommendationsForUI(
  status?: RefreshStatus
): Promise<RefreshRecommendation[]> {
  const dbItems = await fetchRefreshRecommendations(status)
  return dbItems.map(mapToRefreshRecommendation)
}

/**
 * Fetch pending refresh recommendations (needs attention)
 */
export async function fetchPendingRefreshRecommendations(): Promise<RefreshRecommendation[]> {
  return fetchRefreshRecommendationsForUI('pending')
}

/**
 * Add refresh recommendations (from analysis workflow)
 */
export async function addRefreshRecommendationsToSupabase(
  recommendations: RefreshRecommendation[]
): Promise<RefreshRecommendation[]> {
  const dbInserts = recommendations.map(mapFromRefreshRecommendation)
  const dbItems = await createRefreshRecommendations(dbInserts)
  return dbItems.map(mapToRefreshRecommendation)
}

/**
 * Start refresh for a recommendation
 */
export async function startRefreshInSupabase(id: string): Promise<RefreshRecommendation> {
  const dbItem = await updateRefreshRecommendation(id, { status: 'in_progress' })
  return mapToRefreshRecommendation(dbItem)
}

/**
 * Complete a refresh recommendation
 */
export async function completeRefreshInSupabase(id: string): Promise<RefreshRecommendation> {
  const dbItem = await updateRefreshRecommendation(id, { status: 'completed' })
  return mapToRefreshRecommendation(dbItem)
}

/**
 * Dismiss a refresh recommendation
 */
export async function dismissRefreshInSupabase(id: string): Promise<RefreshRecommendation> {
  const dbItem = await updateRefreshRecommendation(id, { status: 'dismissed' })
  return mapToRefreshRecommendation(dbItem)
}

/**
 * Update a refresh recommendation with new analysis data
 */
export async function updateRefreshRecommendationInSupabase(
  id: string,
  updates: Partial<RefreshRecommendation>
): Promise<RefreshRecommendation> {
  const dbUpdates: MarketingRefreshRecommendationUpdate = {}

  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.currentRanking !== undefined) dbUpdates.current_ranking = updates.currentRanking || null
  if (updates.previousRanking !== undefined) dbUpdates.previous_ranking = updates.previousRanking || null
  if (updates.trafficChange !== undefined) dbUpdates.traffic_change = updates.trafficChange || null
  if (updates.recommendedActions !== undefined) dbUpdates.recommended_actions = updates.recommendedActions
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.timeSensitiveDate !== undefined) dbUpdates.time_sensitive_date = updates.timeSensitiveDate || null

  const dbItem = await updateRefreshRecommendation(id, dbUpdates)
  return mapToRefreshRecommendation(dbItem)
}

// ===================
// Content Library
// ===================

/**
 * Fetch all content items from the library
 * Optionally filter by content type
 */
export async function fetchContentLibrary(
  contentType?: string
): Promise<MarketingContentItem[]> {
  let query = supabase
    .from('marketing_content_items')
    .select('*')
    .order('date_created', { ascending: false })

  if (contentType) {
    query = query.eq('content_type', contentType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching content library:', error)
    throw new Error(`Failed to fetch content library: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch a single content item by ID
 */
export async function fetchContentItemById(id: string): Promise<MarketingContentItem | null> {
  const { data, error } = await supabase
    .from('marketing_content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching content item:', error)
    throw new Error(`Failed to fetch content item: ${error.message}`)
  }

  return data
}

/**
 * Create a new content item
 */
export async function createContentItem(
  item: MarketingContentItemInsert
): Promise<MarketingContentItem> {
  const { data, error } = await supabase
    .from('marketing_content_items')
    .insert(item as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating content item:', error)
    throw new Error(`Failed to create content item: ${error.message}`)
  }

  return data
}

/**
 * Update a content item
 */
export async function updateContentItem(
  id: string,
  updates: MarketingContentItemUpdate
): Promise<MarketingContentItem> {
  const { data, error } = await supabase
    .from('marketing_content_items')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating content item:', error)
    throw new Error(`Failed to update content item: ${error.message}`)
  }

  return data
}

/**
 * Delete a content item
 */
export async function deleteContentItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_content_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting content item:', error)
    throw new Error(`Failed to delete content item: ${error.message}`)
  }
}

/**
 * Upsert content item (for sync workflows)
 * Uses source_platform + source_id as unique key
 */
export async function upsertContentItem(
  item: MarketingContentItemInsert
): Promise<MarketingContentItem> {
  const { data, error } = await supabase
    .from('marketing_content_items')
    .upsert(item as never, {
      onConflict: 'source_platform,source_id',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting content item:', error)
    throw new Error(`Failed to upsert content item: ${error.message}`)
  }

  return data
}

// ===================
// Topic Ideas
// ===================

/**
 * Fetch all topic ideas
 * Optionally filter by status and/or category
 */
export async function fetchTopicIdeas(
  status?: string,
  category?: string
): Promise<MarketingTopicIdea[]> {
  let query = supabase
    .from('marketing_topic_ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }
  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching topic ideas:', error)
    throw new Error(`Failed to fetch topic ideas: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch a single topic idea by ID
 */
export async function fetchTopicIdeaById(id: string): Promise<MarketingTopicIdea | null> {
  const { data, error } = await supabase
    .from('marketing_topic_ideas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching topic idea:', error)
    throw new Error(`Failed to fetch topic idea: ${error.message}`)
  }

  return data
}

/**
 * Create multiple topic ideas (batch insert from AI generation)
 */
export async function createTopicIdeas(
  ideas: MarketingTopicIdeaInsert[]
): Promise<MarketingTopicIdea[]> {
  const { data, error } = await supabase
    .from('marketing_topic_ideas')
    .insert(ideas as never[])
    .select()

  if (error) {
    console.error('Error creating topic ideas:', error)
    throw new Error(`Failed to create topic ideas: ${error.message}`)
  }

  return data || []
}

/**
 * Update a topic idea (e.g., approve/reject)
 */
export async function updateTopicIdea(
  id: string,
  updates: MarketingTopicIdeaUpdate
): Promise<MarketingTopicIdea> {
  const { data, error } = await supabase
    .from('marketing_topic_ideas')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating topic idea:', error)
    throw new Error(`Failed to update topic idea: ${error.message}`)
  }

  return data
}

/**
 * Delete a topic idea
 */
export async function deleteTopicIdea(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_topic_ideas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting topic idea:', error)
    throw new Error(`Failed to delete topic idea: ${error.message}`)
  }
}

// ===================
// Content Briefs
// ===================

/**
 * Fetch all content briefs
 * Optionally filter by status
 */
export async function fetchContentBriefs(
  status?: string
): Promise<MarketingContentBrief[]> {
  let query = supabase
    .from('marketing_content_briefs')
    .select('*')
    .order('updated_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching content briefs:', error)
    throw new Error(`Failed to fetch content briefs: ${error.message}`)
  }

  return (data || []) as MarketingContentBrief[]
}

/**
 * Fetch a single content brief by ID
 */
export async function fetchContentBriefById(id: string): Promise<MarketingContentBrief | null> {
  const { data, error } = await supabase
    .from('marketing_content_briefs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching content brief:', error)
    throw new Error(`Failed to fetch content brief: ${error.message}`)
  }

  return data as MarketingContentBrief
}

/**
 * Create a new content brief
 */
export async function createContentBrief(
  brief: MarketingContentBriefInsert
): Promise<MarketingContentBrief> {
  const { data, error } = await supabase
    .from('marketing_content_briefs')
    .insert(brief as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating content brief:', error)
    throw new Error(`Failed to create content brief: ${error.message}`)
  }

  return data as MarketingContentBrief
}

/**
 * Update a content brief
 */
export async function updateContentBrief(
  id: string,
  updates: MarketingContentBriefUpdate
): Promise<MarketingContentBrief> {
  const { data, error } = await supabase
    .from('marketing_content_briefs')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating content brief:', error)
    throw new Error(`Failed to update content brief: ${error.message}`)
  }

  return data as MarketingContentBrief
}

/**
 * Delete a content brief
 */
export async function deleteContentBrief(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_content_briefs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting content brief:', error)
    throw new Error(`Failed to delete content brief: ${error.message}`)
  }
}

// ===================
// Final Drafts
// ===================

/**
 * Fetch all final drafts
 * Optionally filter to only unpublished
 */
export async function fetchFinalDrafts(
  unpublishedOnly?: boolean
): Promise<MarketingFinalDraft[]> {
  let query = supabase
    .from('marketing_final_drafts')
    .select('*')
    .order('approved_at', { ascending: false })

  if (unpublishedOnly) {
    query = query.is('published_at', null)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching final drafts:', error)
    throw new Error(`Failed to fetch final drafts: ${error.message}`)
  }

  return (data || []) as MarketingFinalDraft[]
}

/**
 * Fetch a single final draft by ID
 */
export async function fetchFinalDraftById(id: string): Promise<MarketingFinalDraft | null> {
  const { data, error } = await supabase
    .from('marketing_final_drafts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching final draft:', error)
    throw new Error(`Failed to fetch final draft: ${error.message}`)
  }

  return data as MarketingFinalDraft
}

/**
 * Create a new final draft
 */
export async function createFinalDraft(
  draft: MarketingFinalDraftInsert
): Promise<MarketingFinalDraft> {
  const { data, error } = await supabase
    .from('marketing_final_drafts')
    .insert(draft as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating final draft:', error)
    throw new Error(`Failed to create final draft: ${error.message}`)
  }

  return data as MarketingFinalDraft
}

/**
 * Update a final draft (e.g., mark as published)
 */
export async function updateFinalDraft(
  id: string,
  updates: MarketingFinalDraftUpdate
): Promise<MarketingFinalDraft> {
  const { data, error } = await supabase
    .from('marketing_final_drafts')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating final draft:', error)
    throw new Error(`Failed to update final draft: ${error.message}`)
  }

  return data as MarketingFinalDraft
}

/**
 * Delete a final draft
 */
export async function deleteFinalDraft(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_final_drafts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting final draft:', error)
    throw new Error(`Failed to delete final draft: ${error.message}`)
  }
}

// ===================
// Refresh Recommendations
// ===================

/**
 * Fetch all refresh recommendations
 * Optionally filter by status
 */
export async function fetchRefreshRecommendations(
  status?: string
): Promise<MarketingRefreshRecommendation[]> {
  let query = supabase
    .from('marketing_refresh_recommendations')
    .select('*')
    .order('priority', { ascending: false })
    .order('last_analyzed_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching refresh recommendations:', error)
    throw new Error(`Failed to fetch refresh recommendations: ${error.message}`)
  }

  return data || []
}

/**
 * Create refresh recommendations (batch from analysis)
 */
export async function createRefreshRecommendations(
  recommendations: MarketingRefreshRecommendationInsert[]
): Promise<MarketingRefreshRecommendation[]> {
  const { data, error } = await supabase
    .from('marketing_refresh_recommendations')
    .insert(recommendations as never[])
    .select()

  if (error) {
    console.error('Error creating refresh recommendations:', error)
    throw new Error(`Failed to create refresh recommendations: ${error.message}`)
  }

  return data || []
}

/**
 * Update a refresh recommendation
 */
export async function updateRefreshRecommendation(
  id: string,
  updates: MarketingRefreshRecommendationUpdate
): Promise<MarketingRefreshRecommendation> {
  const { data, error } = await supabase
    .from('marketing_refresh_recommendations')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating refresh recommendation:', error)
    throw new Error(`Failed to update refresh recommendation: ${error.message}`)
  }

  return data
}

// ===================
// Sync Logs
// ===================

/**
 * Fetch recent sync logs
 */
export async function fetchSyncLogs(
  limit: number = 20
): Promise<MarketingSyncLog[]> {
  const { data, error } = await supabase
    .from('marketing_sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching sync logs:', error)
    throw new Error(`Failed to fetch sync logs: ${error.message}`)
  }

  return data || []
}

/**
 * Create a sync log entry (start of sync)
 */
export async function createSyncLog(
  log: MarketingSyncLogInsert
): Promise<MarketingSyncLog> {
  const { data, error } = await supabase
    .from('marketing_sync_logs')
    .insert(log as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating sync log:', error)
    throw new Error(`Failed to create sync log: ${error.message}`)
  }

  return data
}

/**
 * Update a sync log (end of sync with results)
 */
export async function updateSyncLog(
  id: string,
  updates: MarketingSyncLogUpdate
): Promise<MarketingSyncLog> {
  const { data, error } = await supabase
    .from('marketing_sync_logs')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating sync log:', error)
    throw new Error(`Failed to update sync log: ${error.message}`)
  }

  return data
}

// ===================
// Competitor Domains
// ===================

/**
 * Fetch all active competitor domains
 */
export async function fetchCompetitorDomains(): Promise<MarketingCompetitorDomain[]> {
  const { data, error } = await supabase
    .from('marketing_competitor_domains')
    .select('*')
    .eq('is_active', true)
    .order('company_name', { ascending: true })

  if (error) {
    console.error('Error fetching competitor domains:', error)
    throw new Error(`Failed to fetch competitor domains: ${error.message}`)
  }

  return data || []
}

/**
 * Create a new competitor domain
 */
export async function createCompetitorDomain(
  domain: MarketingCompetitorDomainInsert
): Promise<MarketingCompetitorDomain> {
  const { data, error } = await supabase
    .from('marketing_competitor_domains')
    .insert(domain as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating competitor domain:', error)
    throw new Error(`Failed to create competitor domain: ${error.message}`)
  }

  return data
}

// ===================
// Statistics / Dashboard
// ===================

/**
 * Get marketing content statistics for dashboard
 */
export async function getMarketingStats(): Promise<{
  totalContent: number
  contentByType: Record<string, number>
  newIdeas: number
  approvedIdeas: number
  briefsInProgress: number
  finalDraftsReady: number
}> {
  // Fetch content counts by type
  const { data: contentData, error: contentError } = await supabase
    .from('marketing_content_items')
    .select('content_type')

  if (contentError) {
    console.error('Error fetching content stats:', contentError)
    throw new Error(`Failed to fetch content stats: ${contentError.message}`)
  }

  const contentByType: Record<string, number> = {}
  for (const item of contentData || []) {
    contentByType[item.content_type] = (contentByType[item.content_type] || 0) + 1
  }

  // Fetch idea counts
  const { data: ideasData, error: ideasError } = await supabase
    .from('marketing_topic_ideas')
    .select('status')

  if (ideasError) {
    console.error('Error fetching ideas stats:', ideasError)
    throw new Error(`Failed to fetch ideas stats: ${ideasError.message}`)
  }

  const newIdeas = (ideasData || []).filter(i => i.status === 'new').length
  const approvedIdeas = (ideasData || []).filter(i => i.status === 'approved').length

  // Fetch brief counts
  const { data: briefsData, error: briefsError } = await supabase
    .from('marketing_content_briefs')
    .select('status')
    .neq('status', 'completed')

  if (briefsError) {
    console.error('Error fetching briefs stats:', briefsError)
    throw new Error(`Failed to fetch briefs stats: ${briefsError.message}`)
  }

  // Fetch unpublished final drafts
  const { data: draftsData, error: draftsError } = await supabase
    .from('marketing_final_drafts')
    .select('id')
    .is('published_at', null)

  if (draftsError) {
    console.error('Error fetching drafts stats:', draftsError)
    throw new Error(`Failed to fetch drafts stats: ${draftsError.message}`)
  }

  return {
    totalContent: contentData?.length || 0,
    contentByType,
    newIdeas,
    approvedIdeas,
    briefsInProgress: briefsData?.length || 0,
    finalDraftsReady: draftsData?.length || 0,
  }
}
