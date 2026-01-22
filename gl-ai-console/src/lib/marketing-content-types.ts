// Marketing Content Engine Types

// Content type categories
export type ContentType = 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'meeting_transcript'

// Content status
export type ContentStatus = 'published' | 'draft' | 'archived'

// Topic idea status
export type TopicIdeaStatus = 'new' | 'approved' | 'in_progress' | 'completed' | 'rejected'

// Brief status
export type BriefStatus = 'draft' | 'approved' | 'in_progress' | 'completed'

// Refresh priority
export type RefreshPriority = 'low' | 'medium' | 'high'

// Refresh status
export type RefreshStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed'

// Refresh trigger type (per Marketing-Console-Details.md)
export type RefreshTrigger = 'analytics_decay' | 'time_sensitive'

// Content source origin for repurposing (per Marketing-Console-Details.md)
export type ContentSourceOrigin = 'ai_generated' | 'uploaded' | 'scraped'

// Chat message role
export type ChatRole = 'user' | 'assistant'

// Workflow context for chat
export type WorkflowContext = 'dashboard' | 'topic_radar' | 'brief_builder' | 'repurpose' | 'refresh' | 'library'

// ===================
// Content Library
// ===================

export interface ContentItem {
  id: string
  title: string
  type: ContentType
  url?: string
  dateCreated: string
  lastUpdated?: string
  status: ContentStatus
  keywords?: string[]
  wordCount?: number
  author?: string
  description?: string
}

// Labels and colors for content types
export const contentTypeLabels: Record<ContentType, string> = {
  blog: 'Blog Post',
  linkedin: 'LinkedIn Post',
  youtube: 'YouTube Video',
  case_study: 'Case Study',
  website_page: 'Website Page',
  meeting_transcript: 'Meeting Transcript',
}

export const contentTypeColors: Record<ContentType, string> = {
  blog: 'bg-blue-100 text-blue-800',
  linkedin: 'bg-sky-100 text-sky-800',
  youtube: 'bg-red-100 text-red-800',
  case_study: 'bg-green-100 text-green-800',
  website_page: 'bg-purple-100 text-purple-800',
  meeting_transcript: 'bg-amber-100 text-amber-800',
}

// ===================
// Topic Radar
// ===================

export interface TopicIdea {
  id: string
  topic: string
  gapScore: number // 0-100
  rationale: string
  suggestedFormat: ContentType
  relatedContentIds?: string[]
  status: TopicIdeaStatus
  createdAt: string
  createdBy: string // 'ai' or user name
}

export const topicIdeaStatusLabels: Record<TopicIdeaStatus, string> = {
  new: 'New',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
}

export const topicIdeaStatusColors: Record<TopicIdeaStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

// ===================
// Brief Builder
// ===================

export interface ContentBrief {
  id: string
  title: string
  status: BriefStatus
  targetFormat: ContentType
  targetKeywords: string[]
  outline: string[]
  notes?: string
  sourceTopicId?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export const briefStatusLabels: Record<BriefStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export const briefStatusColors: Record<BriefStatus, string> = {
  draft: 'bg-slate-100 text-slate-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
}

// ===================
// Repurpose Factory
// ===================

export interface RepurposeItem {
  id: string
  sourceContentId: string
  sourceTitle: string
  sourceType: ContentType
  sourceOrigin: ContentSourceOrigin // ai_generated, uploaded, or scraped
  suggestedFormats: ContentType[]
  repurposedCount: number // how many formats already created
  lastRepurposed?: string
}

export const sourceOriginLabels: Record<ContentSourceOrigin, string> = {
  ai_generated: 'AI Generated',
  uploaded: 'Uploaded',
  scraped: 'Auto-Imported',
}

export const sourceOriginColors: Record<ContentSourceOrigin, string> = {
  ai_generated: 'bg-purple-100 text-purple-800',
  uploaded: 'bg-blue-100 text-blue-800',
  scraped: 'bg-slate-100 text-slate-800',
}

// ===================
// Refresh Finder
// ===================

export interface RefreshRecommendation {
  id: string
  contentId: string
  title: string
  contentType: ContentType
  currentRanking?: number
  previousRanking?: number
  trafficChange?: number // percentage, negative means decline
  lastUpdated: string
  recommendedActions: string[]
  priority: RefreshPriority
  status: RefreshStatus
  refreshTrigger: RefreshTrigger // analytics_decay or time_sensitive
  timeSensitiveDate?: string // e.g., "2025" for year-based content
}

export const refreshPriorityLabels: Record<RefreshPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const refreshPriorityColors: Record<RefreshPriority, string> = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
}

export const refreshTriggerLabels: Record<RefreshTrigger, string> = {
  analytics_decay: 'Analytics Decay',
  time_sensitive: 'Time-Sensitive',
}

export const refreshTriggerColors: Record<RefreshTrigger, string> = {
  analytics_decay: 'bg-orange-100 text-orange-800',
  time_sensitive: 'bg-pink-100 text-pink-800',
}

// ===================
// Chat
// ===================

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  workflowContext: WorkflowContext
  messages: ChatMessage[]
  createdAt: string
}
