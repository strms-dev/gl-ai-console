"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Search,
  Radio,
  Lightbulb,
  Database,
  Send,
  ArrowRight,
  LayoutGrid,
  List,
  CheckCircle,
} from "lucide-react"

// Components
import { InfluencerFinderCard } from "@/components/marketing/lead-discovery/influencer-finder-card"
import { TrigifyTrackerCard } from "@/components/marketing/lead-discovery/trigify-tracker-card"
import { HypothesisLabCard } from "@/components/marketing/lead-discovery/hypothesis-lab-card"
import { ClayPipelineCard } from "@/components/marketing/lead-discovery/clay-pipeline-card"
import { InfluencerFinderModal } from "@/components/marketing/lead-discovery/influencer-finder-modal"
import { TrigifyTrackerModal } from "@/components/marketing/lead-discovery/trigify-tracker-modal"
import { HypothesisLabModal } from "@/components/marketing/lead-discovery/hypothesis-lab-modal"
import { ClayPipelineModal } from "@/components/marketing/lead-discovery/clay-pipeline-modal"
import { LeadDiscoveryChat } from "@/components/marketing/lead-discovery/lead-discovery-chat"

// Test Data
import {
  testInfluencers,
  testEngagedPeople,
  testHypotheses,
  testClayLeads,
  testLeadChatMessages,
  getLeadDashboardStats,
} from "@/lib/lead-discovery-data"

import { LeadWorkflowContext, LeadChatMessage, LeadViewMode } from "@/lib/lead-discovery-types"

export default function LeadDiscoveryPage() {
  // View state
  const [viewMode, setViewMode] = useState<LeadViewMode>('workflows')
  const [workflowContext, setWorkflowContext] = useState<LeadWorkflowContext>('dashboard')

  // Modal states
  const [influencerFinderOpen, setInfluencerFinderOpen] = useState(false)
  const [trigifyTrackerOpen, setTrigifyTrackerOpen] = useState(false)
  const [hypothesisLabOpen, setHypothesisLabOpen] = useState(false)
  const [clayPipelineOpen, setClayPipelineOpen] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState<LeadChatMessage[]>(testLeadChatMessages)

  // Get stats
  const stats = getLeadDashboardStats()

  // Handlers
  const handleSendMessage = (message: string) => {
    const newMessage: LeadChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, newMessage])

    // Simulate assistant response
    setTimeout(() => {
      const response: LeadChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: getSimulatedResponse(message, workflowContext),
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, response])
    }, 1000)
  }

  const handleOpenModal = (modal: 'influencer' | 'trigify' | 'hypothesis' | 'clay') => {
    switch (modal) {
      case 'influencer':
        setInfluencerFinderOpen(true)
        setWorkflowContext('influencer_finder')
        break
      case 'trigify':
        setTrigifyTrackerOpen(true)
        setWorkflowContext('trigify_tracker')
        break
      case 'hypothesis':
        setHypothesisLabOpen(true)
        setWorkflowContext('hypothesis_lab')
        break
      case 'clay':
        setClayPipelineOpen(true)
        setWorkflowContext('clay_pipeline')
        break
    }
  }

  const handleCloseModal = (modal: 'influencer' | 'trigify' | 'hypothesis' | 'clay') => {
    switch (modal) {
      case 'influencer':
        setInfluencerFinderOpen(false)
        break
      case 'trigify':
        setTrigifyTrackerOpen(false)
        break
      case 'hypothesis':
        setHypothesisLabOpen(false)
        break
      case 'clay':
        setClayPipelineOpen(false)
        break
    }
    setWorkflowContext('dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#407B9D]/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-[#407B9D]" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Lead Discovery
              </h1>
              <p
                className="text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Find influencers, generate hypotheses, and build your lead pipeline
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white border rounded-lg p-1 shadow-sm">
            <Button
              size="sm"
              variant={viewMode === 'workflows' ? 'default' : 'ghost'}
              onClick={() => {
                setViewMode('workflows')
                setWorkflowContext('dashboard')
              }}
              className={viewMode === 'workflows' ? 'bg-[#407B9D]' : ''}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Workflows
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'queue' ? 'default' : 'ghost'}
              onClick={() => {
                setViewMode('queue')
                setWorkflowContext('queue')
              }}
              className={viewMode === 'queue' ? 'bg-[#407B9D]' : ''}
            >
              <List className="w-4 h-4 mr-2" />
              Lead Queue
              <span className="ml-1 text-xs opacity-70">({stats.leadsInClay})</span>
            </Button>
          </div>
        </div>

        {/* Lead Discovery Pipeline (only on workflows view) */}
        {viewMode === 'workflows' && (
          <div className="mb-8 p-4 bg-white rounded-xl border shadow-sm">
            <p
              className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Lead Discovery Pipelines
            </p>

            {/* Dual Pipeline Visual */}
            <div className="space-y-4">
              {/* Influencer Pipeline */}
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-muted-foreground w-24 flex-shrink-0">
                  Influencer Path
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { icon: Search, label: 'Find', color: '#407B9D', action: () => handleOpenModal('influencer') },
                    { icon: Radio, label: 'Trigify', color: '#95CBD7', action: () => handleOpenModal('trigify') },
                    { icon: CheckCircle, label: 'Engage', color: '#C8E4BB', action: () => handleOpenModal('trigify') },
                  ].map((step, index, arr) => (
                    <div key={step.label} className="flex items-center">
                      <button
                        onClick={step.action}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${step.color}20` }}
                        >
                          <step.icon className="w-4 h-4" style={{ color: step.color }} />
                        </div>
                        <span
                          className="text-sm font-medium text-[#463939]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {step.label}
                        </span>
                      </button>
                      {index < arr.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  <ArrowRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
                </div>
              </div>

              {/* Hypothesis Pipeline */}
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-muted-foreground w-24 flex-shrink-0">
                  Hypothesis Path
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { icon: Lightbulb, label: 'Hypothesize', color: '#407B9D', action: () => handleOpenModal('hypothesis') },
                    { icon: CheckCircle, label: 'Validate', color: '#95CBD7', action: () => handleOpenModal('hypothesis') },
                  ].map((step, index, arr) => (
                    <div key={step.label} className="flex items-center">
                      <button
                        onClick={step.action}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${step.color}20` }}
                        >
                          <step.icon className="w-4 h-4" style={{ color: step.color }} />
                        </div>
                        <span
                          className="text-sm font-medium text-[#463939]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {step.label}
                        </span>
                      </button>
                      {index < arr.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  <ArrowRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
                </div>
              </div>

              {/* Shared Pipeline (Clay + Outreach) */}
              <div className="flex items-center gap-2 pt-2 border-t border-dashed">
                <div className="text-xs font-medium text-muted-foreground w-24 flex-shrink-0">
                  Both Converge
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { icon: Database, label: 'Clay', color: '#C8E4BB', action: () => handleOpenModal('clay') },
                    { icon: Send, label: 'Outreach', color: '#F59E0B', action: () => handleOpenModal('clay') },
                  ].map((step, index, arr) => (
                    <div key={step.label} className="flex items-center">
                      <button
                        onClick={step.action}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${step.color}20` }}
                        >
                          <step.icon className="w-4 h-4" style={{ color: step.color }} />
                        </div>
                        <span
                          className="text-sm font-medium text-[#463939]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {step.label}
                        </span>
                      </button>
                      {index < arr.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'workflows' ? (
          <>
            {/* Workflow Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <InfluencerFinderCard
                newDiscoveriesCount={stats.newInfluencers}
                onOpenModal={() => handleOpenModal('influencer')}
                onRunDiscovery={() => console.log('Running influencer discovery...')}
              />
              <TrigifyTrackerCard
                trackingCount={stats.trackingInfluencers}
                engagedLeadsCount={stats.engagedLeads}
                onOpenModal={() => handleOpenModal('trigify')}
              />
              <HypothesisLabCard
                activeHypothesesCount={stats.activeHypotheses}
                onOpenModal={() => handleOpenModal('hypothesis')}
                onNewHypothesis={() => {
                  handleOpenModal('hypothesis')
                }}
              />
              <ClayPipelineCard
                leadsInClayCount={stats.leadsInClay}
                readyForOutreachCount={stats.readyForOutreach}
                onOpenModal={() => handleOpenModal('clay')}
                onExport={() => console.log('Exporting leads...')}
              />
            </div>

            {/* Chat Panel */}
            <LeadDiscoveryChat
              messages={chatMessages}
              workflowContext={workflowContext}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          /* Lead Queue View */
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-lg font-semibold text-[#463939]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Lead Queue
                </h2>
                <p className="text-sm text-muted-foreground">
                  All leads from both pipelines in one view
                </p>
              </div>
              <Button
                onClick={() => handleOpenModal('clay')}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                Open Full Pipeline
              </Button>
            </div>

            {/* Simple Lead List */}
            <div className="space-y-3">
              {testClayLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium text-[#463939]">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.title} at {lead.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lead.source === 'influencer_engagement'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {lead.source === 'influencer_engagement' ? 'Influencer' : 'Hypothesis'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lead.status === 'ready_for_outreach'
                        ? 'bg-green-100 text-green-800'
                        : lead.status === 'responded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <InfluencerFinderModal
          open={influencerFinderOpen}
          onOpenChange={(open) => !open && handleCloseModal('influencer')}
          influencers={testInfluencers}
          onAddToTrigify={(id) => console.log('Adding to Trigify:', id)}
          onReview={(id) => console.log('Reviewing influencer:', id)}
          onReject={(id) => console.log('Rejecting influencer:', id)}
        />

        <TrigifyTrackerModal
          open={trigifyTrackerOpen}
          onOpenChange={(open) => !open && handleCloseModal('trigify')}
          influencers={testInfluencers}
          engagedPeople={testEngagedPeople}
          onPushToClay={(id) => console.log('Pushing to Clay:', id)}
          onViewInfluencer={(id) => console.log('Viewing influencer:', id)}
        />

        <HypothesisLabModal
          open={hypothesisLabOpen}
          onOpenChange={(open) => !open && handleCloseModal('hypothesis')}
          hypotheses={testHypotheses}
          onApprove={(id) => console.log('Approving hypothesis:', id)}
          onActivate={(id) => console.log('Activating hypothesis:', id)}
          onReject={(id) => console.log('Rejecting hypothesis:', id)}
          onViewLeads={(id) => {
            console.log('Viewing leads for hypothesis:', id)
            handleCloseModal('hypothesis')
            handleOpenModal('clay')
          }}
        />

        <ClayPipelineModal
          open={clayPipelineOpen}
          onOpenChange={(open) => !open && handleCloseModal('clay')}
          leads={testClayLeads}
          onStartOutreach={(id) => console.log('Starting outreach:', id)}
          onMarkResponded={(id) => console.log('Marking responded:', id)}
          onMarkQualified={(id) => console.log('Marking qualified:', id)}
        />
      </div>
    </div>
  )
}

// Simulated response generator for demo
function getSimulatedResponse(message: string, context: LeadWorkflowContext): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('influencer') || lowerMessage.includes('discover')) {
    return "Based on your ICP, I recommend prioritizing Sarah Chen and The CFO Playbook podcast. Sarah has a highly engaged LinkedIn following of finance decision-makers, and her audience directly matches our ICP. The CFO Playbook, while smaller, has exceptional engagement (8.5%) and reaches exactly the right decision-makers."
  }

  if (lowerMessage.includes('trigify') || lowerMessage.includes('track')) {
    return "Currently tracking 3 influencers in Trigify. We have 2 new high-intent engagements to review: David Park (CEO, TechNova) commented on Sarah Chen's cash flow post, and Ryan Chen (Founder, DataStack) engaged with Mike Rodriguez's YouTube content. Both show strong ICP match and buying intent."
  }

  if (lowerMessage.includes('hypothesis') || lowerMessage.includes('lead source')) {
    return "Your best-performing hypothesis is 'Recently Funded SaaS Startups' with 23 leads generated and a 78% confidence score. I recommend activating the 'Companies Searching for Fractional CFO' hypothesis next - it has a 92% confidence score and targets high-intent buyers actively looking for solutions."
  }

  if (lowerMessage.includes('clay') || lowerMessage.includes('outreach') || lowerMessage.includes('pipeline')) {
    return "You have 5 leads in your Clay pipeline: 1 ready for outreach (Amanda Foster), 1 in active outreach (Ryan Chen), and 1 who responded (Jennifer Wong). Jennifer responded positively to the initial email - I recommend scheduling a discovery call within 24 hours while interest is high."
  }

  return `I can help with your ${context === 'dashboard' ? 'lead discovery strategy' : context.replace(/_/g, ' ')}. Ask me about finding new influencers, tracking engagements, generating lead hypotheses, or managing your Clay pipeline. What would you like to explore?`
}
