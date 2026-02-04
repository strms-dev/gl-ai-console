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

// Test Data (for static content - repurpose items only)
import {
  testRepurposeItems,
  getDashboardStats,
} from "@/lib/marketing-content-data"

// Supabase
import {
  fetchContentLibraryForUI,
  fetchNewTopicIdeas,
  fetchApprovedTopicIdeas,
  addTopicIdeasToSupabase,
  approveTopicIdeaInSupabase,
  rejectTopicIdeaInSupabase,
  removeTopicIdeaFromSupabase,
  markTopicIdeaInProgress,
  fetchBriefsForUI,
  fetchBriefByIdForUI,
  saveBriefToSupabase,
  fetchFinalDraftsForUI,
  addFinalDraftToSupabase,
  publishFinalDraftInSupabase,
  fetchPendingRefreshRecommendations,
  startRefreshInSupabase,
  dismissRefreshInSupabase,
} from "@/lib/supabase/marketing-content"

// localStorage Store (utility functions only)
import {
  generateTopicIdeasForCategory,
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
  ContentItem,
  RefreshRecommendation,
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

  // Data states (from Supabase)
  const [topicIdeas, setTopicIdeas] = useState<TopicIdea[]>([])
  const [approvedIdeas, setApprovedIdeas] = useState<TopicIdea[]>([])
  const [briefs, setBriefs] = useState<ContentBrief[]>([])
  const [finalDrafts, setFinalDrafts] = useState<FinalDraft[]>([])
  const [refreshRecommendations, setRefreshRecommendations] = useState<RefreshRecommendation[]>([])

  // Content Library state (from Supabase)
  const [contentLibrary, setContentLibrary] = useState<ContentItem[]>([])
  const [contentLibraryLoading, setContentLibraryLoading] = useState(false)

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

  // Load all data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [newIdeas, approved, briefsData, draftsData, refreshData] = await Promise.all([
          fetchNewTopicIdeas(),
          fetchApprovedTopicIdeas(),
          fetchBriefsForUI(),
          fetchFinalDraftsForUI(),
          fetchPendingRefreshRecommendations(),
        ])
        setTopicIdeas(newIdeas)
        setApprovedIdeas(approved)
        setBriefs(briefsData)
        setFinalDrafts(draftsData)
        setRefreshRecommendations(refreshData)
      } catch (error) {
        console.error('Failed to load data from Supabase:', error)
      }
    }
    loadData()
  }, [])

  // Load content library from Supabase
  useEffect(() => {
    const loadContentLibrary = async () => {
      setContentLibraryLoading(true)
      try {
        const content = await fetchContentLibraryForUI()
        setContentLibrary(content)
      } catch (error) {
        console.error('Failed to load content library:', error)
      } finally {
        setContentLibraryLoading(false)
      }
    }
    loadContentLibrary()
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

  const handleRunAnalysis = async (category: TopicCategory) => {
    console.log('Running topic analysis for category:', category)

    // Open modal first and show loading state
    setTopicRadarOpen(true)
    setWorkflowContext('topic_radar')
    setIsAnalyzing(true)
    setLastAnalysisCategory(category)

    // Simulate analysis delay (this will be replaced by n8n webhook later)
    setTimeout(async () => {
      try {
        // Generate ideas locally (will be replaced by AI generation via n8n)
        const newIdeas = generateTopicIdeasForCategory(category)

        // Save to Supabase and update state
        const savedIdeas = await addTopicIdeasToSupabase(newIdeas)
        setTopicIdeas(prev => [...prev, ...savedIdeas])
      } catch (error) {
        console.error('Failed to save topic ideas:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }, 2500)
  }

  const handleApproveIdea = async (ideaId: string) => {
    console.log('Approving idea:', ideaId)

    // Get the idea from topicIdeas
    const idea = topicIdeas.find(i => i.id === ideaId)
    if (!idea) return

    try {
      // Update status in Supabase
      await approveTopicIdeaInSupabase(ideaId)

      // Update local state - move from topicIdeas to approvedIdeas
      setTopicIdeas(prev => prev.filter(i => i.id !== ideaId))
      setApprovedIdeas(prev => [...prev, { ...idea, status: 'approved' }])
    } catch (error) {
      console.error('Failed to approve idea:', error)
    }
  }

  const handleRejectIdea = async (ideaId: string) => {
    console.log('Rejecting idea:', ideaId)

    try {
      // Update status in Supabase (soft delete)
      await rejectTopicIdeaInSupabase(ideaId)

      // Remove from local state
      setTopicIdeas(prev => prev.filter(i => i.id !== ideaId))
    } catch (error) {
      console.error('Failed to reject idea:', error)
    }
  }

  const handleCreateBriefFromIdea = async (ideaId: string) => {
    console.log('Creating brief from idea:', ideaId)

    // This is called when user clicks "Create Brief" on an approved idea in Topic Radar
    // Look for the idea in approved ideas list (primary) or topic ideas (fallback)
    let idea = approvedIdeas.find(i => i.id === ideaId)
    if (!idea) {
      idea = topicIdeas.find(i => i.id === ideaId)
    }

    if (idea) {
      try {
        // Mark topic idea as in_progress in Supabase
        await markTopicIdeaInProgress(ideaId)

        // Create brief from idea and save to Supabase
        const newBrief = createBriefFromTopicIdea(idea)
        const savedBrief = await saveBriefToSupabase(newBrief)
        setBriefs(prev => [...prev, savedBrief])

        // Remove from local state
        setApprovedIdeas(prev => prev.filter(i => i.id !== ideaId))
        setTopicIdeas(prev => prev.filter(i => i.id !== ideaId))

        // Open brief builder with this brief
        setInitialBriefId(savedBrief.id)
      } catch (error) {
        console.error('Failed to create brief from idea:', error)
      }
    }

    // Close topic radar, open brief builder
    setTopicRadarOpen(false)
    setBriefBuilderOpen(true)
    setWorkflowContext('brief_builder')
  }

  const handleSaveBrief = async (brief: ContentBrief) => {
    console.log('Saving brief:', brief.id, 'status:', brief.status)

    try {
      // Save to Supabase (handles create/update)
      const savedBrief = await saveBriefToSupabase(brief)

      // Update local state
      setBriefs(prev => {
        const existingIndex = prev.findIndex(b => b.id === savedBrief.id)
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev]
          updated[existingIndex] = savedBrief
          return updated
        } else {
          // Add new
          return [...prev, savedBrief]
        }
      })
    } catch (error) {
      console.error('Failed to save brief:', error)
    }
  }

  const handleApproveFinalDraft = async (briefId: string) => {
    console.log('Approving final draft for brief:', briefId)

    try {
      // Try to get brief from Supabase first
      let brief = await fetchBriefByIdForUI(briefId)

      // Fallback to React state if not found in Supabase
      if (!brief) {
        brief = briefs.find(b => b.id === briefId) || null
      }

      if (!brief) {
        console.error('Brief not found:', briefId)
        return
      }

      // Create final draft from brief using utility function
      const authorName = brief.assignedTo || 'Unknown Author'
      const newFinalDraft = createFinalDraftFromBrief(brief, authorName)

      // Save to Supabase
      const savedDraft = await addFinalDraftToSupabase(newFinalDraft)
      setFinalDrafts(prev => [...prev, savedDraft])

      // Refresh briefs from Supabase to ensure sync
      const refreshedBriefs = await fetchBriefsForUI()
      setBriefs(refreshedBriefs)
    } catch (error) {
      console.error('Failed to approve final draft:', error)
    }
  }

  const handlePublishDraft = async (draftId: string) => {
    console.log('Publishing draft:', draftId)

    try {
      // Update final draft with published date in Supabase
      const publishedDraft = await publishFinalDraftInSupabase(draftId)

      // Update local state
      setFinalDrafts(prev =>
        prev.map(d => d.id === draftId ? publishedDraft : d)
      )
    } catch (error) {
      console.error('Failed to publish draft:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9F9] to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header - Enhanced with gradient icon and better spacing */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#407B9D] to-[#407B9D]/80 flex items-center justify-center shadow-lg shadow-[#407B9D]/20">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-[#463939] tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Content Engine
              </h1>
              <p
                className="text-muted-foreground text-sm"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                AI-powered content creation, repurposing, and optimization
              </p>
            </div>
          </div>

          {/* View Toggle - Enhanced with better visual feedback */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
            <Button
              size="sm"
              variant={viewMode === 'workflows' ? 'default' : 'ghost'}
              onClick={() => {
                setViewMode('workflows')
                setWorkflowContext('dashboard')
              }}
              className={`rounded-lg transition-all ${viewMode === 'workflows' ? 'bg-[#407B9D] shadow-sm' : 'hover:bg-slate-50'}`}
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
              className={`rounded-lg transition-all ${viewMode === 'final_drafts' ? 'bg-[#407B9D] shadow-sm' : 'hover:bg-slate-50'}`}
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Final Drafts
              {finalDraftsReady > 0 && (
                <span className="ml-1.5 text-xs bg-[#C8E4BB] text-[#463939] px-2 py-0.5 rounded-full font-medium">
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
              className={`rounded-lg transition-all ${viewMode === 'library' ? 'bg-[#407B9D] shadow-sm' : 'hover:bg-slate-50'}`}
            >
              <Library className="w-4 h-4 mr-2" />
              Library
              <span className="ml-1.5 text-xs opacity-60 font-medium">({contentLibrary.length})</span>
            </Button>
          </div>
        </div>

        {/* Content Lifecycle Pipeline - Enhanced with better visual hierarchy */}
        {viewMode === 'workflows' && (
          <div className="mb-8 flex items-center justify-center">
            <div className="inline-flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 gap-1">
              {[
                { icon: Lightbulb, label: 'Ideate', sublabel: 'Topic Radar', bgColor: 'bg-[#407B9D]/10', hoverBg: 'hover:bg-[#407B9D]/15', action: () => handleOpenModal('topic') },
                { icon: FileText, label: 'Brief', sublabel: 'Brief Builder', bgColor: 'bg-[#95CBD7]/20', hoverBg: 'hover:bg-[#95CBD7]/30', action: () => handleOpenModal('brief') },
                { icon: RefreshCw, label: 'Repurpose', sublabel: 'Multi-format', bgColor: 'bg-[#C8E4BB]/30', hoverBg: 'hover:bg-[#C8E4BB]/40', action: () => handleOpenModal('repurpose') },
                { icon: TrendingUp, label: 'Refresh', sublabel: 'Optimization', bgColor: 'bg-amber-50', hoverBg: 'hover:bg-amber-100', action: () => handleOpenModal('refresh') },
              ].map((step, index, arr) => (
                <div key={step.label} className="flex items-center">
                  <button
                    onClick={step.action}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl ${step.hoverBg} transition-all duration-200 group`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${step.bgColor} transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm`}>
                      <step.icon className="w-4 h-4 text-[#407B9D]" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p
                        className="text-sm font-medium text-[#463939] group-hover:text-[#407B9D] transition-colors"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {step.label}
                      </p>
                      <p
                        className="text-xs text-[#999999]"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {step.sublabel}
                      </p>
                    </div>
                  </button>
                  {index < arr.length - 1 && (
                    <div className="flex items-center mx-2">
                      <ArrowRight className="w-4 h-4 text-slate-300" />
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
                needsRefreshCount={refreshRecommendations.length}
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
            {contentLibraryLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#407B9D]" />
                  <span className="text-muted-foreground">Loading content library...</span>
                </div>
              </div>
            ) : (
              <ContentLibrary content={contentLibrary} />
            )}
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
          onCreateFromIdea={async (ideaId) => {
            // Mark topic idea as in_progress in Supabase and remove from local state
            try {
              await markTopicIdeaInProgress(ideaId)
              setApprovedIdeas(prev => prev.filter(i => i.id !== ideaId))
            } catch (error) {
              console.error('Failed to update topic idea:', error)
            }
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
          libraryContent={contentLibrary}
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
          recommendations={refreshRecommendations}
          onStartRefresh={async (recId) => {
            console.log('Starting refresh:', recId)
            try {
              const updated = await startRefreshInSupabase(recId)
              setRefreshRecommendations(prev =>
                prev.map(r => r.id === recId ? updated : r)
              )
            } catch (error) {
              console.error('Failed to start refresh:', error)
            }
          }}
          onDismiss={async (recId) => {
            console.log('Dismissing:', recId)
            try {
              await dismissRefreshInSupabase(recId)
              setRefreshRecommendations(prev =>
                prev.filter(r => r.id !== recId)
              )
            } catch (error) {
              console.error('Failed to dismiss refresh:', error)
            }
          }}
          triggerReport={triggerRefreshReport}
          onReportTriggered={() => setTriggerRefreshReport(false)}
        />
      </div>
    </div>
  )
}
