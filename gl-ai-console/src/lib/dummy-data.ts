export interface Lead {
  id: string
  projectName: string
  company: string
  contact: string
  email: string
  stage: "new" | "demo" | "readiness" | "decision" | "scoping" | "scoping-prep" | "dev-overview" | "workflow-docs" | "sprint-pricing" | "proposal" | "proposal-decision" | "internal-client-docs" | "ea" | "setup" | "kickoff"
  lastActivity: string
  readinessScore?: number
  estimatedValue?: number
  nextAction?: string
}

export const dummyLeads: Lead[] = [
  {
    id: "lead-1",
    projectName: "Karbon > Notion Sync",
    company: "Acme Corp",
    contact: "John Smith",
    email: "john@acmecorp.com",
    stage: "demo",
    lastActivity: "2 hours ago"
  }
]

export const stageLabels = {
  new: "New Lead",
  demo: "Demo Call",
  readiness: "Readiness Assessment",
  decision: "Scoping Decision",
  scoping: "Scoping Call",
  "scoping-prep": "Scoping Prep",
  "dev-overview": "Developer Overview",
  "workflow-docs": "Workflow Documentation",
  "sprint-pricing": "Sprint Pricing",
  proposal: "Proposal Sent",
  "proposal-decision": "Proposal Decision",
  "internal-client-docs": "Internal & Client Docs",
  ea: "Engagement Agreement",
  setup: "Project Setup",
  kickoff: "Project Kickoff"
}

export const stageColors = {
  new: "bg-slate-100 text-slate-800",
  demo: "bg-blue-100 text-blue-800",
  readiness: "bg-yellow-100 text-yellow-800",
  decision: "bg-amber-100 text-amber-800",
  scoping: "bg-purple-100 text-purple-800",
  "scoping-prep": "bg-indigo-100 text-indigo-800",
  "dev-overview": "bg-cyan-100 text-cyan-800",
  "workflow-docs": "bg-teal-100 text-teal-800",
  "sprint-pricing": "bg-violet-100 text-violet-800",
  proposal: "bg-orange-100 text-orange-800",
  "proposal-decision": "bg-red-100 text-red-800",
  "internal-client-docs": "bg-emerald-100 text-emerald-800",
  ea: "bg-green-100 text-green-800",
  setup: "bg-lime-100 text-lime-800",
  kickoff: "bg-gray-100 text-gray-800"
}