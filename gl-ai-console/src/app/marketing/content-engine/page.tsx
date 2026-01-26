"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  FileText,
  RefreshCw,
  TrendingUp,
  PenTool,
  Library,
  LayoutGrid,
  ArrowRight,
  FileCheck,
} from "lucide-react"

// Components
import { TopicRadarCard } from "@/components/marketing/topic-radar-card"
import { BriefBuilderCard } from "@/components/marketing/brief-builder-card"
import { RepurposeFactoryCard } from "@/components/marketing/repurpose-factory-card"
import { RefreshFinderCard } from "@/components/marketing/refresh-finder-card"
import { TopicRadarModal } from "@/components/marketing/topic-radar-modal"
import { BriefBuilderModal } from "@/components/marketing/brief-builder-modal"
import { RepurposeModal } from "@/components/marketing/repurpose-modal"
import { RefreshModal } from "@/components/marketing/refresh-modal"
import { ContentLibrary } from "@/components/marketing/content-library"
import { ContentChat } from "@/components/marketing/content-chat"
import { FinalDraftsSection } from "@/components/marketing/final-drafts-section"

// Test Data (for static content)
import {
  testContentLibrary,
  testRepurposeItems,
  testRefreshRecommendations,
  testChatMessages,
  getDashboardStats,
} from "@/lib/marketing-content-data"

// localStorage Store
import {
  getTopicIdeas,
  saveTopicIdeas,
  removeTopicIdea,
  updateTopicIdea,
  generateTopicIdeasForCategory,
  getBriefs,
  saveBriefs,
  addBrief,
  updateBrief,
  removeBrief,
  getBriefById,
  getFinalDrafts,
  addFinalDraft,
  updateFinalDraft,
  createBriefFromTopicIdea,
  createFinalDraftFromBrief,
  getMarketingStats,
} from "@/lib/marketing-content-store"

import {
  WorkflowContext,
  ChatMessage,
  TopicCategory,
  TopicIdea,
  ContentBrief,
  FinalDraft,
} from "@/lib/marketing-content-types"

type ViewMode = 'workflows' | 'library' | 'final_drafts'

export default function ContentEnginePage() {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('workflows')
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext>('dashboard')

  // Modal states
  const [topicRadarOpen, setTopicRadarOpen] = useState(false)
  const [briefBuilderOpen, setBriefBuilderOpen] = useState(false)
  const [repurposeOpen, setRepurposeOpen] = useState(false)
  const [refreshOpen, setRefreshOpen] = useState(false)

  // Data states (from localStorage)
  const [topicIdeas, setTopicIdeas] = useState<TopicIdea[]>([])
  const [briefs, setBriefs] = useState<ContentBrief[]>([])
  const [finalDrafts, setFinalDrafts] = useState<FinalDraft[]>([])

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysisCategory, setLastAnalysisCategory] = useState<TopicCategory | null>(null)

  // Brief builder state
  const [initialBriefId, setInitialBriefId] = useState<string | null>(null)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(testChatMessages)

  // Load data from localStorage on mount
  useEffect(() => {
    setTopicIdeas(getTopicIdeas())
    setBriefs(getBriefs())
    setFinalDrafts(getFinalDrafts())
  }, [])

  // Get stats - combine localStorage with static test data
  const staticStats = getDashboardStats()
  const localStats = getMarketingStats()
  const finalDraftsReady = finalDrafts.filter(d => !d.publishedAt).length

  // Handlers
  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, newMessage])

    // Simulate assistant response
    setTimeout(() => {
      const response: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: getSimulatedResponse(message, workflowContext),
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, response])
    }, 1000)
  }

  const handleOpenModal = (modal: 'topic' | 'brief' | 'repurpose' | 'refresh') => {
    switch (modal) {
      case 'topic':
        setTopicRadarOpen(true)
        setWorkflowContext('topic_radar')
        break
      case 'brief':
        setInitialBriefId(null)
        setBriefBuilderOpen(true)
        setWorkflowContext('brief_builder')
        break
      case 'repurpose':
        setRepurposeOpen(true)
        setWorkflowContext('repurpose')
        break
      case 'refresh':
        setRefreshOpen(true)
        setWorkflowContext('refresh')
        break
    }
  }

  const handleCloseModal = (modal: 'topic' | 'brief' | 'repurpose' | 'refresh') => {
    switch (modal) {
      case 'topic':
        setTopicRadarOpen(false)
        break
      case 'brief':
        setBriefBuilderOpen(false)
        setInitialBriefId(null)
        break
      case 'repurpose':
        setRepurposeOpen(false)
        break
      case 'refresh':
        setRefreshOpen(false)
        break
    }
    setWorkflowContext('dashboard')
  }

  const handleRunAnalysis = (category: TopicCategory) => {
    console.log('Running topic analysis for category:', category)

    // Open modal first and show loading state
    setTopicRadarOpen(true)
    setWorkflowContext('topic_radar')
    setIsAnalyzing(true)
    setLastAnalysisCategory(category)

    // Simulate analysis delay, then generate ideas
    setTimeout(() => {
      const newIdeas = generateTopicIdeasForCategory(category)

      // Add to existing ideas (don't replace)
      const currentIdeas = getTopicIdeas()
      const allIdeas = [...currentIdeas, ...newIdeas]
      saveTopicIdeas(allIdeas)
      setTopicIdeas(allIdeas)

      setIsAnalyzing(false)
    }, 2500)
  }

  const handleApproveIdea = (ideaId: string) => {
    console.log('Approving idea:', ideaId)

    // Get the idea
    const idea = topicIdeas.find(i => i.id === ideaId)
    if (!idea) return

    // Create a brief from this idea
    const newBrief = createBriefFromTopicIdea(idea)
    const updatedBriefs = addBrief(newBrief)
    setBriefs(updatedBriefs)

    // Remove from topic ideas
    const updatedIdeas = removeTopicIdea(ideaId)
    setTopicIdeas(updatedIdeas)
  }

  const handleRejectIdea = (ideaId: string) => {
    console.log('Rejecting idea:', ideaId)

    // Simply remove from the list
    const updatedIdeas = removeTopicIdea(ideaId)
    setTopicIdeas(updatedIdeas)
  }

  const handleCreateBriefFromIdea = (ideaId: string) => {
    console.log('Creating brief from idea:', ideaId)

    // This is called when user clicks "Create Brief" on an approved idea
    // The idea should already be in briefs, so just open the modal
    const idea = topicIdeas.find(i => i.id === ideaId)
    if (idea) {
      // Create brief from idea and remove from topic ideas
      const newBrief = createBriefFromTopicIdea(idea)
      const updatedBriefs = addBrief(newBrief)
      setBriefs(updatedBriefs)

      const updatedIdeas = removeTopicIdea(ideaId)
      setTopicIdeas(updatedIdeas)

      // Open brief builder with this brief
      setInitialBriefId(newBrief.id)
    }

    // Close topic radar, open brief builder
    setTopicRadarOpen(false)
    setBriefBuilderOpen(true)
    setWorkflowContext('brief_builder')
  }

  const handleSaveBrief = (brief: ContentBrief) => {
    console.log('Saving brief:', brief.id)

    // Check if brief exists
    const existing = briefs.find(b => b.id === brief.id)
    if (existing) {
      const updatedBriefs = updateBrief(brief.id, brief)
      setBriefs(updatedBriefs)
    } else {
      const updatedBriefs = addBrief(brief)
      setBriefs(updatedBriefs)
    }
  }

  const handleApproveFinalDraft = (briefId: string) => {
    console.log('Approving final draft for brief:', briefId)

    // Get the brief
    const brief = briefs.find(b => b.id === briefId)
    if (!brief) return

    // Create final draft
    const authorName = brief.assignedTo || 'Unknown Author'
    const newFinalDraft = createFinalDraftFromBrief(brief, authorName)
    const updatedFinalDrafts = addFinalDraft(newFinalDraft)
    setFinalDrafts(updatedFinalDrafts)

    // Update brief status
    const updatedBriefs = updateBrief(briefId, { status: 'completed', currentStep: 'published' })
    setBriefs(updatedBriefs)
  }

  const handlePublishDraft = (draftId: string) => {
    console.log('Publishing draft:', draftId)

    // Update final draft with published date
    const updatedFinalDrafts = updateFinalDraft(draftId, {
      publishedAt: new Date().toISOString().split('T')[0],
    })
    setFinalDrafts(updatedFinalDrafts)
  }

  // Get approved ideas for brief builder (status === 'approved')
  const approvedTopicIdeas = topicIdeas.filter(i => i.status === 'approved')

  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#407B9D]/10 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-[#407B9D]" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Content Engine
              </h1>
              <p
                className="text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                AI-powered content creation, repurposing, and optimization
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
              variant={viewMode === 'final_drafts' ? 'default' : 'ghost'}
              onClick={() => {
                setViewMode('final_drafts')
                setWorkflowContext('dashboard')
              }}
              className={viewMode === 'final_drafts' ? 'bg-[#407B9D]' : ''}
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Final Drafts
              {finalDraftsReady > 0 && (
                <span className="ml-1 text-xs bg-[#C8E4BB] text-[#463939] px-1.5 py-0.5 rounded-full">
                  {finalDraftsReady}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'library' ? 'default' : 'ghost'}
              onClick={() => {
                setViewMode('library')
                setWorkflowContext('library')
              }}
              className={viewMode === 'library' ? 'bg-[#407B9D]' : ''}
            >
              <Library className="w-4 h-4 mr-2" />
              Library
              <span className="ml-1 text-xs opacity-70">({staticStats.totalContent})</span>
            </Button>
          </div>
        </div>

        {/* Content Lifecycle Pipeline (only on workflows view) */}
        {viewMode === 'workflows' && (
          <div className="mb-8 p-4 bg-white rounded-xl border shadow-sm">
            <p
              className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Content Lifecycle
            </p>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {[
                { icon: Lightbulb, label: 'Ideate', color: '#407B9D', action: () => handleOpenModal('topic') },
                { icon: FileText, label: 'Brief', color: '#95CBD7', action: () => handleOpenModal('brief') },
                { icon: PenTool, label: 'Create', color: '#C8E4BB', action: () => {} },
                { icon: RefreshCw, label: 'Repurpose', color: '#C8E4BB', action: () => handleOpenModal('repurpose') },
                { icon: TrendingUp, label: 'Refresh', color: '#F59E0B', action: () => handleOpenModal('refresh') },
              ].map((step, index, arr) => (
                <div key={step.label} className="flex items-center">
                  <button
                    onClick={step.action}
                    className="flex flex-col items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <step.icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <span
                      className="text-sm font-medium text-[#463939]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {step.label}
                    </span>
                  </button>
                  {index < arr.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-slate-300 mx-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'workflows' ? (
          <>
            {/* Workflow Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TopicRadarCard
                newIdeasCount={topicIdeas.filter(i => i.status === 'new').length}
                onOpenModal={() => handleOpenModal('topic')}
                onRunAnalysis={handleRunAnalysis}
              />
              <BriefBuilderCard
                briefsInProgressCount={briefs.filter(b => b.status !== 'completed').length}
                onOpenModal={() => handleOpenModal('brief')}
                onCreateBrief={() => {
                  handleOpenModal('brief')
                }}
              />
              <RepurposeFactoryCard
                readyToRepurposeCount={staticStats.readyToRepurpose}
                onOpenModal={() => handleOpenModal('repurpose')}
              />
              <RefreshFinderCard
                needsRefreshCount={staticStats.needsRefresh}
                onOpenModal={() => handleOpenModal('refresh')}
                onRunAnalysis={() => console.log('Running refresh analysis...')}
              />
            </div>

            {/* Chat Panel */}
            <ContentChat
              messages={chatMessages}
              workflowContext={workflowContext}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : viewMode === 'final_drafts' ? (
          /* Final Drafts View */
          <FinalDraftsSection
            drafts={finalDrafts}
            onPublish={handlePublishDraft}
            onViewDraft={(draftId) => console.log('Viewing draft:', draftId)}
          />
        ) : (
          /* Content Library View */
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <ContentLibrary content={testContentLibrary} />
          </div>
        )}

        {/* Modals */}
        <TopicRadarModal
          open={topicRadarOpen}
          onOpenChange={(open) => !open && handleCloseModal('topic')}
          ideas={topicIdeas}
          isLoading={isAnalyzing}
          lastAnalysisCategory={lastAnalysisCategory}
          onCreateBrief={handleCreateBriefFromIdea}
          onApproveIdea={handleApproveIdea}
          onRejectIdea={handleRejectIdea}
        />

        <BriefBuilderModal
          open={briefBuilderOpen}
          onOpenChange={(open) => !open && handleCloseModal('brief')}
          briefs={briefs}
          approvedTopicIdeas={approvedTopicIdeas}
          onSaveBrief={handleSaveBrief}
          onEditBrief={(briefId) => console.log('Editing brief:', briefId)}
          onViewBrief={(briefId) => console.log('Viewing brief:', briefId)}
          onCreateNew={() => console.log('Creating new brief')}
          onCreateFromIdea={(ideaId) => {
            // Remove from approved ideas when creating a brief
            const updatedIdeas = removeTopicIdea(ideaId)
            setTopicIdeas(updatedIdeas)
          }}
          onApproveFinalDraft={handleApproveFinalDraft}
          initialBriefId={initialBriefId}
        />

        <RepurposeModal
          open={repurposeOpen}
          onOpenChange={(open) => !open && handleCloseModal('repurpose')}
          items={testRepurposeItems}
          onRepurpose={(itemId, format) =>
            console.log('Repurposing item:', itemId, 'to format:', format)
          }
        />

        <RefreshModal
          open={refreshOpen}
          onOpenChange={(open) => !open && handleCloseModal('refresh')}
          recommendations={testRefreshRecommendations}
          onStartRefresh={(recId) => console.log('Starting refresh:', recId)}
          onDismiss={(recId) => console.log('Dismissing:', recId)}
        />
      </div>
    </div>
  )
}

// Simulated response generator for demo
function getSimulatedResponse(message: string, context: WorkflowContext): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('gap') || lowerMessage.includes('idea')) {
    return "Based on your content library, I see a significant opportunity around \"Fractional CFO vs Full-Time CFO\" comparisons. This topic has high search volume and your competitors rank well for it. Your existing \"5 Signs You Need a Fractional CFO\" blog provides a good foundation, but a direct cost comparison piece would capture users at a different stage of their decision journey."
  }

  if (lowerMessage.includes('brief') || lowerMessage.includes('outline')) {
    return "I can help you create a content brief. For best results, tell me: 1) The topic or title, 2) The target format (blog, video, LinkedIn post), and 3) Any specific keywords you want to target. I will generate an outline with sections, talking points, and SEO recommendations."
  }

  if (lowerMessage.includes('repurpose') || lowerMessage.includes('transform')) {
    return "Your 13-Week Cash Flow blog would be excellent for repurposing. I recommend: 1) A LinkedIn carousel showing the key steps visually, 2) A short YouTube explainer (3-5 min), and 3) An email sequence for nurturing leads. Each format reaches different audience segments."
  }

  if (lowerMessage.includes('refresh') || lowerMessage.includes('update')) {
    return "I have identified 2 high-priority pieces needing refresh: \"5 Signs You Need a Fractional CFO\" (ranking dropped from #8 to #15) and \"Tax Planning Strategies\" (needs 2025 updates). Both could benefit from updated statistics, new internal links, and refreshed meta descriptions."
  }

  return `I am here to help with your ${context === 'dashboard' ? 'content strategy' : context.replace('_', ' ')}. You can ask me about content gaps, brief creation, repurposing opportunities, or which content needs refreshing. What would you like to explore?`
}
