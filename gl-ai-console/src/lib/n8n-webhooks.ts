// n8n Webhook Integration for Marketing Department
// This file provides typed functions for triggering n8n workflows

// Base URL for n8n webhooks (configure in environment)
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.srv1055749.hstgr.cloud/webhook'

// ===================
// Types
// ===================

export interface WebhookResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Topic Radar types
export interface TopicRadarRequest {
  category: 'generalized' | 'competitor' | 'market_trends'
  contentLibrarySnapshot?: boolean // Include current content for gap analysis
}

export interface TopicRadarResponse {
  ideas: Array<{
    topic: string
    gapScore: number
    rationale: string
    suggestedFormat: string
    relatedContentIds?: string[]
  }>
}

// Brief Builder types
export interface BriefBuilderRequest {
  briefId: string
  step: 'outline' | 'first_draft' | 'faqs_links' | 'author_recommendation'
  context?: {
    title?: string
    targetFormat?: string
    targetKeywords?: string[]
    outline?: unknown[]
  }
}

export interface BriefBuilderResponse {
  briefId: string
  step: string
  generatedContent: unknown
}

// Repurpose Factory types
export interface RepurposeRequest {
  sourceContentId: string
  sourceContent: string
  sourceFormat: string
  targetFormats: string[]
}

export interface RepurposeResponse {
  sourceContentId: string
  variations: Array<{
    format: string
    content: string
    title?: string
  }>
}

// Refresh Finder types
export interface RefreshAnalysisRequest {
  contentIds?: string[] // Specific content to analyze, or all if empty
  analysisType: 'analytics_decay' | 'time_sensitive' | 'both'
}

export interface RefreshAnalysisResponse {
  recommendations: Array<{
    contentId: string
    title: string
    contentType: string
    priority: 'low' | 'medium' | 'high'
    refreshTrigger: 'analytics_decay' | 'time_sensitive'
    recommendedActions: string[]
    trafficChange?: number
    timeSensitiveDate?: string
  }>
}

// Influencer Discovery types
export interface InfluencerDiscoveryRequest {
  type: 'general' | 'custom'
  customPrompt?: string
  platform?: 'linkedin' | 'twitter' | 'youtube'
}

export interface InfluencerDiscoveryResponse {
  influencers: Array<{
    name: string
    platform: string
    profileUrl: string
    followerCount: number
    averageEngagement: number
    niche: string[]
    icpMatch: 'high' | 'medium' | 'low'
    icpMatchReason: string
  }>
}

// Hypothesis Lab types
export interface HypothesisGenerateRequest {
  workflowId: string
  step: 'who_where' | 'how_what' | 'email_copy' | 'linkedin_copy'
  context?: {
    targetDescription?: string
    entryMode?: 'general' | 'specific'
    leadSource?: 'clay' | 'trigify' | 'csv_upload'
  }
}

export interface HypothesisGenerateResponse {
  workflowId: string
  step: string
  generatedContent: unknown
}

// Content Sync types
export interface ContentSyncRequest {
  syncType: 'blogs' | 'case_studies' | 'youtube' | 'linkedin' | 'fireflies' | 'newsletters' | 'all'
  forceRefresh?: boolean
}

export interface ContentSyncResponse {
  syncType: string
  itemsProcessed: number
  itemsAdded: number
  itemsUpdated: number
  errors?: string[]
}

// ===================
// Webhook Functions
// ===================

/**
 * Generic webhook caller with error handling
 */
async function callWebhook<TRequest, TResponse>(
  endpoint: string,
  data: TRequest
): Promise<WebhookResponse<TResponse>> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result as TResponse,
    }
  } catch (error) {
    console.error(`Webhook error (${endpoint}):`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ===================
// Topic Radar Webhooks
// ===================

/**
 * Trigger topic radar analysis for content gaps
 */
export async function triggerTopicRadar(
  request: TopicRadarRequest
): Promise<WebhookResponse<TopicRadarResponse>> {
  return callWebhook<TopicRadarRequest, TopicRadarResponse>(
    'marketing/topic-radar',
    request
  )
}

/**
 * Trigger generalized content gap analysis
 */
export async function triggerContentGapAnalysis(): Promise<WebhookResponse<TopicRadarResponse>> {
  return triggerTopicRadar({ category: 'generalized', contentLibrarySnapshot: true })
}

/**
 * Trigger competitor-based topic analysis
 */
export async function triggerCompetitorAnalysis(): Promise<WebhookResponse<TopicRadarResponse>> {
  return triggerTopicRadar({ category: 'competitor' })
}

/**
 * Trigger market trends analysis
 */
export async function triggerTrendsAnalysis(): Promise<WebhookResponse<TopicRadarResponse>> {
  return triggerTopicRadar({ category: 'market_trends' })
}

// ===================
// Brief Builder Webhooks
// ===================

/**
 * Trigger AI generation for a brief step
 */
export async function triggerBriefGeneration(
  request: BriefBuilderRequest
): Promise<WebhookResponse<BriefBuilderResponse>> {
  return callWebhook<BriefBuilderRequest, BriefBuilderResponse>(
    'marketing/brief-builder',
    request
  )
}

/**
 * Generate outline for a brief
 */
export async function generateBriefOutline(
  briefId: string,
  title: string,
  targetFormat: string,
  targetKeywords: string[]
): Promise<WebhookResponse<BriefBuilderResponse>> {
  return triggerBriefGeneration({
    briefId,
    step: 'outline',
    context: { title, targetFormat, targetKeywords },
  })
}

/**
 * Generate first draft from outline
 */
export async function generateBriefDraft(
  briefId: string,
  outline: unknown[]
): Promise<WebhookResponse<BriefBuilderResponse>> {
  return triggerBriefGeneration({
    briefId,
    step: 'first_draft',
    context: { outline },
  })
}

// ===================
// Repurpose Factory Webhooks
// ===================

/**
 * Trigger content repurposing
 */
export async function triggerRepurpose(
  request: RepurposeRequest
): Promise<WebhookResponse<RepurposeResponse>> {
  return callWebhook<RepurposeRequest, RepurposeResponse>(
    'marketing/repurpose',
    request
  )
}

// ===================
// Refresh Finder Webhooks
// ===================

/**
 * Trigger refresh analysis
 */
export async function triggerRefreshAnalysis(
  request: RefreshAnalysisRequest
): Promise<WebhookResponse<RefreshAnalysisResponse>> {
  return callWebhook<RefreshAnalysisRequest, RefreshAnalysisResponse>(
    'marketing/refresh-analysis',
    request
  )
}

/**
 * Run full refresh analysis on all content
 */
export async function triggerFullRefreshAnalysis(): Promise<WebhookResponse<RefreshAnalysisResponse>> {
  return triggerRefreshAnalysis({ analysisType: 'both' })
}

// ===================
// Influencer Discovery Webhooks
// ===================

/**
 * Trigger influencer discovery
 */
export async function triggerInfluencerDiscovery(
  request: InfluencerDiscoveryRequest
): Promise<WebhookResponse<InfluencerDiscoveryResponse>> {
  return callWebhook<InfluencerDiscoveryRequest, InfluencerDiscoveryResponse>(
    'marketing/influencer-discovery',
    request
  )
}

/**
 * Run general ICP-based influencer discovery
 */
export async function triggerGeneralInfluencerDiscovery(): Promise<WebhookResponse<InfluencerDiscoveryResponse>> {
  return triggerInfluencerDiscovery({ type: 'general', platform: 'linkedin' })
}

/**
 * Run custom prompt-based influencer discovery
 */
export async function triggerCustomInfluencerDiscovery(
  customPrompt: string
): Promise<WebhookResponse<InfluencerDiscoveryResponse>> {
  return triggerInfluencerDiscovery({ type: 'custom', customPrompt })
}

// ===================
// Hypothesis Lab Webhooks
// ===================

/**
 * Trigger hypothesis generation for a workflow step
 */
export async function triggerHypothesisGeneration(
  request: HypothesisGenerateRequest
): Promise<WebhookResponse<HypothesisGenerateResponse>> {
  return callWebhook<HypothesisGenerateRequest, HypothesisGenerateResponse>(
    'marketing/hypothesis-generate',
    request
  )
}

// ===================
// Content Sync Webhooks
// ===================

/**
 * Trigger content library sync
 */
export async function triggerContentSync(
  request: ContentSyncRequest
): Promise<WebhookResponse<ContentSyncResponse>> {
  return callWebhook<ContentSyncRequest, ContentSyncResponse>(
    'marketing/content-sync',
    request
  )
}

/**
 * Sync all content sources
 */
export async function triggerFullContentSync(): Promise<WebhookResponse<ContentSyncResponse>> {
  return triggerContentSync({ syncType: 'all' })
}

/**
 * Sync blogs from website
 */
export async function triggerBlogSync(): Promise<WebhookResponse<ContentSyncResponse>> {
  return triggerContentSync({ syncType: 'blogs' })
}

/**
 * Sync YouTube videos
 */
export async function triggerYouTubeSync(): Promise<WebhookResponse<ContentSyncResponse>> {
  return triggerContentSync({ syncType: 'youtube' })
}

/**
 * Sync LinkedIn posts
 */
export async function triggerLinkedInSync(): Promise<WebhookResponse<ContentSyncResponse>> {
  return triggerContentSync({ syncType: 'linkedin' })
}
