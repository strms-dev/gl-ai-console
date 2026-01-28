// ===================
// Lead Discovery Types
// ===================

// Influencer platform types
export type InfluencerPlatform = 'linkedin' | 'twitter' | 'youtube' | 'podcast' | 'newsletter'

// Influencer status in pipeline
export type InfluencerStatus = 'discovered' | 'approved' | 'added_to_trigify' | 'rejected'

// Lead source (which pipeline)
export type LeadSource = 'influencer_engagement' | 'hypothesis'

// Lead status in Clay pipeline
export type LeadStatus = 'identified' | 'enriching' | 'enriched' | 'ready_for_outreach' | 'in_outreach' | 'responded' | 'qualified'

// Hypothesis status
export type HypothesisStatus = 'draft' | 'validating' | 'approved' | 'active' | 'completed' | 'rejected'

// Engagement type
export type EngagementType = 'like' | 'comment' | 'share' | 'follow' | 'mention'

// ICP match score level
export type ICPMatchLevel = 'high' | 'medium' | 'low'

// Workflow context for chat
export type LeadWorkflowContext = 'dashboard' | 'influencer_finder' | 'trigify_tracker' | 'hypothesis_lab' | 'clay_pipeline' | 'queue'

// View mode for main page
export type LeadViewMode = 'workflows' | 'queue'

// ===================
// Influencer Types
// ===================

export interface Influencer {
  id: string
  name: string
  platform: InfluencerPlatform
  profileUrl: string
  followerCount: number
  averageEngagement: number  // percentage
  niche: string[]           // topics they cover
  icpMatch: ICPMatchLevel
  icpMatchReason: string
  status: InfluencerStatus
  addedToTrigifyAt?: string
  discoveredAt: string
  discoveredBy: string      // 'ai' or user name
}

// Status labels and colors
export const influencerStatusLabels: Record<InfluencerStatus, string> = {
  discovered: 'Discovered',
  approved: 'Approved',
  added_to_trigify: 'In Trigify',
  rejected: 'Rejected',
}

export const influencerStatusColors: Record<InfluencerStatus, string> = {
  discovered: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  added_to_trigify: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
}

export const platformLabels: Record<InfluencerPlatform, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  youtube: 'YouTube',
  podcast: 'Podcast',
  newsletter: 'Newsletter',
}

export const platformColors: Record<InfluencerPlatform, string> = {
  linkedin: 'bg-sky-100 text-sky-800',
  twitter: 'bg-slate-100 text-slate-800',
  youtube: 'bg-red-100 text-red-800',
  podcast: 'bg-purple-100 text-purple-800',
  newsletter: 'bg-green-100 text-green-800',
}

// ===================
// Engagement Tracking Types
// ===================

export interface EngagedPerson {
  id: string
  name: string
  company?: string
  title?: string
  linkedinUrl?: string
  email?: string
  engagementType: EngagementType
  engagedWithInfluencerId: string
  engagedWithInfluencerName?: string
  engagedPostUrl?: string
  engagedAt: string
  icpMatch: ICPMatchLevel
  icpMatchReason?: string
  pushedToClayAt?: string
  leadStatus?: LeadStatus
}

export const engagementTypeLabels: Record<EngagementType, string> = {
  like: 'Liked',
  comment: 'Commented',
  share: 'Shared',
  follow: 'Followed',
  mention: 'Mentioned',
}

export const engagementTypeColors: Record<EngagementType, string> = {
  like: 'bg-pink-100 text-pink-800',
  comment: 'bg-blue-100 text-blue-800',
  share: 'bg-green-100 text-green-800',
  follow: 'bg-purple-100 text-purple-800',
  mention: 'bg-amber-100 text-amber-800',
}

// ===================
// Hypothesis Types
// ===================

export interface LeadHypothesis {
  id: string
  title: string
  description: string
  targetCriteria: string[]      // ICP criteria
  estimatedLeadCount: number
  confidenceScore: number       // 0-100
  dataSource: string            // where to find these leads
  status: HypothesisStatus
  leadsGenerated: number
  createdAt: string
  createdBy: string             // 'ai' or user name
  validatedAt?: string
  validatedBy?: string
}

// ===================
// Hypothesis Workflow Types (Multi-Step)
// ===================

// Workflow step in hypothesis builder
export type HypothesisStep = 'who_where' | 'how_what' | 'email_copy' | 'linkedin_copy'

// Entry mode - how the hypothesis starts
export type HypothesisEntryMode = 'general' | 'specific'

// Lead source platform
export type LeadSourcePlatform = 'clay' | 'trigify' | 'csv_upload' | 'other'

// Approval status for copy
export type CopyApprovalStatus = 'pending' | 'approved' | 'edited'

// Filtering criteria for leads
export interface FilterCriteria {
  id: string
  field: string           // e.g., "Industry", "$ Raised", "Year Raised"
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range'
  value: string
  enabled: boolean
}

// Enrichment field configuration
export interface EnrichmentField {
  id: string
  field: string           // e.g., "CEO Name", "Email", "LinkedIn URL", "Year Raised"
  description?: string
  enabled: boolean
}

// Email copy content
export interface HypothesisEmailCopy {
  id: string
  subject: string
  body: string
  approvalStatus: CopyApprovalStatus
}

// LinkedIn message copy content
export interface HypothesisLinkedInCopy {
  id: string
  message: string
  approvalStatus: CopyApprovalStatus
}

// Extended hypothesis with workflow data
export interface LeadHypothesisWorkflow extends LeadHypothesis {
  // Workflow state
  currentStep: HypothesisStep
  entryMode: HypothesisEntryMode
  workflowStartedAt?: string
  workflowCompletedAt?: string

  // Step 1: Who & Where
  targetDescription: string           // "Companies who raised Series A"
  leadSource: LeadSourcePlatform
  leadSourceDetails?: string          // Custom details or CSV file name
  whoWhereApproved: boolean

  // Step 2: How & What
  filterCriteria: FilterCriteria[]
  enrichmentFields: EnrichmentField[]
  howWhatApproved: boolean

  // Step 3: Email Copy (for Instantly)
  emailCopy: HypothesisEmailCopy | null
  emailCopyApproved: boolean

  // Step 4: LinkedIn Copy (for Heyreach)
  linkedInCopy: HypothesisLinkedInCopy | null
  linkedInCopyApproved: boolean
}

// Labels for workflow steps
export const hypothesisStepLabels: Record<HypothesisStep, string> = {
  who_where: 'Who & Where',
  how_what: 'How & What',
  email_copy: 'Email Copy',
  linkedin_copy: 'LinkedIn Copy',
}

// Labels for lead source platforms
export const leadSourcePlatformLabels: Record<LeadSourcePlatform, string> = {
  clay: 'Clay',
  trigify: 'Trigify',
  csv_upload: 'CSV Upload',
  other: 'Other',
}

// Labels for entry modes
export const hypothesisEntryModeLabels: Record<HypothesisEntryMode, string> = {
  general: 'General',
  specific: 'Specific',
}

// Default filter criteria options
export const defaultFilterFields = [
  'Industry',
  '$ Raised',
  'Year Raised',
  'Company Size',
  'Location',
  'Revenue',
]

// Default enrichment fields
export const defaultEnrichmentFields = [
  { id: 'ceo_name', field: 'CEO Name', description: 'Name of the CEO or founder' },
  { id: 'email', field: 'Email', description: 'Business email address' },
  { id: 'linkedin', field: 'LinkedIn URL', description: 'Personal LinkedIn profile' },
  { id: 'year_raised', field: 'Year Raised', description: 'Year of last funding round' },
  { id: 'phone', field: 'Phone Number', description: 'Direct phone number' },
  { id: 'company_linkedin', field: 'Company LinkedIn', description: 'Company LinkedIn page' },
]

export const hypothesisStatusLabels: Record<HypothesisStatus, string> = {
  draft: 'Draft',
  validating: 'Validating',
  approved: 'Approved',
  active: 'Active',
  completed: 'Completed',
  rejected: 'Rejected',
}

export const hypothesisStatusColors: Record<HypothesisStatus, string> = {
  draft: 'bg-slate-100 text-slate-800',
  validating: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

// ===================
// Clay Pipeline Types
// ===================

export interface EnrichmentData {
  companySize?: string
  industry?: string
  revenue?: string
  techStack?: string[]
  recentNews?: string
}

export interface ClayLead {
  id: string
  name: string
  company: string
  title: string
  email?: string
  linkedinUrl?: string
  source: LeadSource
  sourceId: string            // influencer id or hypothesis id
  sourceName: string          // influencer name or hypothesis title
  icpMatch: ICPMatchLevel
  status: LeadStatus
  enrichmentData?: EnrichmentData
  addedAt: string
  enrichedAt?: string
  outreachSentAt?: string
  respondedAt?: string
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  identified: 'Identified',
  enriching: 'Enriching...',
  enriched: 'Enriched',
  ready_for_outreach: 'Ready for Outreach',
  in_outreach: 'In Outreach',
  responded: 'Responded',
  qualified: 'Qualified',
}

export const leadStatusColors: Record<LeadStatus, string> = {
  identified: 'bg-slate-100 text-slate-800',
  enriching: 'bg-amber-100 text-amber-800',
  enriched: 'bg-blue-100 text-blue-800',
  ready_for_outreach: 'bg-green-100 text-green-800',
  in_outreach: 'bg-purple-100 text-purple-800',
  responded: 'bg-emerald-100 text-emerald-800',
  qualified: 'bg-green-200 text-green-900',
}

export const leadSourceLabels: Record<LeadSource, string> = {
  influencer_engagement: 'Influencer',
  hypothesis: 'Hypothesis',
}

export const leadSourceColors: Record<LeadSource, string> = {
  influencer_engagement: 'bg-purple-100 text-purple-800',
  hypothesis: 'bg-amber-100 text-amber-800',
}

export const icpMatchLabels: Record<ICPMatchLevel, string> = {
  high: 'High Match',
  medium: 'Medium Match',
  low: 'Low Match',
}

export const icpMatchColors: Record<ICPMatchLevel, string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-800',
}

// ===================
// Chat Types
// ===================

export interface LeadChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ===================
// Dashboard Stats Types
// ===================

export interface LeadDashboardStats {
  newInfluencers: number
  trackingInfluencers: number
  engagedLeads: number
  activeHypotheses: number
  leadsInClay: number
  readyForOutreach: number
}
