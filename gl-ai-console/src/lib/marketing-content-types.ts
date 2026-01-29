// Marketing Content Engine Types

// Content type categories
export type ContentType = 'blog' | 'linkedin' | 'youtube' | 'case_study' | 'website_page' | 'meeting_transcript' | 'external' | 'instagram'

// Content status
export type ContentStatus = 'published' | 'draft' | 'archived'

// Topic idea status
export type TopicIdeaStatus = 'new' | 'approved' | 'in_progress' | 'completed' | 'rejected'

// Topic category for analysis
export type TopicCategory = 'generalized' | 'competitor' | 'market_trends'

// Brief status
export type BriefStatus = 'draft' | 'approved' | 'in_progress' | 'completed'

// Brief workflow step
export type BriefStep = 'format_selection' | 'outline' | 'first_draft' | 'author_selection' | 'final_review' | 'published'

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
  external: 'External Content',
  instagram: 'Instagram Post',
}

export const contentTypeColors: Record<ContentType, string> = {
  blog: 'bg-blue-100 text-blue-800',
  linkedin: 'bg-sky-100 text-sky-800',
  youtube: 'bg-red-100 text-red-800',
  case_study: 'bg-green-100 text-green-800',
  website_page: 'bg-purple-100 text-purple-800',
  meeting_transcript: 'bg-amber-100 text-amber-800',
  external: 'bg-indigo-100 text-indigo-800',
  instagram: 'bg-pink-100 text-pink-800',
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
  category: TopicCategory // generalized, competitor, or market_trends
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

export const topicCategoryLabels: Record<TopicCategory, string> = {
  generalized: 'Content Gaps',
  competitor: 'Competitor Research',
  market_trends: 'Market Trends',
}

export const topicCategoryColors: Record<TopicCategory, string> = {
  generalized: 'bg-blue-100 text-blue-800',
  competitor: 'bg-orange-100 text-orange-800',
  market_trends: 'bg-teal-100 text-teal-800',
}

// ===================
// Brief Builder
// ===================

export interface OutlineSection {
  id: string
  title: string
  description?: string
}

// Approval status for FAQs and Links
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface LinkRecommendation {
  id: string
  title: string
  url: string
  type: 'internal' | 'external'
  context?: string // Why this link is recommended
  approvalStatus?: ApprovalStatus // For approve/deny workflow
}

export interface FAQ {
  id: string
  question: string
  answer: string
  approvalStatus?: ApprovalStatus // For approve/deny workflow
}

export interface ContentBrief {
  id: string
  title: string
  status: BriefStatus
  currentStep: BriefStep
  targetFormat: ContentType
  targetKeywords: string[]
  outline: OutlineSection[]
  outlineApproved?: boolean
  firstDraft?: string
  faqs?: FAQ[]
  internalLinks?: LinkRecommendation[]
  externalLinks?: LinkRecommendation[]
  recommendedAuthor?: string
  finalDraft?: string
  notes?: string
  sourceTopicId?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
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

export const briefStepLabels: Record<BriefStep, string> = {
  format_selection: 'Select Format',
  outline: 'Create Outline',
  first_draft: 'First Draft',
  author_selection: 'Assign Author',
  final_review: 'Final Review',
  published: 'Published',
}

export const briefStepColors: Record<BriefStep, string> = {
  format_selection: 'bg-slate-100 text-slate-800',
  outline: 'bg-blue-100 text-blue-800',
  first_draft: 'bg-amber-100 text-amber-800',
  author_selection: 'bg-purple-100 text-purple-800',
  final_review: 'bg-teal-100 text-teal-800',
  published: 'bg-green-100 text-green-800',
}

// Authors list for recommendations
export const availableAuthors = [
  { id: 'dan', name: 'Dan Fennessy', role: 'CEO', expertise: ['accounting', 'finance', 'leadership'] },
  { id: 'alison', name: 'Alison Bulmer', role: 'Marketing', expertise: ['marketing', 'content', 'branding'] },
  { id: 'nick-s', name: 'Nick Sementilli', role: 'Operations', expertise: ['operations', 'technology', 'automation'] },
  { id: 'nick-g', name: 'Nick Gualandi', role: 'FP&A', expertise: ['fpa', 'financial-planning', 'analysis'] },
  { id: 'guest', name: 'Guest Author', role: 'Guest', expertise: [] },
]

// ===================
// Repurpose Content
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
// Repurpose Workflow Types (Multi-Step)
// ===================

// Workflow step in repurpose factory
export type RepurposeStep = 'source_selection' | 'format_selection' | 'content_review' | 'publish'

// Source type for repurposing
export type RepurposeSourceType = 'ready_content' | 'library_search' | 'external_input'

// YouTube chapter structure
export interface YouTubeChapter {
  id: string
  timestamp: string       // e.g., "0:00", "2:30"
  title: string
  description?: string
}

// Target format configuration
export interface TargetFormatConfig {
  id: string
  format: ContentType
  selected: boolean
  variationCount?: number        // For LinkedIn/Instagram: 3-5 variations
  includesFaqs?: boolean         // For Blog/Case Study
  includesLinks?: boolean        // For Blog/Case Study
  includesChapters?: boolean     // For YouTube instead of FAQs
}

// Generated content for a single format
export interface GeneratedFormatContent {
  id: string
  formatId: string
  format: ContentType
  content: string                // Main content
  variations?: string[]          // For LinkedIn/Instagram - multiple variations
  selectedVariations?: number[]  // Indices of selected variations (for LinkedIn/Instagram)
  chapters?: YouTubeChapter[]    // For YouTube
  faqs?: FAQ[]                   // For Blog/Case Study
  internalLinks?: LinkRecommendation[]
  externalLinks?: LinkRecommendation[]
  approvalStatus: ApprovalStatus
}

// Extended repurpose item with workflow data
export interface RepurposeWorkflowItem extends RepurposeItem {
  // Workflow state
  currentStep: RepurposeStep
  workflowStartedAt?: string
  workflowCompletedAt?: string

  // Step 1: Source selection
  selectionMethod?: RepurposeSourceType  // How source was selected (ready_content, library_search, external_input)
  sourceContent?: string         // The actual content text
  sourceUrl?: string             // For external input

  // Step 2: Format selection
  targetFormats: TargetFormatConfig[]

  // Step 3: Generated content per format
  generatedContent: GeneratedFormatContent[]

  // Step 4: Publish status
  publishedFormats: string[]     // IDs of formats published to library
}

// Labels for repurpose workflow steps
export const repurposeStepLabels: Record<RepurposeStep, string> = {
  source_selection: 'Select Source',
  format_selection: 'Choose Formats',
  content_review: 'Review Content',
  publish: 'Publish',
}

// Labels for source types
export const repurposeSourceTypeLabels: Record<RepurposeSourceType, string> = {
  ready_content: 'Ready to Repurpose',
  library_search: 'Search Library',
  external_input: 'External Content',
}

// Format-specific features configuration
export const formatFeatures: Record<ContentType, {
  supportsFaqs: boolean
  supportsLinks: boolean
  supportsChapters: boolean
  supportsVariations: boolean
  defaultVariationCount?: number
}> = {
  blog: { supportsFaqs: true, supportsLinks: true, supportsChapters: false, supportsVariations: false },
  case_study: { supportsFaqs: true, supportsLinks: true, supportsChapters: false, supportsVariations: false },
  youtube: { supportsFaqs: false, supportsLinks: false, supportsChapters: true, supportsVariations: false },
  linkedin: { supportsFaqs: false, supportsLinks: false, supportsChapters: false, supportsVariations: true, defaultVariationCount: 5 },
  instagram: { supportsFaqs: false, supportsLinks: false, supportsChapters: false, supportsVariations: true, defaultVariationCount: 5 },
  website_page: { supportsFaqs: false, supportsLinks: true, supportsChapters: false, supportsVariations: false },
  meeting_transcript: { supportsFaqs: false, supportsLinks: false, supportsChapters: false, supportsVariations: false },
  external: { supportsFaqs: false, supportsLinks: false, supportsChapters: false, supportsVariations: false },
}

// Content types available for repurposing (excluding some types)
export const repurposeTargetFormats: ContentType[] = ['blog', 'case_study', 'youtube', 'linkedin', 'instagram']

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

// ===================
// Final Drafts
// ===================

export interface FinalDraft {
  id: string
  briefId: string
  title: string
  targetFormat: ContentType
  content: string
  faqs?: FAQ[]
  author: string
  approvedAt: string
  publishedAt?: string
  keywords: string[]
}

// ===================
// Repurposed Content Tracking
// ===================

// Tracks a single repurposed output
export interface RepurposedOutput {
  id: string
  format: ContentType
  title: string
  createdAt: string
  content?: string
  variations?: string[]      // For LinkedIn - multiple variations
  chapters?: YouTubeChapter[] // For YouTube
}

// Extended RepurposeItem with created outputs tracking
export interface RepurposeItemWithOutputs extends RepurposeItem {
  createdOutputs: RepurposedOutput[]
}

// ===================
// In Progress Repurpose Tracking
// ===================

// Status for each format being repurposed
export type RepurposeFormatStatus = 'pending' | 'in_progress' | 'published'

// Individual format progress tracking
export interface RepurposeFormatProgress {
  format: ContentType
  status: RepurposeFormatStatus
  content?: string
  variations?: string[]
  selectedVariations?: number[]
  chapters?: YouTubeChapter[]
  publishedAt?: string
}

// In-progress repurpose workflow item
export interface InProgressRepurpose {
  id: string
  sourceTitle: string
  sourceType: ContentType
  startedAt: string
  formats: RepurposeFormatProgress[]
}

// Labels for format status
export const repurposeFormatStatusLabels: Record<RepurposeFormatStatus, string> = {
  pending: 'Pending',
  in_progress: 'Ready to Publish',
  published: 'Published',
}

export const repurposeFormatStatusColors: Record<RepurposeFormatStatus, string> = {
  pending: 'bg-slate-100 text-slate-800',
  in_progress: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
}
