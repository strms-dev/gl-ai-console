"use client"

// Sales Pipeline Stage Types
export type SalesPipelineStageId = "demo-call"

export type SalesPipelineStageStatus =
  | "pending"
  | "in_progress"
  | "action-required"
  | "completed"
  | "skipped"

export type ClosedOutcome = "won" | "lost" | null

export type AccountingSystem = "qbo" | "xero" | "other" | null

// Intake Data from Demo Call Analysis
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
    description: "Demo call transcript is usually uploaded automatically via automation. When uploaded, it will automatically populate the project name (which can be edited afterwards). If not received automatically, manually upload to complete this stage.",
    icon: "video",
    actions: {
      manual: {
        label: "Upload Demo Transcript"
      }
    }
  }
]

// Default internal team recipients
export const DEFAULT_INTERNAL_RECIPIENTS = [
  { name: "Lori", email: "lori@growthlab.com" },
  { name: "Stephen", email: "stephen@growthlab.com" },
  { name: "Robin", email: "robin@growthlab.com" }
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
      }
    },
    createdAt: now,
    updatedAt: now
  }
}
