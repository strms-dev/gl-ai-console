/**
 * Data types and interfaces for STRMS Offboarding feature
 * Re-exports types from offboarding-types.ts and provides helper functions
 */

// Re-export types from the types file
export type {
  OffboardingStage,
  OffboardingCustomer,
  OffboardingCompletionDates,
} from './offboarding-types'

// Timeline event interface (used for UI configuration)
export interface OffboardingTimelineEvent {
  id: string
  type: string
  title: string
  description: string
  timestamp?: string
  status: "pending" | "in_progress" | "action-required" | "completed" | "failed" | "skipped"
  icon: string
  automationLevel: "fully-automated" | "manual-intervention"
  actions?: {
    automated?: { label: string }
    manual?: { label: string }
    decision?: {
      options: Array<{
        label: string
        value: string
        action: string
      }>
    }
  }
  details?: string[]
  checklistItems?: Array<{
    id: string
    label: string
  }>
  owner?: string
}

// Import the type for use in helper functions
import type { OffboardingStage } from './offboarding-types'

// Stage label and color mappings
export const stageLabels: Record<OffboardingStage, string> = {
  active: "Active Customer",
  "terminate-automations": "Terminating Automations",
  "terminate-billing": "Terminating Billing",
  "revoke-access": "Revoking Access",
  "update-inventory": "Updating Inventory",
  "send-email": "Sending Confirmation",
  complete: "Offboarding Complete"
}

export const stageColors: Record<OffboardingStage, string> = {
  active: "bg-blue-100 text-blue-800 border-blue-300",
  "terminate-automations": "bg-orange-100 text-orange-800 border-orange-300",
  "terminate-billing": "bg-orange-100 text-orange-800 border-orange-300",
  "revoke-access": "bg-orange-100 text-orange-800 border-orange-300",
  "update-inventory": "bg-orange-100 text-orange-800 border-orange-300",
  "send-email": "bg-orange-100 text-orange-800 border-orange-300",
  complete: "bg-green-100 text-green-800 border-green-300"
}

// Helper function to get stage order
export function getStageOrder(stage: OffboardingStage): number {
  const order: Record<OffboardingStage, number> = {
    active: 0,
    "terminate-automations": 1,
    "terminate-billing": 2,
    "revoke-access": 3,
    "update-inventory": 4,
    "send-email": 5,
    complete: 6
  }
  return order[stage] || 0
}

// Helper function to get next stage
export function getNextStage(currentStage: OffboardingStage): OffboardingStage | null {
  const stages: OffboardingStage[] = [
    "active",
    "terminate-automations",
    "terminate-billing",
    "revoke-access",
    "update-inventory",
    "send-email",
    "complete"
  ]

  const currentIndex = stages.indexOf(currentStage)
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null
  }

  return stages[currentIndex + 1]
}
