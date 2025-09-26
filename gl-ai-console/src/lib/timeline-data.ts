export interface TimelineEvent {
  id: string
  type: "demo" | "readiness" | "decision" | "scoping" | "scoping-prep" | "dev-overview" | "workflow-docs" | "sprint-pricing" | "proposal" | "proposal-decision" | "internal-client-docs" | "ea" | "setup" | "kickoff"
  title: string
  description: string
  timestamp: string
  status: "pending" | "in_progress" | "action-required" | "completed" | "failed" | "skipped"
  icon: string
  automationLevel: "fully-automated" | "manual-intervention"
  artifacts?: {
    name: string
    type: "pdf" | "audio" | "document" | "transcript" | "score"
    url?: string
  }[]
  actions?: {
    automated?: {
      label: string
      inProgress?: boolean
      timeLeft?: string
    }
    manual?: {
      label: string
    }
    decision?: {
      options: Array<{
        label: string
        action: string
        variant: "primary" | "secondary" | "destructive"
      }>
    }
  }
  readinessScore?: number
  isCollapsed?: boolean
}

export const determineCurrentStage = (events: TimelineEvent[]): string => {
  // Find the current stage based on timeline progress
  // Logic: Return the first pending/in_progress/action-required stage,
  // or the last completed stage if all are done

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    if (event.status === "pending" || event.status === "in_progress" || event.status === "action-required") {
      return event.type
    }
    if (event.status === "skipped") {
      // If skipped, continue to next stage
      continue
    }
  }

  // If all stages are completed, return the last stage
  const lastCompletedStage = events
    .filter(e => e.status === "completed")
    .pop()

  return lastCompletedStage?.type || "new"
}

export const getTimelineForLead = (leadId: string, leadStage?: string): TimelineEvent[] => {
  const baseTimeline: TimelineEvent[] = [
    {
      id: "demo",
      type: "demo",
      title: "Demo Call",
      description: "⚡ This stage runs automatically. Demo call transcript is usually uploaded automatically via automation. When uploaded, it will automatically populate the project name (which can be edited afterwards). If not received automatically, manually upload to complete this stage.\n\n📋 Note for existing customers: This can be the meeting transcript where the new project was discussed at a high level, or a brief document prepared by the developer outlining the new project. For new customers, this is the formal demo call transcript.",
      timestamp: "",
      status: "pending",
      icon: "🎥",
      automationLevel: "fully-automated",
      actions: {
        manual: { label: "📄 Upload Demo Transcript" }
      }
    },
    {
      id: "readiness",
      type: "readiness",
      title: "Readiness Assessment",
      description: "⚡ This stage runs automatically. The readiness assessment should be automatically generated and attached, but if not then you can click the 'Generate with AI' button to generate it, or upload the file manually",
      timestamp: "",
      status: "pending",
      icon: "🎯",
      automationLevel: "fully-automated",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📊 Upload Manually" }
      }
    },
    {
      id: "decision",
      type: "decision",
      title: "Scoping Decision Point",
      description: "👤 This stage requires your action. Based on readiness assessment, decide whether to proceed with scoping",
      timestamp: "",
      status: "pending",
      icon: "🤔",
      automationLevel: "manual-intervention",
      actions: {
        decision: {
          options: [
            { label: "✅ Schedule Scoping", action: "proceed", variant: "primary" },
            { label: "❌ Not a Fit", action: "reject", variant: "destructive" }
          ]
        }
      }
    },
    {
      id: "scoping-prep",
      type: "scoping-prep",
      title: "Scoping Prep",
      description: "⚡ This stage runs automatically. The scoping prep document should be automatically generated and attached, but if not then you can click the 'Generate with AI' button to generate it, or upload the file manually",
      timestamp: "",
      status: "pending",
      icon: "📄",
      automationLevel: "fully-automated",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Create Manually" }
      }
    },
    {
      id: "scoping",
      type: "scoping",
      title: "Scoping Call",
      description: "⚡ This stage runs automatically. Scoping call transcript is usually uploaded automatically via automation. If not received automatically, manually upload to complete this stage.\n\n📋 Note for existing customers: This should be a transcript of a detailed technical meeting between the existing customer and developer to discuss the new project in depth, including mappings, edge cases, error handling, and technical specifications. For new customers, this is the formal scoping call transcript.",
      timestamp: "",
      status: "pending",
      icon: "🔍",
      automationLevel: "fully-automated",
      actions: {
        manual: { label: "📄 Upload Scoping Transcript" }
      }
    },
    {
      id: "dev-overview",
      type: "dev-overview",
      title: "Developer Overview",
      description: "👤 This stage requires your action. Developer creates detailed overview of the lead's automation (audio recording or written document) and uploads it manually",
      timestamp: "",
      status: "pending",
      icon: "🎧",
      automationLevel: "manual-intervention",
      actions: {
        manual: { label: "📄 Upload Developer Overview (Audio or Document)" }
      }
    },
    {
      id: "workflow-docs",
      type: "workflow-docs",
      title: "N8N Workflow Description",
      description: "⚡ This stage runs automatically. The n8n workflow description should be automatically generated and attached, but if not then you can click the 'Generate with AI' button to generate it, or upload the file manually",
      timestamp: "",
      status: "pending",
      icon: "📚",
      automationLevel: "fully-automated",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Upload Manually" }
      }
    },
    {
      id: "sprint-pricing",
      type: "sprint-pricing",
      title: "Review Sprint Length & Price Estimate",
      description: "👤 This stage requires your action. Review and finalize sprint planning and pricing estimates for the project",
      timestamp: "",
      status: "pending",
      icon: "💰",
      automationLevel: "manual-intervention",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Upload Manually" }
      }
    },
    {
      id: "proposal",
      type: "proposal",
      title: "Generate & Send Proposal Email",
      description: "👤 This stage requires your action. Generate comprehensive proposal email based on scoping results and send to client",
      timestamp: "",
      status: "pending",
      icon: "📧",
      automationLevel: "manual-intervention",
      actions: {
        automated: { label: "⚡ Auto-generate Proposal" },
        manual: { label: "📄 Create Manually" }
      }
    },
    {
      id: "proposal-decision",
      type: "proposal-decision",
      title: "Proposal Decision Point",
      description: "Client's response to the proposal - track acceptance, decline, or adjustments",
      timestamp: "",
      status: "pending",
      icon: "⚖️",
      actions: {
        decision: {
          options: [
            { label: "✅ Accepted Proposal", action: "accept", variant: "primary" },
            { label: "❌ Declined Proposal", action: "decline", variant: "destructive" },
            { label: "🔄 Adjusted & Accepted Proposal", action: "adjust", variant: "secondary" }
          ]
        }
      }
    },
    {
      id: "internal-client-docs",
      type: "internal-client-docs",
      title: "Internal & Client Scoping Document",
      description: "⚡ This stage runs automatically. The internal & client scoping document should be automatically generated and attached, but if not then you can click the 'Generate with AI' button to generate it, or upload the file manually.\n\n📋 Note for existing customers: This AI-generated document can be added to the existing customer's scoping documentation or kept as a separate project-specific document, based on customer preference.",
      timestamp: "",
      status: "pending",
      icon: "📋",
      automationLevel: "fully-automated",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Upload Manually" }
      }
    },
    {
      id: "ea",
      type: "ea",
      title: "Engagement Agreement",
      description: "👤 This stage requires your action. The contact and proposal draft, as well as the project specific EA wording should automatically be completed and attached, then you just must make the final touches in the Anchor proposal and send to the client, then click the confirm completed button. If any of those items are not done automatically you have the option to trigger the creation of the contact and proposal draft in Anchor and can also manually trigger the generation of the project specific EA wording or can manually upload your own file.\n\n📋 Note for existing customers: The project-specific wording can be added to the existing engagement agreement's custom wording section rather than creating a separate agreement.",
      timestamp: "",
      status: "pending",
      icon: "📝",
      automationLevel: "manual-intervention",
      actions: {
        automated: { label: "⚡ Auto-generate EA" },
        manual: { label: "✍️ Create Manually" }
      }
    },
    {
      id: "setup",
      type: "setup",
      title: "Project Setup",
      description: "👤 This stage requires your action. The ClickUp task and Airtable inventory record should automatically be created, then you just must use the kickoff email draft to send an email to the lead and then click email sent to complete this stage. You can also trigger the creation of the ClickUp task and Airtable inventory record if needed.",
      timestamp: "",
      status: "pending",
      icon: "⚙️",
      automationLevel: "manual-intervention",
      actions: {
        automated: { label: "⚡ Create ClickUp Task" },
        manual: { label: "📊 Create Airtable Inventory Record" }
      }
    },
    {
      id: "kickoff",
      type: "kickoff",
      title: "Kickoff Meeting Agenda",
      description: "⚡ This stage runs automatically. The kickoff meeting agenda should be automatically generated and attached, but if not then you can click the 'Generate with AI' button to generate it, or upload the file manually",
      timestamp: "",
      status: "pending",
      icon: "🚀",
      automationLevel: "fully-automated",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Upload Manually" }
      }
    }
  ]

  // If leadStage is provided, use it to determine timeline state
  if (leadStage) {
    const stageOrder = ['demo', 'readiness', 'decision', 'scoping-prep', 'scoping', 'dev-overview', 'workflow-docs', 'sprint-pricing', 'proposal', 'proposal-decision', 'internal-client-docs', 'ea', 'setup', 'kickoff']
    const currentStageIndex = stageOrder.indexOf(leadStage)

    return baseTimeline.map((item, index) => {
      if (index < currentStageIndex) {
        return {
          ...item,
          status: "completed" as const,
          timestamp: "Completed",
          isCollapsed: true
        }
      }
      if (index === currentStageIndex) {
        return {
          ...item,
          status: "pending" as const,
          timestamp: "",
          isCollapsed: false // Current stage - expanded
        }
      }
      return {
        ...item,
        isCollapsed: true // Future stages collapsed
      }
    })
  }

  // Fallback to hardcoded scenarios for specific demo leads
  switch (leadId) {
    case "lead-1":
      // Brand new lead at Demo Call stage
      return baseTimeline.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            status: "pending" as const,
            timestamp: "",
            isCollapsed: false // Next stage to do - expanded
          }
        }
        return {
          ...item,
          isCollapsed: true // All other stages collapsed
        }
      })

    case "lead-2":
      // At Decision Point with readiness score
      return baseTimeline.map((item, index) => {
        if (index < 2) {
          return {
            ...item,
            status: "completed" as const,
            timestamp: new Date(Date.now() - (2 - index) * 24 * 60 * 60 * 1000).toISOString(),
            isCollapsed: true,
            artifacts: index === 1 ? [
              { name: "Readiness_Report.pdf", type: "pdf" as const },
              { name: "Score: 85/100", type: "score" as const }
            ] : undefined,
            readinessScore: index === 1 ? 85 : undefined
          }
        }
        if (index === 2) {
          return {
            ...item,
            status: "action-required" as const,
            timestamp: "Awaiting Decision",
            readinessScore: 85,
            isCollapsed: false // Next stage to do - expanded
          }
        }
        return {
          ...item,
          isCollapsed: true // All other stages collapsed
        }
      })

    case "lead-3":
      // In progress with Developer Audio Overview
      return baseTimeline.map((item, index) => {
        if (index < 5) {
          return {
            ...item,
            status: "completed" as const,
            timestamp: new Date(Date.now() - (5 - index) * 24 * 60 * 60 * 1000).toISOString(),
            isCollapsed: true
          }
        }
        if (index === 5) {
          return {
            ...item,
            status: "in_progress" as const,
            timestamp: "Today 11:30 AM",
            isCollapsed: false, // Current stage in progress - expanded
            actions: {
              ...item.actions,
              automated: { label: "⚡ Recording...", inProgress: true, timeLeft: "5 min left" }
            }
          }
        }
        return {
          ...item,
          isCollapsed: true // All other stages collapsed
        }
      })

    case "lead-4":
      // Marked as "Not a Fit" after assessment
      return baseTimeline.map((item, index) => {
        if (index < 2) {
          return {
            ...item,
            status: "completed" as const,
            timestamp: new Date(Date.now() - (2 - index) * 24 * 60 * 60 * 1000).toISOString(),
            isCollapsed: true,
            artifacts: index === 1 ? [
              { name: "Readiness_Report.pdf", type: "pdf" as const },
              { name: "Score: 45/100", type: "score" as const }
            ] : undefined,
            readinessScore: index === 1 ? 45 : undefined
          }
        }
        if (index === 2) {
          return {
            ...item,
            status: "completed" as const,
            timestamp: "Yesterday 3:00 PM",
            description: "Decision: Not a good fit for automation at this time",
            actions: undefined,
            isCollapsed: false // Show the rejection decision expanded
          }
        }
        if (index > 2) {
          return {
            ...item,
            status: "skipped" as const,
            description: "Skipped - Not proceeding with this lead",
            isCollapsed: true
          }
        }
        return item
      })

    case "lead-5":
      // Fully completed through Kickoff
      return baseTimeline.map((item, index) => ({
        ...item,
        status: "completed" as const,
        timestamp: new Date(Date.now() - (10 - index) * 24 * 60 * 60 * 1000).toISOString(),
        isCollapsed: true, // All stages collapsed since fully completed
        artifacts: index === 1 ? [{ name: "Readiness_Report.pdf", type: "pdf" as const }] :
                   index === 7 ? [{ name: "Final_Proposal.pdf", type: "pdf" as const }] : undefined
      }))

    default:
      // Default: Fresh lead, everything pending
      return baseTimeline.map((item, index) => ({
        ...item,
        isCollapsed: index !== 0 // Only first stage (Demo Call) expanded, rest collapsed
      }))
  }
}