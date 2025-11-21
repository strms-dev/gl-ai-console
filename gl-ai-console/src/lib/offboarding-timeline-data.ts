/**
 * Timeline data structure for STRMS Offboarding process
 */

import type { OffboardingTimelineEvent, OffboardingStage } from "./offboarding-data"

export const offboardingTimelineEvents: OffboardingTimelineEvent[] = [
  {
    id: "terminate-automations",
    type: "terminate-automations",
    title: "Step 1: Terminate Active Automations",
    description: "Turn off or delete all active automations across platforms",
    status: "pending",
    icon: "power-off",
    automationLevel: "manual-intervention",
    details: [
      "Zapier: Locate all Zaps tagged/named with customer name and turn off or delete",
      "Make.com: Find and disable or delete scenarios",
      "Prismatic: Find and turn off or delete instances",
      "n8n: Find and turn off or delete workflows"
    ],
    owner: "Automation team",
    actions: {
      manual: { label: "Mark as Complete" }
    }
  },
  {
    id: "terminate-billing",
    type: "terminate-billing",
    title: "Step 2: Terminate Engagement Agreement & Billing",
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
    title: "Step 3: Revoke Application Access (Practice Protect)",
    description: "Submit ticket to remove customer and associated applications",
    status: "pending",
    icon: "shield-off",
    automationLevel: "manual-intervention",
    details: [
      "Submit SlackBot Customer Termination Ticket to support team",
      "Request removal of customer and any associated applications",
      "Note: If STRMS customer only. If customer has other GrowthLab services, specify applications to remove"
    ],
    owner: "Automation team (submits ticket)",
    actions: {
      manual: { label: "Create SlackBot Ticket" }
    }
  },
  {
    id: "update-inventory",
    type: "update-inventory",
    title: "Step 4: Update Automation Inventory",
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
      manual: { label: "Update Airtable" }
    }
  },
  {
    id: "send-email",
    type: "send-email",
    title: "Step 5: Send Offboarding Email",
    description: "Send final confirmation email to customer",
    status: "pending",
    icon: "mail",
    automationLevel: "manual-intervention",
    details: [
      "From: Tim",
      "Subject: Final Confirmation: STRMS Services Terminated",
      "Include: Confirmation of automation deactivation, engagement closure, billing stopped, refund info (if applicable)"
    ],
    owner: "Tim/CXR",
    actions: {
      manual: { label: "Send Email" }
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
    // For active customers (not yet started offboarding), mark first stage as in_progress
    if (timeline.length > 0) {
      timeline[0].status = "in_progress"
    }
    return timeline
  }

  // Update status based on current stage
  const stageOrder = [
    "terminate-automations",
    "terminate-billing",
    "revoke-access",
    "update-inventory",
    "send-email"
  ]

  const currentIndex = stageOrder.indexOf(currentStage)

  timeline.forEach((event, index) => {
    if (index < currentIndex) {
      event.status = "completed"
    } else if (index === currentIndex) {
      event.status = "in_progress"
    } else {
      event.status = "pending"
    }
  })

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
