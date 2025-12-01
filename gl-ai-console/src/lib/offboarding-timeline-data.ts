/**
 * Timeline data structure for STRMS Offboarding process
 */

import type { OffboardingTimelineEvent, OffboardingStage } from "./offboarding-data"

export const offboardingTimelineEvents: OffboardingTimelineEvent[] = [
  {
    id: "terminate-automations",
    type: "terminate-automations",
    title: "Terminate Active Automations",
    description: "Locate and disable all customer automations across platforms",
    status: "pending",
    icon: "power-off",
    automationLevel: "manual-intervention",
    checklistItems: [
      { id: "zapier", label: "Zapier" },
      { id: "make", label: "Make" },
      { id: "prismatic", label: "Prismatic" },
      { id: "n8n", label: "n8n" }
    ],
    owner: "Automation team",
    actions: {
      manual: { label: "Mark as Complete" }
    }
  },
  {
    id: "terminate-billing",
    type: "terminate-billing",
    title: "Terminate Engagement Agreement & Billing",
    description: "Cancel engagement agreement and verify billing has stopped",
    status: "pending",
    icon: "x-circle",
    automationLevel: "manual-intervention",
    details: [
      "Anchor (or Ignition): End engagement agreement services",
      "Confirm no active billing cycles remain",
      "If termination occurs within 5 days after the 1st of the month, refund the customer's payment manually"
    ],
    owner: "Tim/CXR",
    actions: {
      manual: { label: "Mark as Complete" }
    }
  },
  {
    id: "revoke-access",
    type: "revoke-access",
    title: "Revoke Application Access (Practice Protect)",
    description: "Submit ticket to remove customer and associated applications",
    status: "pending",
    icon: "shield-off",
    automationLevel: "manual-intervention",
    details: [
      "Submit SlackBot Customer Termination Ticket to support team",
      "Request removal of customer and any associated applications",
      "Note: If STRMS customer only. If customer has other GrowthLab services, specify applications to remove"
    ],
    owner: "Automation team",
    actions: {
      manual: { label: "Mark as Complete" }
    }
  },
  {
    id: "update-inventory",
    type: "update-inventory",
    title: "Update Automation Inventory",
    description: "Update Airtable project status to reflect termination",
    status: "pending",
    icon: "database",
    automationLevel: "manual-intervention",
    details: [
      "Update Airtable automation inventory",
      "Change project status to 'Turned off'"
    ],
    owner: "Automation team",
    actions: {
      manual: { label: "Mark as Complete" }
    }
  },
  {
    id: "send-email",
    type: "send-email",
    title: "Send Offboarding Email",
    description: "Send final confirmation email to customer",
    status: "pending",
    icon: "mail",
    automationLevel: "manual-intervention",
    owner: "Tim/CXR",
    actions: {
      manual: { label: "Confirm Email Sent" }
    }
  }
]

// Function to get timeline for a specific customer based on their stage
export function getTimelineForCustomer(
  customerId: string,
  currentStage?: OffboardingStage
): OffboardingTimelineEvent[] {
  const timeline = offboardingTimelineEvents.map(event => ({ ...event }))

  if (!currentStage || currentStage === "active") {
    // For active customers (not yet started offboarding), all stages are pending
    return timeline
  }

  // Update status based on current stage
  // The customer's stage represents the stage they are CURRENTLY WORKING ON
  // So stages before the current stage are completed, current stage is pending
  const stageOrder = [
    "terminate-automations",
    "terminate-billing",
    "revoke-access",
    "update-inventory",
    "send-email"
  ]

  const currentIndex = stageOrder.indexOf(currentStage)

  timeline.forEach((event, index) => {
    // Mark stages before the current stage as completed
    // Current stage and stages after remain pending
    if (index < currentIndex) {
      event.status = "completed"
    } else {
      event.status = "pending"
    }
  })

  // Special case: if we're at "complete" stage, mark everything as completed
  if (currentStage === "complete") {
    timeline.forEach(event => {
      event.status = "completed"
    })
  }

  return timeline
}

// Email template for Step 5
export const offboardingEmailTemplate = `Subject: Final Confirmation: STRMS Services Terminated

Hi [Customer First Name],

This email confirms that your STRMS service has been officially terminated as of [DATE].

As part of this offboarding:

• All custom automations and integrations in Zapier, Make, n8n, and/or Prismatic have been deactivated.
• Your engagement agreement has been closed in our system.
• Billing has been stopped. [If applicable: A refund of $[XX] has been issued based on your cancellation date.]

If you wish to re-engage with our team in the future, we'd be happy to support you.

We appreciate the opportunity to work together and wish you the best in your continued success.

Warmly,
The STRMS Team`
