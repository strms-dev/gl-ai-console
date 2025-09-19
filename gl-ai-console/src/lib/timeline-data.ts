export interface TimelineEvent {
  id: string
  type: "demo" | "readiness" | "decision" | "scoping" | "scoping-prep" | "dev-overview" | "workflow-docs" | "sprint-pricing" | "proposal" | "proposal-decision" | "internal-client-docs" | "ea" | "setup" | "kickoff"
  title: string
  description: string
  timestamp: string
  status: "pending" | "in_progress" | "action-required" | "completed" | "failed" | "skipped"
  icon: string
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

export const getTimelineForLead = (leadId: string): TimelineEvent[] => {
  const baseTimeline: TimelineEvent[] = [
    {
      id: "demo",
      type: "demo",
      title: "Demo Call",
      description: "Demo call transcript is usually uploaded automatically via automation. If not received automatically, manually upload to complete this stage",
      timestamp: "",
      status: "pending",
      icon: "🎥",
      actions: {
        manual: { label: "📄 Upload Demo Transcript" }
      }
    },
    {
      id: "readiness",
      type: "readiness",
      title: "Readiness Assessment",
      description: "Generate automation readiness assessment using AI or upload manually",
      timestamp: "",
      status: "pending",
      icon: "🎯",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📊 Upload Manually" }
      }
    },
    {
      id: "decision",
      type: "decision",
      title: "Scoping Decision Point",
      description: "Based on readiness assessment, decide whether to proceed with scoping",
      timestamp: "",
      status: "pending",
      icon: "🤔",
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
      title: "Scoping Prep Document",
      description: "Preparation document with demo insights and readiness summary",
      timestamp: "",
      status: "pending",
      icon: "📄",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Create Manually" }
      }
    },
    {
      id: "scoping",
      type: "scoping",
      title: "Scoping Call",
      description: "Scoping call transcript is usually uploaded automatically via automation. If not received automatically, manually upload to complete this stage",
      timestamp: "",
      status: "pending",
      icon: "🔍",
      actions: {
        manual: { label: "📄 Upload Scoping Transcript" }
      }
    },
    {
      id: "dev-overview",
      type: "dev-overview",
      title: "Developer Overview",
      description: "Developer creates detailed overview of the lead's automation (audio recording or written document)",
      timestamp: "",
      status: "pending",
      icon: "🎧",
      actions: {
        manual: { label: "📄 Upload Developer Overview (Audio or Document)" }
      }
    },
    {
      id: "workflow-docs",
      type: "workflow-docs",
      title: "N8N Workflow Description",
      description: "Natural language description of the n8n workflow",
      timestamp: "",
      status: "pending",
      icon: "📚",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Upload Manually" }
      }
    },
    {
      id: "sprint-pricing",
      type: "sprint-pricing",
      title: "Review Sprint Length & Price Estimate",
      description: "Review and finalize sprint planning and pricing estimates for the project",
      timestamp: "",
      status: "pending",
      icon: "💰",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Upload Manually" }
      }
    },
    {
      id: "proposal",
      type: "proposal",
      title: "Generate & Send Proposal Email",
      description: "Generate comprehensive proposal email based on scoping results and send to client",
      timestamp: "",
      status: "pending",
      icon: "📧",
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
      description: "Comprehensive scoping document for both internal team and client reference",
      timestamp: "",
      status: "pending",
      icon: "📋",
      actions: {
        automated: { label: "⚡ Generate with AI" },
        manual: { label: "📝 Upload Manually" }
      }
    },
    {
      id: "ea",
      type: "ea",
      title: "Engagement Agreement",
      description: "Finalize engagement agreement and project terms",
      timestamp: "",
      status: "pending",
      icon: "📝",
      actions: {
        automated: { label: "⚡ Auto-generate EA" },
        manual: { label: "✍️ Create Manually" }
      }
    },
    {
      id: "setup",
      type: "setup",
      title: "Project Setup",
      description: "Initialize project resources and development environment",
      timestamp: "",
      status: "pending",
      icon: "⚙️",
      actions: {
        automated: { label: "⚡ Auto-setup Project" },
        manual: { label: "🔧 Setup Manually" }
      }
    },
    {
      id: "kickoff",
      type: "kickoff",
      title: "Kickoff Brief",
      description: "Project kickoff meeting and team introductions",
      timestamp: "",
      status: "pending",
      icon: "🚀",
      actions: {
        automated: { label: "⚡ Auto-schedule Kickoff" },
        manual: { label: "📅 Schedule Manually" }
      }
    }
  ]

  // Create different scenarios based on lead ID
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