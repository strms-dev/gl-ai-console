// TypeScript types for Marketing Department Supabase database schema
// This file defines the structure of all marketing tables

import type { Json } from './types'

// ===================
// Marketing Content Items
// ===================

export interface MarketingContentItem {
  id: string
  title: string
  content_type: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'meeting_transcript' | 'newsletter' | 'external' | 'instagram'
  url: string | null
  source_platform: string | null // 'duda', 'linkedin', 'youtube', 'fireflies', 'hubspot', 'manual'
  source_id: string | null
  status: 'published' | 'draft' | 'archived'
  author: string | null
  description: string | null
  full_content: string | null
  keywords: string[] | null
  word_count: number | null
  date_created: string
  last_updated: string | null
  synced_at: string | null
  created_at: string
  updated_at: string
}

export interface MarketingContentItemInsert {
  id?: string
  title: string
  content_type: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'meeting_transcript' | 'newsletter' | 'external' | 'instagram'
  url?: string | null
  source_platform?: string | null
  source_id?: string | null
  status?: 'published' | 'draft' | 'archived'
  author?: string | null
  description?: string | null
  full_content?: string | null
  keywords?: string[] | null
  word_count?: number | null
  date_created?: string
  last_updated?: string | null
  synced_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface MarketingContentItemUpdate {
  title?: string
  content_type?: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'meeting_transcript' | 'newsletter' | 'external' | 'instagram'
  url?: string | null
  source_platform?: string | null
  source_id?: string | null
  status?: 'published' | 'draft' | 'archived'
  author?: string | null
  description?: string | null
  full_content?: string | null
  keywords?: string[] | null
  word_count?: number | null
  date_created?: string
  last_updated?: string | null
  synced_at?: string | null
  updated_at?: string
}

// ===================
// Marketing Topic Ideas
// ===================

export interface MarketingTopicIdea {
  id: string
  topic: string
  gap_score: number | null
  rationale: string
  suggested_format: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  related_content_ids: string[] | null
  status: 'new' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  category: 'generalized' | 'competitor' | 'market_trends'
  generation_context: Json | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface MarketingTopicIdeaInsert {
  id?: string
  topic: string
  gap_score?: number | null
  rationale: string
  suggested_format: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  related_content_ids?: string[] | null
  status?: 'new' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  category: 'generalized' | 'competitor' | 'market_trends'
  generation_context?: Json | null
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface MarketingTopicIdeaUpdate {
  topic?: string
  gap_score?: number | null
  rationale?: string
  suggested_format?: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  related_content_ids?: string[] | null
  status?: 'new' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  category?: 'generalized' | 'competitor' | 'market_trends'
  generation_context?: Json | null
  created_by?: string
  updated_at?: string
}

// ===================
// Marketing Content Briefs
// ===================

// JSONB structure types
export interface OutlineSection {
  id: string
  title: string
  description?: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
}

export interface LinkRecommendation {
  id: string
  title: string
  url: string
  type: 'internal' | 'external'
  context?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
}

export interface MarketingContentBrief {
  id: string
  title: string
  status: 'draft' | 'approved' | 'in_progress' | 'completed'
  current_step: 'format_selection' | 'outline' | 'first_draft' | 'author_selection' | 'final_review' | 'published'
  target_format: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  target_keywords: string[] | null
  outline: OutlineSection[]
  outline_approved: boolean | null
  first_draft: string | null
  faqs: FAQ[]
  internal_links: LinkRecommendation[]
  external_links: LinkRecommendation[]
  recommended_author: string | null
  final_draft: string | null
  notes: string | null
  source_topic_id: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface MarketingContentBriefInsert {
  id?: string
  title: string
  status?: 'draft' | 'approved' | 'in_progress' | 'completed'
  current_step?: 'format_selection' | 'outline' | 'first_draft' | 'author_selection' | 'final_review' | 'published'
  target_format: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  target_keywords?: string[] | null
  outline?: OutlineSection[]
  outline_approved?: boolean | null
  first_draft?: string | null
  faqs?: FAQ[]
  internal_links?: LinkRecommendation[]
  external_links?: LinkRecommendation[]
  recommended_author?: string | null
  final_draft?: string | null
  notes?: string | null
  source_topic_id?: string | null
  assigned_to?: string | null
  created_at?: string
  updated_at?: string
  published_at?: string | null
}

export interface MarketingContentBriefUpdate {
  title?: string
  status?: 'draft' | 'approved' | 'in_progress' | 'completed'
  current_step?: 'format_selection' | 'outline' | 'first_draft' | 'author_selection' | 'final_review' | 'published'
  target_format?: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  target_keywords?: string[] | null
  outline?: OutlineSection[]
  outline_approved?: boolean | null
  first_draft?: string | null
  faqs?: FAQ[]
  internal_links?: LinkRecommendation[]
  external_links?: LinkRecommendation[]
  recommended_author?: string | null
  final_draft?: string | null
  notes?: string | null
  source_topic_id?: string | null
  assigned_to?: string | null
  updated_at?: string
  published_at?: string | null
}

// ===================
// Marketing Final Drafts
// ===================

export interface MarketingFinalDraft {
  id: string
  brief_id: string | null
  title: string
  target_format: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  content: string
  faqs: FAQ[]
  author: string
  keywords: string[] | null
  approved_at: string
  published_at: string | null
  published_content_id: string | null
  created_at: string
  updated_at: string
}

export interface MarketingFinalDraftInsert {
  id?: string
  brief_id?: string | null
  title: string
  target_format: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  content: string
  faqs?: FAQ[]
  author: string
  keywords?: string[] | null
  approved_at?: string
  published_at?: string | null
  published_content_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface MarketingFinalDraftUpdate {
  brief_id?: string | null
  title?: string
  target_format?: 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'instagram' | 'newsletter'
  content?: string
  faqs?: FAQ[]
  author?: string
  keywords?: string[] | null
  approved_at?: string
  published_at?: string | null
  published_content_id?: string | null
  updated_at?: string
}

// ===================
// Marketing Refresh Recommendations
// ===================

export interface MarketingRefreshRecommendation {
  id: string
  content_id: string
  title: string
  content_type: string
  current_ranking: number | null
  previous_ranking: number | null
  traffic_change: number | null
  recommended_actions: string[] | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  refresh_trigger: 'analytics_decay' | 'time_sensitive'
  time_sensitive_date: string | null
  analysis_data: Json | null
  last_analyzed_at: string
  created_at: string
  updated_at: string
}

export interface MarketingRefreshRecommendationInsert {
  id?: string
  content_id: string
  title: string
  content_type: string
  current_ranking?: number | null
  previous_ranking?: number | null
  traffic_change?: number | null
  recommended_actions?: string[] | null
  priority: 'low' | 'medium' | 'high'
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  refresh_trigger: 'analytics_decay' | 'time_sensitive'
  time_sensitive_date?: string | null
  analysis_data?: Json | null
  last_analyzed_at?: string
  created_at?: string
  updated_at?: string
}

export interface MarketingRefreshRecommendationUpdate {
  content_id?: string
  title?: string
  content_type?: string
  current_ranking?: number | null
  previous_ranking?: number | null
  traffic_change?: number | null
  recommended_actions?: string[] | null
  priority?: 'low' | 'medium' | 'high'
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  refresh_trigger?: 'analytics_decay' | 'time_sensitive'
  time_sensitive_date?: string | null
  analysis_data?: Json | null
  last_analyzed_at?: string
  updated_at?: string
}

// ===================
// Marketing Sync Logs
// ===================

export interface MarketingSyncLog {
  id: string
  sync_type: string
  status: 'running' | 'completed' | 'failed'
  items_processed: number | null
  items_added: number | null
  items_updated: number | null
  error_message: string | null
  metadata: Json | null
  started_at: string
  completed_at: string | null
}

export interface MarketingSyncLogInsert {
  id?: string
  sync_type: string
  status: 'running' | 'completed' | 'failed'
  items_processed?: number | null
  items_added?: number | null
  items_updated?: number | null
  error_message?: string | null
  metadata?: Json | null
  started_at?: string
  completed_at?: string | null
}

export interface MarketingSyncLogUpdate {
  sync_type?: string
  status?: 'running' | 'completed' | 'failed'
  items_processed?: number | null
  items_added?: number | null
  items_updated?: number | null
  error_message?: string | null
  metadata?: Json | null
  completed_at?: string | null
}

// ===================
// Marketing Competitor Domains
// ===================

export interface MarketingCompetitorDomain {
  id: string
  domain: string
  company_name: string | null
  notes: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export interface MarketingCompetitorDomainInsert {
  id?: string
  domain: string
  company_name?: string | null
  notes?: string | null
  is_active?: boolean | null
  created_at?: string
  updated_at?: string
}

export interface MarketingCompetitorDomainUpdate {
  domain?: string
  company_name?: string | null
  notes?: string | null
  is_active?: boolean | null
  updated_at?: string
}

// ===================
// Marketing Influencers
// ===================

export interface MarketingInfluencer {
  id: string
  name: string
  platform: 'linkedin' | 'twitter' | 'youtube' | 'podcast' | 'newsletter'
  profile_url: string
  follower_count: number | null
  average_engagement: number | null
  niche: string[] | null
  icp_match: 'high' | 'medium' | 'low'
  icp_match_reason: string | null
  status: 'discovered' | 'approved' | 'added_to_trigify' | 'rejected'
  discovered_by: string
  discovery_prompt: string | null
  added_to_trigify_at: string | null
  discovered_at: string
  created_at: string
  updated_at: string
}

export interface MarketingInfluencerInsert {
  id?: string
  name: string
  platform?: 'linkedin' | 'twitter' | 'youtube' | 'podcast' | 'newsletter'
  profile_url: string
  follower_count?: number | null
  average_engagement?: number | null
  niche?: string[] | null
  icp_match: 'high' | 'medium' | 'low'
  icp_match_reason?: string | null
  status?: 'discovered' | 'approved' | 'added_to_trigify' | 'rejected'
  discovered_by?: string
  discovery_prompt?: string | null
  added_to_trigify_at?: string | null
  discovered_at?: string
  created_at?: string
  updated_at?: string
}

export interface MarketingInfluencerUpdate {
  name?: string
  platform?: 'linkedin' | 'twitter' | 'youtube' | 'podcast' | 'newsletter'
  profile_url?: string
  follower_count?: number | null
  average_engagement?: number | null
  niche?: string[] | null
  icp_match?: 'high' | 'medium' | 'low'
  icp_match_reason?: string | null
  status?: 'discovered' | 'approved' | 'added_to_trigify' | 'rejected'
  discovered_by?: string
  discovery_prompt?: string | null
  added_to_trigify_at?: string | null
  updated_at?: string
}

// ===================
// Marketing Hypothesis Workflows
// ===================

// JSONB structure types for hypothesis workflows
export interface SearchCriteria {
  id: string
  field: string
  value: string
  enabled: boolean
}

export interface EnrichmentField {
  id: string
  field: string
  description?: string
  enabled: boolean
}

export interface FilterCriteria {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range'
  value: string
  enabled: boolean
}

export interface HypothesisEmailCopy {
  id: string
  subject: string
  body: string
  sequence_number: number
  approval_status: 'pending' | 'approved' | 'edited'
}

export interface HypothesisLinkedInCopy {
  id: string
  message: string
  sequence_number: number
  approval_status: 'pending' | 'approved' | 'edited'
}

export interface MarketingHypothesisWorkflow {
  id: string
  target_description: string
  entry_mode: 'general' | 'specific'
  lead_source: 'clay' | 'trigify' | 'csv_upload'
  search_criteria: SearchCriteria[]
  enrichment_fields: EnrichmentField[]
  filter_criteria: FilterCriteria[]
  email_copies: HypothesisEmailCopy[]
  linkedin_copies: HypothesisLinkedInCopy[]
  status: 'draft' | 'approved' | 'completed'
  current_step: 'who_where' | 'how_what' | 'email_copy' | 'linkedin_copy'
  approved_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface MarketingHypothesisWorkflowInsert {
  id?: string
  target_description: string
  entry_mode: 'general' | 'specific'
  lead_source: 'clay' | 'trigify' | 'csv_upload'
  search_criteria?: SearchCriteria[]
  enrichment_fields?: EnrichmentField[]
  filter_criteria?: FilterCriteria[]
  email_copies?: HypothesisEmailCopy[]
  linkedin_copies?: HypothesisLinkedInCopy[]
  status?: 'draft' | 'approved' | 'completed'
  current_step?: 'who_where' | 'how_what' | 'email_copy' | 'linkedin_copy'
  approved_at?: string | null
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface MarketingHypothesisWorkflowUpdate {
  target_description?: string
  entry_mode?: 'general' | 'specific'
  lead_source?: 'clay' | 'trigify' | 'csv_upload'
  search_criteria?: SearchCriteria[]
  enrichment_fields?: EnrichmentField[]
  filter_criteria?: FilterCriteria[]
  email_copies?: HypothesisEmailCopy[]
  linkedin_copies?: HypothesisLinkedInCopy[]
  status?: 'draft' | 'approved' | 'completed'
  current_step?: 'who_where' | 'how_what' | 'email_copy' | 'linkedin_copy'
  approved_at?: string | null
  completed_at?: string | null
  updated_at?: string
}
