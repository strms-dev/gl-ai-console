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
import { FinalDraftsSection } from "@/components/marketing/final-drafts-section"

// Test Data (for static content)
import {
  testContentLibrary,
  testRepurposeItems,
  testRefreshRecommendations,
  getDashboardStats,
} from "@/lib/marketing-content-data"

// localStorage Store
import {
  getTopicIdeas,
  saveTopicIdeas,
  removeTopicIdea,
  updateTopicIdea,
  generateTopicIdeasForCategory,
  getApprovedIdeas,
  addApprovedIdea,
  removeApprovedIdea,
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
  const [approvedIdeas, setApprovedIdeas] = useState<TopicIdea[]>([])
  const [briefs, setBriefs] = useState<ContentBrief[]>([])
  const [finalDrafts, setFinalDrafts] = useState<FinalDraft[]>([])

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysisCategory, setLastAnalysisCategory] = useState<TopicCategory | null>(null)

  // Brief builder state
  const [initialBriefId, setInitialBriefId] = useState<string | null>(null)

  // Repurpose modal state
  const [repurposeInitialView, setRepurposeInitialView] = useState<'list' | 'workflow'>('list')
  const [repurposeInProgressCount, setRepurposeInProgressCount] = useState(0)

  // Refresh modal state
  const [triggerRefreshReport, setTriggerRefreshReport] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    setTopicIdeas(getTopicIdeas())
    setApprovedIdeas(getApprovedIdeas())
    setBriefs(getBriefs())
    setFinalDrafts(getFinalDrafts())
  }, [])

  // Get stats - combine localStorage with static test data
  const staticStats = getDashboardStats()
  const localStats = getMarketingStats()
  const finalDraftsReady = finalDrafts.filter(d => !d.publishedAt).length

  // Handlers
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
        setRepurposeInitialView('list')
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

    // Get the idea from topicIdeas
    const idea = topicIdeas.find(i => i.id === ideaId)
    if (!idea) return

    // Move idea from Topic Radar to Approved Ideas list
    // 1. Add to approved ideas (stores with status 'approved')
    const updatedApproved = addApprovedIdea(idea)
    setApprovedIdeas(updatedApproved)

    // 2. Remove from topic radar ideas
    const updatedTopicIdeas = removeTopicIdea(ideaId)
    setTopicIdeas(updatedTopicIdeas)
  }

  const handleRejectIdea = (ideaId: string) => {
    console.log('Rejecting idea:', ideaId)

    // Simply remove from the list
    const updatedIdeas = removeTopicIdea(ideaId)
    setTopicIdeas(updatedIdeas)
  }

  const handleCreateBriefFromIdea = (ideaId: string) => {
    console.log('Creating brief from idea:', ideaId)

    // This is called when user clicks "Create Brief" on an approved idea in Topic Radar
    // Look for the idea in approved ideas list (primary) or topic ideas (fallback)
    let idea = approvedIdeas.find(i => i.id === ideaId)
    if (!idea) {
      idea = topicIdeas.find(i => i.id === ideaId)
    }

    if (idea) {
      // Create brief from idea
      const newBrief = createBriefFromTopicIdea(idea)
      const updatedBriefs = addBrief(newBrief)
      setBriefs(updatedBriefs)

      // Remove from approved ideas (primary storage for approved)
      const updatedApproved = removeApprovedIdea(ideaId)
      setApprovedIdeas(updatedApproved)

      // Also try to remove from topic ideas (in case it was there)
      const updatedTopicIdeas = removeTopicIdea(ideaId)
      setTopicIdeas(updatedTopicIdeas)

      // Open brief builder with this brief
      setInitialBriefId(newBrief.id)
    }

    // Close topic radar, open brief builder
    setTopicRadarOpen(false)
    setBriefBuilderOpen(true)
    setWorkflowContext('brief_builder')
  }

  const handleSaveBrief = (brief: ContentBrief) => {
    console.log('Saving brief:', brief.id, 'status:', brief.status)

    // Always use addBrief which now handles duplicates safely
    // This prevents race conditions between state and localStorage
    const updatedBriefs = addBrief(brief)
    setBriefs(updatedBriefs)
  }

  const handleApproveFinalDraft = (briefId: string) => {
    console.log('Approving final draft for brief:', briefId)

    // Get the brief from localStorage (more reliable than React state during async updates)
    const brief = getBriefById(briefId)
    if (!brief) {
      // Fallback to React state if not in localStorage yet
      const stateBrief = briefs.find(b => b.id === briefId)
      if (!stateBrief) {
        console.error('Brief not found:', briefId)
        return
      }
      // Create final draft from state brief
      const authorName = stateBrief.assignedTo || 'Unknown Author'
      const newFinalDraft = createFinalDraftFromBrief(stateBrief, authorName)
      const updatedFinalDrafts = addFinalDraft(newFinalDraft)
      setFinalDrafts(updatedFinalDrafts)
    } else {
      // Create final draft from localStorage brief
      const authorName = brief.assignedTo || 'Unknown Author'
      const newFinalDraft = createFinalDraftFromBrief(brief, authorName)
      const updatedFinalDrafts = addFinalDraft(newFinalDraft)
      setFinalDrafts(updatedFinalDrafts)
    }

    // Refresh briefs from localStorage to ensure sync
    setBriefs(getBriefs())
  }

  const handlePublishDraft = (draftId: string) => {
    console.log('Publishing draft:', draftId)

    // Update final draft with published date
    const updatedFinalDrafts = updateFinalDraft(draftId, {
      publishedAt: new Date().toISOString().split('T')[0],
    })
    setFinalDrafts(updatedFinalDrafts)
  }

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
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center bg-gradient-to-r from-slate-50 to-white rounded-full border border-slate-200/80 shadow-sm px-2 py-1.5">
              {[
                { icon: Lightbulb, label: 'Ideate', color: '#407B9D', bgColor: 'bg-[#407B9D]/10', action: () => handleOpenModal('topic') },
                { icon: FileText, label: 'Brief', color: '#407B9D', bgColor: 'bg-[#95CBD7]/20', action: () => handleOpenModal('brief') },
                { icon: RefreshCw, label: 'Repurpose', color: '#407B9D', bgColor: 'bg-[#C8E4BB]/30', action: () => handleOpenModal('repurpose') },
                { icon: TrendingUp, label: 'Refresh', color: '#407B9D', bgColor: 'bg-amber-100', action: () => handleOpenModal('refresh') },
              ].map((step, index, arr) => (
                <div key={step.label} className="flex items-center">
                  <button
                    onClick={step.action}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[#407B9D]/10 transition-all duration-200 group"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step.bgColor} transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm`}>
                      <step.icon className="w-3.5 h-3.5 text-[#407B9D]" />
                    </div>
                    <span
                      className="text-sm font-medium text-slate-600 group-hover:text-[#407B9D] transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {step.label}
                    </span>
                  </button>
                  {index < arr.length - 1 && (
                    <div className="flex items-center mx-1">
                      <div className="w-4 h-px bg-gradient-to-r from-slate-300 to-slate-200" />
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                    </div>
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
                inProgressCount={repurposeInProgressCount}
                onOpenModal={() => handleOpenModal('repurpose')}
                onStartRepurposing={() => {
                  setRepurposeInitialView('workflow')
                  setRepurposeOpen(true)
                  setWorkflowContext('repurpose')
                }}
              />
              <RefreshFinderCard
                needsRefreshCount={staticStats.needsRefresh}
                onOpenModal={() => handleOpenModal('refresh')}
                onRunAnalysis={() => {
                  setTriggerRefreshReport(true)
                  handleOpenModal('refresh')
                }}
              />
            </div>
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
          approvedTopicIdeas={approvedIdeas}
          onSaveBrief={handleSaveBrief}
          onEditBrief={(briefId) => console.log('Editing brief:', briefId)}
          onViewBrief={(briefId) => console.log('Viewing brief:', briefId)}
          onCreateNew={() => console.log('Creating new brief')}
          onCreateFromIdea={(ideaId) => {
            // Remove from approved ideas when creating a brief
            const updatedApproved = removeApprovedIdea(ideaId)
            setApprovedIdeas(updatedApproved)
          }}
          onApproveFinalDraft={handleApproveFinalDraft}
          onNavigateToFinalDrafts={() => {
            // Switch to Final Drafts view after approving
            setViewMode('final_drafts')
            setWorkflowContext('dashboard')
          }}
          initialBriefId={initialBriefId}
        />

        <RepurposeModal
          open={repurposeOpen}
          onOpenChange={(open) => !open && handleCloseModal('repurpose')}
          items={[]}
          libraryContent={testContentLibrary}
          readyToRepurpose={finalDrafts.filter(d => d.publishedAt)}
          onRepurpose={(itemId, format) =>
            console.log('Repurposing item:', itemId, 'to format:', format)
          }
          onInProgressCountChange={setRepurposeInProgressCount}
          initialView={repurposeInitialView}
        />

        <RefreshModal
          open={refreshOpen}
          onOpenChange={(open) => !open && handleCloseModal('refresh')}
          recommendations={testRefreshRecommendations}
          onStartRefresh={(recId) => console.log('Starting refresh:', recId)}
          onDismiss={(recId) => console.log('Dismissing:', recId)}
          triggerReport={triggerRefreshReport}
          onReportTriggered={() => setTriggerRefreshReport(false)}
        />
      </div>
    </div>
  )
}
