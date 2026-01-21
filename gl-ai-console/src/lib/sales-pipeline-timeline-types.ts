"use client"

// Sales Pipeline Stage Types
export type SalesPipelineStageId =
  | "demo-call"
  | "sales-intake"
  | "follow-up-email"
  | "reminder-sequence"
  | "internal-review"
  | "gl-review"
  | "gl-review-comparison"
  | "create-quote"
  | "quote-sent"
  | "quote-approved"
  | "prepare-engagement"
  | "internal-engagement-review"
  | "send-engagement"
  | "closed-won"
  | "closed-lost"

export type SalesPipelineStageStatus =
  | "pending"
  | "in_progress"
  | "action-required"
  | "completed"
  | "skipped"

export type ClosedOutcome = "won" | "lost" | null

export type AccountingSystem = "qbo" | "xero" | "other" | null

// Confidence Level for AI-populated fields
export type ConfidenceLevel = "low" | "medium" | "high"

// Field confidence data - stores confidence level for each form field
export type FieldConfidence = {
  [K in keyof SalesIntakeFormData]?: ConfidenceLevel
}

// Sales Intake Form Data - comprehensive form from demo call analysis
export interface SalesIntakeFormData {
  // Basic Info
  companyName: string
  contactName: string
  emailAddress: string

  // Entity & Grants
  entityType: "non-profit" | "c-corp" | "s-corp" | "llc" | "other" | ""
  hasRestrictedGrants: "yes" | "no" | ""

  // Accounting Platform
  usesQboOrXero: "yes" | "no" | ""
  accountingPlatform: "qbo" | "xero" | "other" | ""
  accountingBasis: "cash" | "accrual" | "modified-cash" | ""
  bookkeepingCadence: "weekly" | "biweekly" | "monthly" | "quarterly" | ""
  needsFinancialsBefore15th: "yes-board" | "yes-investors" | "yes-just-want" | "no" | ""
  financialReviewFrequency: "none" | "weekly" | "biweekly" | "monthly" | "quarterly" | ""

  // Payroll
  payrollProvider: "adp" | "gusto" | "onpay" | "paychex" | "rippling" | "justworks" | "paycor" | "zenefits" | "other" | ""
  has401k: "yes" | "no" | ""
  payrollDepartments: "0" | "1" | "2" | "3" | "4" | "5" | ""
  employeeCount: "0" | "1-5" | "6-20" | "21+" | ""

  // Expenses
  tracksExpensesByEmployee: "yes" | "no" | ""
  expensePlatform: "divvy" | "brex" | "ramp" | "expensify" | "hubdoc" | "other" | ""
  expensePlatformEmployees: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "10+" | ""

  // Bill Pay
  needsBillPaySupport: "yes" | "no" | ""
  billPayCadence: "weekly" | "biweekly" | "monthly" | "quarterly" | ""
  billsPerMonth: "up-to-25" | "over-25" | ""

  // Invoicing
  needsInvoicingSupport: "yes" | "no" | ""
  invoicingCadence: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually" | ""
  invoicesPerMonth: "up-to-25" | "over-25" | ""

  // CFO Review
  interestedInCfoReview: "yes" | "no" | ""

  // Additional
  additionalNotes: string
  firefliesVideoLink: string
}

// Legacy Intake Data from Demo Call Analysis (keeping for backwards compatibility)
export interface SalesIntakeData {
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  businessType: string
  employeeCount: string
  annualRevenue: string
  accountingSystem: AccountingSystem
  servicesNeeded: string[]
  painPoints: string
  currentChallenges: string
  timeline: string
  budget: string
  notes: string
  analyzedAt: string
}

// Follow-up Email Data
export interface FollowUpEmailData {
  templateType: "qbo" | "xero" | "reports"
  subject: string
  body: string
  sentAt: string | null
  reminderEnrolledAt: string | null
}

// Internal Team Assignment
export interface InternalAssignmentData {
  recipients: string[]
  sentAt: string | null
  assignedReviewers: string[]
}

// Quote/Pricing Data
export interface QuoteData {
  calculatedPrice: number
  adjustedPrice: number
  adjustmentReason: string | null
  serviceBreakdown: {
    service: string
    price: number
  }[]
  createdAt: string
  updatedAt: string
}

// Proposal Data
export interface ProposalData {
  quoteId: string
  emailSubject: string
  emailBody: string
  attachmentGenerated: boolean
  sentAt: string | null
}

// Negotiation Notes
export interface NegotiationData {
  notes: string[]
  adjustedTerms: string | null
  finalPrice: number | null
}

// Stage-specific data union
export interface SalesPipelineStageData {
  demoCall: {
    transcriptUploaded: boolean
    transcriptFileName: string | null
    transcriptUploadedAt: string | null
    intakeAnalyzed: boolean
    intakeData: SalesIntakeData | null
    intakeConfirmedAt: string | null
  }
  needsInfo: {
    emailTemplate: FollowUpEmailData | null
    emailSent: boolean
    reminderEnrolled: boolean
    accessRequestedAt: string | null
  }
  accessReceived: {
    accessType: AccountingSystem
    accessReceivedAt: string | null
    internalAssignment: InternalAssignmentData | null
    reviewCompleted: boolean
    reviewCompletedAt: string | null
  }
  createQuote: {
    reviewInProgress: boolean
    reviewCompletedAt: string | null
    quoteData: QuoteData | null
    proposalDrafted: boolean
  }
  proposalSent: {
    proposal: ProposalData | null
    sentAt: string | null
    viewedAt: string | null
  }
  negotiation: {
    data: NegotiationData | null
    inProgress: boolean
  }
  closed: {
    outcome: ClosedOutcome
    closedAt: string | null
    wonReason: string | null
    lostReason: string | null
    finalDealValue: number | null
  }
}

// Sales Intake Stage Data
export interface SalesIntakeStageData {
  formData: SalesIntakeFormData | null
  isAutoFilled: boolean
  autoFilledAt: string | null
  confirmedAt: string | null
  fieldConfidence: FieldConfidence | null
}

// Follow-Up Email Stage Data
export interface FollowUpEmailStageData {
  templateType: "qbo" | "xero" | "other" | null
  toEmail: string  // Recipient email(s), comma-separated for multiple
  ccEmail: string  // CC email(s), comma-separated for multiple
  emailSubject: string
  emailBody: string
  isEdited: boolean
  sentAt: string | null
  hubspotDealMoved: boolean
  hubspotDealMovedAt: string | null
}

// Reminder Sequence Stage Data
// Simplified: removed auto-enrollment, now manual-only
export type ReminderSequenceStatus = "not_enrolled" | "enrolled" | "access_received"

export interface ReminderSequenceStageData {
  // Enrollment status
  status: ReminderSequenceStatus

  // Platform (determines which HubSpot sequence to use)
  platform: "qbo" | "xero" | "other" | null

  // Enrollment tracking
  enrolledAt: string | null

  // Unenrollment tracking
  unenrolledAt: string | null

  // Access received tracking (completes the stage)
  accessReceivedAt: string | null
}

// Internal Review Stage Data - for assigning GL review to internal team
export interface InternalReviewStageData {
  // Recipients for the internal email (TO field)
  recipients: { name: string; email: string }[]

  // CC Tim Scullion toggle (default: true)
  ccTimEnabled: boolean

  // Email content
  emailSubject: string
  emailBody: string
  isEdited: boolean

  // Email tracking
  sentAt: string | null

  // Review tracking
  reviewAssignedTo: string[] | null  // Email addresses of assigned reviewers
  reviewCompletedAt: string | null
  reviewNotes: string | null
}

// Transaction count options for financial accounts
export type TransactionCount = "<20" | "20-100" | ">100" | ""

// eCommerce platform account counts
export type ECommerceAccountCount = "" | "1" | "2" | "3" | "4" | "5"

// eCommerce platforms
export interface ECommerceData {
  amazon: ECommerceAccountCount
  shopify: ECommerceAccountCount
  square: ECommerceAccountCount
  etsy: ECommerceAccountCount
  ebay: ECommerceAccountCount
  woocommerce: ECommerceAccountCount
  other: ECommerceAccountCount
}

// Financial account entry (name + transaction count)
export interface FinancialAccount {
  name: string  // Name of Institution & Type of Account
  transactionCount: TransactionCount
}

// GL Review Form Data - comprehensive form for general ledger review
// Note: companyName and leadName are displayed from deal data, not stored in form
export interface GLReviewFormData {
  // Financial Accounts (up to 20)
  accounts: FinancialAccount[]

  // eCommerce
  ecommerce: ECommerceData

  // Revenue COA Allocations (required)
  revenueCoaAllocations: "1-2" | "3-5" | ">5" | ""

  // List of COA Revenue Categories (required)
  coaRevenueCategories: string

  // Active Classes (required)
  activeClasses: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | ""

  // Catchup Bookkeeping (required)
  catchupRequired: "yes" | "no" | ""
  catchupDateRange: string
  catchupMonths: string  // Number of months for cleanup estimate (can be auto-calculated or manual)

  // Additional Notes
  additionalNotes: string
}

// Field confidence for GL Review form
export type GLReviewFieldConfidence = {
  [K in keyof GLReviewFormData]?: ConfidenceLevel
}

// GL Review Stage Data
export interface GLReviewStageData {
  formData: GLReviewFormData | null
  isAutoFilled: boolean
  autoFilledAt: string | null
  confirmedAt: string | null
  fieldConfidence: GLReviewFieldConfidence | null
}

// Selection source for each field in the comparison
export type ComparisonFieldSource = "ai" | "team" | "custom" | null

// Field selections for the comparison - which source was chosen for each field
export type GLReviewComparisonSelections = {
  [K in keyof GLReviewFormData]?: ComparisonFieldSource
}

// Custom values for fields that were manually edited
export type GLReviewCustomValues = {
  [K in keyof GLReviewFormData]?: GLReviewFormData[K]
}

// GL Review Comparison Stage Data - comparing AI review vs team member review
export interface GLReviewComparisonStageData {
  // Team member's review data (submitted separately)
  teamReviewData: GLReviewFormData | null
  teamReviewSubmittedAt: string | null
  teamReviewSubmittedBy: string | null

  // AI review data (copied from gl-review stage for reference)
  aiReviewData: GLReviewFormData | null

  // Final merged data based on user selections
  finalReviewData: GLReviewFormData | null

  // Track which source was selected for each field
  fieldSelections: GLReviewComparisonSelections | null

  // Custom edited values for fields where user chose to modify
  customValues: GLReviewCustomValues | null

  // Completion tracking
  comparisonCompletedAt: string | null
  movedToCreateQuoteAt: string | null
}

// ============================================
// NEW STAGES: Post-GL Review Comparison
// ============================================

// Quote line item for pricing
export interface QuoteLineItem {
  id: string
  service: string
  description: string
  monthlyPrice: number  // For one-time items, this is the one-time price
  isCustom: boolean
  isOneTime?: boolean   // True for one-time fees (e.g., cleanup), false/undefined for recurring
}

// Pricing Breakdown Item for structured display
export interface PricingBreakdownItem {
  category: string        // e.g., "Cadence Base", "401k Plan", "Financial Accounts"
  description: string     // e.g., "Monthly x Priority (1.0)", "401k Administration"
  amount: number          // e.g., 100, 25, 150
  formula?: string        // Optional: e.g., "3 accounts x $50"
}

// Create Quote Stage Data
export interface CreateQuoteStageData {
  // Accounting pricing (auto-calculated from Sales Intake + GL Review)
  accountingMonthlyPrice: number | null
  accountingPriceCalculatedAt: string | null
  accountingPriceBreakdown: string | null  // Human-readable breakdown (text)
  accountingPriceBreakdownData: PricingBreakdownItem[] | null  // Structured breakdown for UI

  // Pricing metadata
  accountingMethod: string | null  // cash, accrual, modified-cash
  recommendedCadence: string | null  // weekly, biweekly, monthly, quarterly
  appliedMultiplier: number | null  // 1.0 or 1.25
  priorityMultiplier: number | null  // 1.0 or 1.2

  // Cleanup estimate (one-time fee if catchup required)
  cleanupEstimate: number | null

  // Quote line items (accounting + additional services)
  lineItems: QuoteLineItem[]

  // Editing state
  isEdited: boolean

  // HubSpot sync
  hubspotSynced: boolean
  hubspotSyncedAt: string | null
  hubspotQuoteLink: string | null  // Link to the quote in HubSpot

  // Completion
  quoteConfirmedAt: string | null
}

// Quote Sent Stage Data
export interface QuoteSentStageData {
  // Email content
  emailSubject: string
  emailBody: string
  isEdited: boolean

  // Send tracking
  sentAt: string | null
  sentTo: string

  // Follow-up sequence
  followUpSequenceStarted: boolean
  followUpSequenceStartedAt: string | null
  nextFollowUpAt: string | null  // 3 business days
  followUpCount: number

  // Response tracking
  prospectRespondedAt: string | null
  responseType: "approved" | "declined" | null
}

// Quote Approved Stage Data
export interface QuoteApprovedStageData {
  approvedAt: string | null
  approvedBy: string | null  // Customer name/email
  approvalNotes: string

  // Auto-reply tracking
  acknowledgmentSentAt: string | null

  // Transition
  movedToEngagementAt: string | null
}

// Prepare Engagement Walkthrough Stage Data
export interface PrepareEngagementStageData {
  // AI-generated walkthrough
  walkthroughText: string
  walkthroughGeneratedAt: string | null
  isGenerating: boolean

  // Editing state
  isEdited: boolean

  // Completion
  walkthroughConfirmedAt: string | null
}

// EA Internal Review Stage Data - send walkthrough to internal team for review
export interface InternalEngagementReviewStageData {
  // Recipients for the internal email
  recipients: { name: string; email: string }[]

  // Email content
  emailSubject: string
  emailBody: string
  isEdited: boolean

  // Email tracking
  sentAt: string | null

  // Completion - ready to send to customer
  readyToSendAt: string | null
}

// Send Engagement Stage Data - simplified to just customer email + HubSpot sync
export interface SendEngagementStageData {
  // Customer email content
  customerEmailSubject: string
  customerEmailBody: string
  isEdited: boolean

  // Send tracking - sends via HubSpot and moves deal to Closed Won
  sentViaHubspotAt: string | null
}

// Closed Won Stage Data
export interface ClosedWonStageData {
  closedAt: string | null
  finalDealValue: number | null

  // Services included
  servicesIncluded: {
    service: string
    monthlyPrice: number
  }[]

  // Notes
  closingNotes: string

  // HubSpot sync (placeholder)
  hubspotSynced: boolean
  hubspotSyncedAt: string | null
}

// Lost reason options
export type LostReason = "no_response" | "declined" | "competitor" | "timing" | "budget" | "other"

// Closed Lost Stage Data
export interface ClosedLostStageData {
  closedAt: string | null
  lostReason: LostReason | null
  lostReasonDetails: string

  // Which stage it came from
  lostFromStage: SalesPipelineStageId | null

  // HubSpot sync (placeholder)
  hubspotSynced: boolean
  hubspotSyncedAt: string | null
}

// ============================================
// SIMPLIFIED STAGE DATA (for pizza tracker stages)
// These stages only need confirmation timestamps
// ============================================

// Base simplified stage data - just tracks confirmation
export interface SimplifiedStageData {
  // Manual confirmation
  confirmedAt: string | null
  confirmedBy: string | null

  // HubSpot auto-sync (when implemented)
  hubspotSyncedAt: string | null
  isAutoSynced: boolean

  // Skipped status - for stages that were auto-completed because deal moved past them
  isSkipped: boolean
  skippedReason: string | null
}

// Simplified Quote Sent Stage Data - replaces complex QuoteSentStageData
export interface SimplifiedQuoteSentStageData extends SimplifiedStageData {
  // Keep reference to quote link from Create Quote
  hubspotQuoteLink: string | null
}

// Simplified Prepare EA Stage Data - no additional fields needed
export type SimplifiedPrepareEAStageData = SimplifiedStageData

// Simplified EA Ready for Review Stage Data - no additional fields needed
export type SimplifiedEAReadyForReviewStageData = SimplifiedStageData

// Simplified EA Sent Stage Data - no additional fields needed
export type SimplifiedEASentStageData = SimplifiedStageData

// Simplified Closed Won Stage Data - keeps deal value display
export interface SimplifiedClosedWonStageData extends SimplifiedStageData {
  // Inherit deal value from Create Quote for display
  finalDealValue: number | null
}

// Simplified Closed Lost Stage Data - keeps lost reason for tracking
export interface SimplifiedClosedLostStageData extends SimplifiedStageData {
  lostReason: LostReason | null
  lostReasonDetails: string
  lostFromStage: SalesPipelineStageId | null
}

// HubSpot stage name mapping for reminders
export const HUBSPOT_STAGE_NAMES: Record<string, string> = {
  "quote-sent": "SQO - Quote Sent",
  "prepare-engagement": "Prepare EA",
  "ea-ready-for-review": "EA Ready for Review",
  "ea-sent": "EA Sent",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost"
}

// Full Timeline State for a Deal
export interface SalesPipelineTimelineState {
  dealId: string
  currentStage: SalesPipelineStageId
  stages: {
    "demo-call": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: SalesPipelineStageData["demoCall"]
    }
    "sales-intake": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: SalesIntakeStageData
    }
    "follow-up-email": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: FollowUpEmailStageData
    }
    "reminder-sequence": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: ReminderSequenceStageData
    }
    "internal-review": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: InternalReviewStageData
    }
    "gl-review": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: GLReviewStageData
    }
    "gl-review-comparison": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: GLReviewComparisonStageData
    }
    "create-quote": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: CreateQuoteStageData
    }
    "quote-sent": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: QuoteSentStageData
    }
    "quote-approved": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: QuoteApprovedStageData
    }
    "prepare-engagement": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: PrepareEngagementStageData
    }
    "internal-engagement-review": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: InternalEngagementReviewStageData
    }
    "send-engagement": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: SendEngagementStageData
    }
    "closed-won": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: ClosedWonStageData
    }
    "closed-lost": {
      status: SalesPipelineStageStatus
      completedAt: string | null
      data: ClosedLostStageData
    }
  }
  createdAt: string
  updatedAt: string
}

// Stage Display Configuration
export interface StageConfig {
  id: SalesPipelineStageId
  title: string
  description: string
  icon: string
  actions: {
    primary?: {
      label: string
      action: string
      requiresData?: boolean
    }
    manual?: {
      label: string
    }
    secondary?: {
      label: string
      action: string
    }[]
  }
}

// Stage configuration data
export const SALES_PIPELINE_STAGES: StageConfig[] = [
  {
    id: "demo-call",
    title: "Demo Call",
    description: "Demo call transcript is usually uploaded automatically via automation. If not received automatically, manually upload to complete this stage. Note: Transcript must be in .txt format.",
    icon: "video",
    actions: {
      manual: {
        label: "Upload Demo Transcript"
      }
    }
  },
  {
    id: "sales-intake",
    title: "Sales Intake",
    description: "AI analyzes the demo call transcript to auto-fill the sales intake form. Review the populated answers, make any adjustments, and confirm to complete this stage.",
    icon: "clipboard-list",
    actions: {}
  },
  {
    id: "follow-up-email",
    title: "Follow-Up Email",
    description: "Send a follow-up email to the prospect with instructions for granting access to their accounting platform. The email template is based on which platform they use (QBO, Xero, or Other).",
    icon: "mail",
    actions: {}
  },
  {
    id: "reminder-sequence",
    title: "Reminder Sequence",
    description: "Manually enroll the contact in a HubSpot reminder sequence to send automated follow-up emails. Once you receive access to their accounting platform, mark it as received to move to the next stage.",
    icon: "repeat",
    actions: {}
  },
  {
    id: "internal-review",
    title: "Internal Team Assignment",
    description: "Now that access has been received, send an email to the internal team to assign them the general ledger review. Select recipients and customize the email before sending.",
    icon: "users",
    actions: {}
  },
  {
    id: "gl-review",
    title: "General Ledger Review",
    description: "Analyzes the client's general ledger to auto-fill the GL Review form. Review the populated answers, make any adjustments, and confirm to complete this stage.",
    icon: "file-spreadsheet",
    actions: {}
  },
  {
    id: "gl-review-comparison",
    title: "GL Review Comparison",
    description: "Compare the auto-generated GL Review with the team member's review. Review any differences, select the correct value for each field, and submit to move the deal to Create Quote.",
    icon: "git-compare",
    actions: {}
  },
  {
    id: "create-quote",
    title: "Create Quote",
    description: "Review the auto-calculated accounting price and add any additional services. Customize line items as needed, then confirm the quote to send to the prospect.",
    icon: "calculator",
    actions: {}
  },
  // ============================================
  // SIMPLIFIED STAGES (Pizza Tracker)
  // These stages auto-sync from HubSpot with manual fallback
  // ============================================
  {
    id: "quote-sent",
    title: "SQO - Quote Sent",
    description: "Confirm that the quote has been sent to the prospect via HubSpot.",
    icon: "send",
    actions: {}
  },
  // NOTE: quote-approved stage is REMOVED - merged into quote-sent flow
  // Confirming quote-sent implies approval, Quote Declined goes to closed-lost
  {
    id: "prepare-engagement",
    title: "Prepare EA",
    description: "Confirm that the Engagement Agreement has been prepared in Ignition.",
    icon: "file-text",
    actions: {}
  },
  {
    id: "internal-engagement-review",
    title: "EA Ready for Review",
    description: "Confirm that the internal team has reviewed the Engagement Agreement.",
    icon: "user-check",
    actions: {}
  },
  {
    id: "send-engagement",
    title: "EA Sent",
    description: "Confirm that the Engagement Agreement has been sent to the client.",
    icon: "file-signature",
    actions: {}
  },
  {
    id: "closed-won",
    title: "Closed Won",
    description: "Congratulations! The deal has been successfully closed.",
    icon: "trophy",
    actions: {}
  },
  {
    id: "closed-lost",
    title: "Closed Lost",
    description: "The deal has been marked as lost. Record the reason for future reference.",
    icon: "x-circle",
    actions: {}
  }
]

// Default internal team recipients for GL Review
export const DEFAULT_INTERNAL_RECIPIENTS = [
  { name: "Lori Chambless", email: "l.chambless@growthlabfinancial.com" },
  { name: "Robin Brown", email: "r.brown@growthlabfinancial.com" },
  { name: "Stephen Cummings", email: "s.cummings@growthlabfinancial.com" }
]

// Email templates based on accounting system
export const FOLLOW_UP_EMAIL_TEMPLATES = {
  qbo: {
    subject: "GrowthLab Follow Up - Next Steps",
    bodyTemplate: `Hey {{contactName}},

Was great talking with you and learning more about {{companyName}}. I am reaching out here to continue our conversation and provide some next steps.

As promised, you can review the Fireflies Meeting Recap as needed here >> {{firefliesLink}}

Based on our conversation, it sounds like the best fit at this time would be <strong>TYPE OUT VARIOUS SERVICES OF INTEREST</strong>

In order for our team to run their general ledger review and run our pricing metrics, we will need to be granted QBO Accounting Access. This is a super easy process, and you can find click-by-click instructions here >> <a href="https://www.youtube.com/watch?v=1SJhZB3bpr8" target="_blank" rel="noopener noreferrer">Granting QBO Accounting Access</a> << The email you are inviting here is <strong>qbo@growthlabfinancial.com</strong>

Once I see that invite come through, the team will run their review, and I can get you a scoped out proposal usually within 72 business hours

Let me know if you have any other questions, otherwise you will hear from us again soon.

Thanks,
Tim`
  },
  xero: {
    subject: "GrowthLab Follow Up - Next Steps",
    bodyTemplate: `Hey {{contactName}},

Was great talking with you and learning more about {{companyName}}. I am reaching out here to continue our conversation and provide some next steps.

As promised, you can review the Fireflies Meeting Recap as needed here >> {{firefliesLink}}

Based on our conversation, it sounds like the best fit at this time would be <strong>TYPE OUT VARIOUS SERVICES OF INTEREST</strong>

In order for our team to run their general ledger review and run our pricing metrics, we will need to be granted Xero Accounting Access. This is a super easy process, and you can find click-by-click instructions here >> <a href="https://www.youtube.com/watch?v=yBMxTtxxcfs" target="_blank" rel="noopener noreferrer">Granting Xero Accounting Access</a> << The email you are inviting here is <strong>xero@growthlabfinancial.com</strong>

Once I see that invite come through, the team will run their review, and I can get you a scoped out proposal usually within 72 business hours.

Let me know if you have any other questions, otherwise you will hear from us again soon.

Thanks,
Tim`
  },
  reports: {
    subject: "GrowthLab Follow Up - Next Steps",
    bodyTemplate: `Hey {{contactName}},

Was great talking with you and learning more about {{companyName}}. I am reaching out here to continue our conversation and provide some next steps.

As promised, you can review the Fireflies Meeting Recap as needed here >> {{firefliesLink}}

Based on our conversation, it sounds like the best fit at this time would be <strong>TYPE OUT VARIOUS SERVICES OF INTEREST</strong>

In order for our team to run their general ledger review and pricing metrics, we will need to be sent copies of the following documents:

<ul style="margin: 10px 0; padding-left: 20px;">
<li>Copy of most recent year's tax filing (if applicable)</li>
<li>Profit & Loss Report by month for past year</li>
<li>Balance Sheet</li>
<li>90 Day Transaction Summary for each Bank, Credit Card, or other Chart of Account that is relevant</li>
</ul>

Once we have those documents, our team can review and properly scope out what recurring work would be needed. I am usually able to get you a priced out quote within 72 business hours of getting access to the documents.

Let me know if you have any questions.

Thanks,
Tim`
  }
}

// Internal assignment email template
export const INTERNAL_ASSIGNMENT_EMAIL = {
  subject: "General Ledger Review Needed For {{companyName}}",
  bodyTemplate: `Hi Team,

You have just been granted accounting access to the following general ledger:

- {{platformAndCompany}}

Please submit your General Ledger Review using the link below. This form connects to our automation system to streamline the review process:

{{glReviewFormUrl}}

Once completed, notify Tim that the review has been submitted.`
}

// Tim Scullion's email for CC
export const TIM_SCULLION_EMAIL = "t.scullion@growthlabfinancial.com"

// Empty form data for initialization
export function createEmptySalesIntakeFormData(): SalesIntakeFormData {
  return {
    companyName: "",
    contactName: "",
    emailAddress: "",
    entityType: "",
    hasRestrictedGrants: "",
    usesQboOrXero: "",
    accountingPlatform: "",
    accountingBasis: "",
    bookkeepingCadence: "",
    needsFinancialsBefore15th: "",
    financialReviewFrequency: "",
    payrollProvider: "",
    has401k: "",
    payrollDepartments: "",
    employeeCount: "",
    tracksExpensesByEmployee: "",
    expensePlatform: "",
    expensePlatformEmployees: "",
    needsBillPaySupport: "",
    billPayCadence: "",
    billsPerMonth: "",
    needsInvoicingSupport: "",
    invoicingCadence: "",
    invoicesPerMonth: "",
    interestedInCfoReview: "",
    additionalNotes: "",
    firefliesVideoLink: ""
  }
}

// Test data for auto-fill simulation
export function createTestSalesIntakeFormData(): SalesIntakeFormData {
  return {
    companyName: "Acme Technologies Inc.",
    contactName: "John Smith",
    emailAddress: "john.smith@acmetech.com",
    entityType: "c-corp",
    hasRestrictedGrants: "no",
    usesQboOrXero: "yes",
    accountingPlatform: "qbo",
    accountingBasis: "accrual",
    bookkeepingCadence: "monthly",
    needsFinancialsBefore15th: "yes-board",
    financialReviewFrequency: "monthly",
    payrollProvider: "gusto",
    has401k: "yes",
    payrollDepartments: "3",
    employeeCount: "6-20",
    tracksExpensesByEmployee: "yes",
    expensePlatform: "ramp",
    expensePlatformEmployees: "5",
    needsBillPaySupport: "yes",
    billPayCadence: "weekly",
    billsPerMonth: "up-to-25",
    needsInvoicingSupport: "yes",
    invoicingCadence: "monthly",
    invoicesPerMonth: "up-to-25",
    interestedInCfoReview: "yes",
    additionalNotes: "Client is looking to streamline their financial operations. They mentioned they have been doing everything manually and are excited about automation possibilities. Previous accountant left recently so they need to get up to speed quickly.",
    firefliesVideoLink: "https://app.fireflies.ai/view/demo-call-acme-technologies-abc123"
  }
}

// Test confidence data - simulates AI confidence levels from transcript analysis
export function createTestFieldConfidence(): FieldConfidence {
  return {
    // High confidence - explicitly mentioned in call
    companyName: "high",
    contactName: "high",
    emailAddress: "high",
    usesQboOrXero: "high",
    accountingPlatform: "high",
    payrollProvider: "high",
    employeeCount: "high",
    expensePlatform: "high",

    // Medium confidence - inferred from context
    entityType: "medium",
    accountingBasis: "medium",
    bookkeepingCadence: "medium",
    has401k: "medium",
    needsBillPaySupport: "medium",
    needsInvoicingSupport: "medium",
    interestedInCfoReview: "medium",

    // Low confidence - uncertain or barely mentioned
    hasRestrictedGrants: "low",
    needsFinancialsBefore15th: "low",
    financialReviewFrequency: "low",
    payrollDepartments: "low",
    tracksExpensesByEmployee: "low",
    expensePlatformEmployees: "low",
    billPayCadence: "low",
    billsPerMonth: "low",
    invoicingCadence: "low",
    invoicesPerMonth: "low",
    additionalNotes: "medium",
    firefliesVideoLink: "high"
  }
}

// Create initial timeline state for a new deal
export function createInitialTimelineState(dealId: string): SalesPipelineTimelineState {
  const now = new Date().toISOString()

  return {
    dealId,
    currentStage: "demo-call",
    stages: {
      "demo-call": {
        status: "in_progress",
        completedAt: null,
        data: {
          transcriptUploaded: false,
          transcriptFileName: null,
          transcriptUploadedAt: null,
          intakeAnalyzed: false,
          intakeData: null,
          intakeConfirmedAt: null
        }
      },
      "sales-intake": {
        status: "pending",
        completedAt: null,
        data: {
          formData: null,
          isAutoFilled: false,
          autoFilledAt: null,
          confirmedAt: null,
          fieldConfidence: null
        }
      },
      "follow-up-email": {
        status: "pending",
        completedAt: null,
        data: {
          templateType: null,
          toEmail: "",
          ccEmail: "",
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          hubspotDealMoved: false,
          hubspotDealMovedAt: null
        }
      },
      "reminder-sequence": {
        status: "pending",
        completedAt: null,
        data: {
          status: "not_enrolled",
          platform: null,
          enrolledAt: null,
          unenrolledAt: null,
          accessReceivedAt: null
        }
      },
      "internal-review": {
        status: "pending",
        completedAt: null,
        data: {
          recipients: [],
          ccTimEnabled: true,
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          reviewAssignedTo: null,
          reviewCompletedAt: null,
          reviewNotes: null
        }
      },
      "gl-review": {
        status: "pending",
        completedAt: null,
        data: {
          formData: null,
          isAutoFilled: false,
          autoFilledAt: null,
          confirmedAt: null,
          fieldConfidence: null
        }
      },
      "gl-review-comparison": {
        status: "pending",
        completedAt: null,
        data: {
          teamReviewData: null,
          teamReviewSubmittedAt: null,
          teamReviewSubmittedBy: null,
          aiReviewData: null,
          finalReviewData: null,
          fieldSelections: null,
          customValues: null,
          comparisonCompletedAt: null,
          movedToCreateQuoteAt: null
        }
      },
      "create-quote": {
        status: "pending",
        completedAt: null,
        data: {
          accountingMonthlyPrice: null,
          accountingPriceCalculatedAt: null,
          accountingPriceBreakdown: null,
          lineItems: [],
          isEdited: false,
          hubspotSynced: false,
          hubspotSyncedAt: null,
          hubspotQuoteLink: null,
          quoteConfirmedAt: null
        }
      },
      "quote-sent": {
        status: "pending",
        completedAt: null,
        data: {
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          sentTo: "",
          followUpSequenceStarted: false,
          followUpSequenceStartedAt: null,
          nextFollowUpAt: null,
          followUpCount: 0,
          prospectRespondedAt: null,
          responseType: null
        }
      },
      "quote-approved": {
        status: "pending",
        completedAt: null,
        data: {
          approvedAt: null,
          approvedBy: null,
          approvalNotes: "",
          acknowledgmentSentAt: null,
          movedToEngagementAt: null
        }
      },
      "prepare-engagement": {
        status: "pending",
        completedAt: null,
        data: {
          walkthroughText: "",
          walkthroughGeneratedAt: null,
          isGenerating: false,
          isEdited: false,
          walkthroughConfirmedAt: null
        }
      },
      "internal-engagement-review": {
        status: "pending",
        completedAt: null,
        data: {
          recipients: [],
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          readyToSendAt: null
        }
      },
      "send-engagement": {
        status: "pending",
        completedAt: null,
        data: {
          customerEmailSubject: "",
          customerEmailBody: "",
          isEdited: false,
          sentViaHubspotAt: null
        }
      },
      "closed-won": {
        status: "pending",
        completedAt: null,
        data: {
          closedAt: null,
          finalDealValue: null,
          servicesIncluded: [],
          closingNotes: "",
          hubspotSynced: false,
          hubspotSyncedAt: null
        }
      },
      "closed-lost": {
        status: "pending",
        completedAt: null,
        data: {
          closedAt: null,
          lostReason: null,
          lostReasonDetails: "",
          lostFromStage: null,
          hubspotSynced: false,
          hubspotSyncedAt: null
        }
      }
    },
    createdAt: now,
    updatedAt: now
  }
}

// Empty GL Review form data for initialization
export function createEmptyGLReviewFormData(): GLReviewFormData {
  return {
    accounts: Array(20).fill(null).map(() => ({ name: "", transactionCount: "" as TransactionCount })),
    ecommerce: {
      amazon: "",
      shopify: "",
      square: "",
      etsy: "",
      ebay: "",
      woocommerce: "",
      other: ""
    },
    revenueCoaAllocations: "",
    coaRevenueCategories: "",
    activeClasses: "",
    catchupRequired: "",
    catchupDateRange: "",
    catchupMonths: "",
    additionalNotes: ""
  }
}

// Test data for GL Review auto-fill simulation
export function createTestGLReviewFormData(): GLReviewFormData {
  return {
    accounts: [
      { name: "Chase Business Checking", transactionCount: "20-100" },
      { name: "Chase Business Savings", transactionCount: "<20" },
      { name: "American Express Business", transactionCount: ">100" },
      { name: "Capital One Spark Card", transactionCount: "20-100" },
      { name: "Mercury Checking", transactionCount: "<20" },
      ...Array(15).fill(null).map(() => ({ name: "", transactionCount: "" as TransactionCount }))
    ],
    ecommerce: {
      amazon: "",
      shopify: "2",
      square: "1",
      etsy: "",
      ebay: "",
      woocommerce: "",
      other: ""
    },
    revenueCoaAllocations: "3-5",
    coaRevenueCategories: "Product Sales, Service Revenue, Subscription Revenue, Consulting Fees",
    activeClasses: "4",
    catchupRequired: "yes",
    catchupDateRange: "January 2024 - Present",
    catchupMonths: "12",
    additionalNotes: "Client has multiple Shopify stores for different product lines. Square is used for in-person events. Need to review bank feed rules for categorization accuracy."
  }
}

// Test confidence data for GL Review - no longer used since we removed AI confidence
export function createTestGLReviewFieldConfidence(): GLReviewFieldConfidence {
  return {
    // High confidence - from accounting system data
    accounts: "high",
    ecommerce: "medium",

    // Medium confidence - inferred from GL patterns
    revenueCoaAllocations: "medium",
    coaRevenueCategories: "medium",
    activeClasses: "high",

    // Lower confidence - requires human verification
    catchupRequired: "medium",
    catchupDateRange: "low",
    additionalNotes: "low"
  }
}

// Test data for team member's GL Review - intentionally different from auto-generated review for comparison testing
export function createTestTeamGLReviewFormData(): GLReviewFormData {
  return {
    accounts: [
      { name: "Chase Business Checking", transactionCount: ">100" },  // Different from AI (<20)
      { name: "Chase Business Savings", transactionCount: "<20" },
      { name: "American Express Business", transactionCount: ">100" },
      { name: "Capital One Spark Card", transactionCount: "20-100" },
      { name: "Mercury Checking", transactionCount: "<20" },
      { name: "Wells Fargo Line of Credit", transactionCount: "<20" },  // Additional account team found
      ...Array(14).fill(null).map(() => ({ name: "", transactionCount: "" as TransactionCount }))
    ],
    ecommerce: {
      amazon: "1",  // Different - team found Amazon account
      shopify: "2",
      square: "",  // Different - team didn't find Square
      etsy: "",
      ebay: "",
      woocommerce: "",
      other: ""
    },
    revenueCoaAllocations: ">5",  // Different from AI (3-5) - triggers custom pricing
    coaRevenueCategories: "Product Sales, Service Revenue, Subscription Revenue, Consulting Fees, Software Licensing",  // Added one more
    activeClasses: "5",  // Different from AI (4)
    catchupRequired: "yes",
    catchupDateRange: "October 2023 - Present",  // Different date range
    catchupMonths: "15",  // Different from AI (12)
    additionalNotes: "Client has 2 Shopify stores (US and Canada). Amazon FBA account discovered with ~50 orders/month. Wells Fargo LOC was used for equipment financing in 2023. Need to set up proper class tracking for the 5 departments."
  }
}

// Blank GL Review form data - used for manual bypass when user doesn't want to wait for team review
export function createBlankGLReviewFormData(): GLReviewFormData {
  return {
    accounts: Array(20).fill(null).map(() => ({ name: "", transactionCount: "" as TransactionCount })),
    ecommerce: {
      amazon: "",
      shopify: "",
      square: "",
      etsy: "",
      ebay: "",
      woocommerce: "",
      other: ""
    },
    revenueCoaAllocations: "",
    coaRevenueCategories: "",
    activeClasses: "",
    catchupRequired: "",
    catchupDateRange: "",
    catchupMonths: "",
    additionalNotes: ""
  }
}
