"use client"

// Sales Pipeline Stage Types
export type SalesPipelineStageId = "demo-call" | "sales-intake" | "follow-up-email" | "reminder-sequence" | "internal-review"

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
  emailSubject: string
  emailBody: string
  isEdited: boolean
  sentAt: string | null
  hubspotDealMoved: boolean
  hubspotDealMovedAt: string | null
}

// Reminder Sequence Stage Data
export type ReminderSequenceStatus = "not_enrolled" | "scheduled" | "enrolled" | "unenrolled_response" | "unenrolled_access"

export interface ReminderSequenceStageData {
  // Enrollment status
  status: ReminderSequenceStatus
  sequenceType: "qbo" | "xero" | "other" | null  // Based on accounting platform

  // Auto-enrollment tracking
  scheduledEnrollmentAt: string | null  // 3 business days after follow-up email sent
  enrolledAt: string | null
  enrolledBy: "auto" | "manual" | null

  // Unenrollment tracking
  unenrolledAt: string | null
  unenrollmentReason: "response" | "access_received" | "manual" | null

  // Access tracking
  accessReceivedAt: string | null
  accessPlatform: "qbo" | "xero" | "other" | null

  // Contact response tracking
  contactRespondedAt: string | null
}

// Internal Review Stage Data - for assigning GL review to internal team
export interface InternalReviewStageData {
  // Recipients for the internal email
  recipients: { name: string; email: string }[]

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
    description: "If no response is received, the contact will be automatically enrolled in a HubSpot reminder sequence 3 business days after the follow-up email is sent. They will be unenrolled when they respond or grant access.",
    icon: "repeat",
    actions: {}
  },
  {
    id: "internal-review",
    title: "Internal Team Assignment",
    description: "Now that access has been received, send an email to the internal team to assign them the general ledger review. Select recipients and customize the email before sending.",
    icon: "users",
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
    subject: "Growth Lab Follow-Up - Next Steps for Your Engagement",
    bodyTemplate: `Hi {{contactName}},

Thank you for taking the time to meet with us today. I enjoyed learning about {{companyName}} and understanding your needs.

Based on our conversation, I wanted to recap the key points we discussed:
{{callRecap}}

Next Steps:
To move forward, we'll need access to your QuickBooks Online account. This will allow our team to complete a general ledger review and prepare an accurate quote for your services.

Please follow these steps to grant access:
1. Log into your QuickBooks Online account
2. Go to Settings (gear icon) > Manage Users
3. Click "Add User" and select "Accountant"
4. Enter our email: access@growthlab.com

Once we have access, our team will complete the review within 2-3 business days and I'll follow up with pricing.

Please let me know if you have any questions!

Best regards,
Tim`
  },
  xero: {
    subject: "Growth Lab Follow-Up - Next Steps for Your Engagement",
    bodyTemplate: `Hi {{contactName}},

Thank you for taking the time to meet with us today. I enjoyed learning about {{companyName}} and understanding your needs.

Based on our conversation, I wanted to recap the key points we discussed:
{{callRecap}}

Next Steps:
To move forward, we'll need access to your Xero account. This will allow our team to complete a general ledger review and prepare an accurate quote for your services.

Please follow these steps to grant access:
1. Log into your Xero account
2. Go to Settings > Users
3. Click "Invite User"
4. Enter our email: access@growthlab.com
5. Set the role to "Advisor"

Once we have access, our team will complete the review within 2-3 business days and I'll follow up with pricing.

Please let me know if you have any questions!

Best regards,
Tim`
  },
  reports: {
    subject: "Growth Lab Follow-Up - Next Steps for Your Engagement",
    bodyTemplate: `Hi {{contactName}},

Thank you for taking the time to meet with us today. I enjoyed learning about {{companyName}} and understanding your needs.

Based on our conversation, I wanted to recap the key points we discussed:
{{callRecap}}

Next Steps:
To move forward and prepare an accurate quote, we'll need the following financial reports:
- Year-to-date Profit & Loss Statement
- Balance Sheet as of today
- General Ledger for the current year
- Accounts Receivable Aging Report
- Accounts Payable Aging Report

You can export these from your accounting system and send them directly to this email or upload them to a shared folder.

Once we receive these documents, our team will complete the review within 2-3 business days and I'll follow up with pricing.

Please let me know if you have any questions!

Best regards,
Tim`
  }
}

// Internal assignment email template
export const INTERNAL_ASSIGNMENT_EMAIL = {
  subject: "New Client Assigned - GL Review Required",
  bodyTemplate: `Hi team,

You've been assigned a new client for general ledger review.

Client: {{companyName}}
Contact: {{contactName}}
Accounting System: {{accountingSystem}}
Services Requested: {{servicesNeeded}}

Please complete the GL review and note any findings. This will inform our pricing recommendation.

Expected turnaround: 2-3 business days

Tim`
}

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
          sequenceType: null,
          scheduledEnrollmentAt: null,
          enrolledAt: null,
          enrolledBy: null,
          unenrolledAt: null,
          unenrollmentReason: null,
          accessReceivedAt: null,
          accessPlatform: null,
          contactRespondedAt: null
        }
      },
      "internal-review": {
        status: "pending",
        completedAt: null,
        data: {
          recipients: [],
          emailSubject: "",
          emailBody: "",
          isEdited: false,
          sentAt: null,
          reviewAssignedTo: null,
          reviewCompletedAt: null,
          reviewNotes: null
        }
      }
    },
    createdAt: now,
    updatedAt: now
  }
}
