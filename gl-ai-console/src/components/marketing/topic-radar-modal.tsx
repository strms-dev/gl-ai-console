"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, Sparkles, ExternalLink, Search, Users, TrendingUp, Filter, Loader2, CheckCircle, X } from "lucide-react"
import {
  TopicIdea,
  TopicCategory,
  topicIdeaStatusLabels,
  topicIdeaStatusColors,
  topicCategoryLabels,
  topicCategoryColors,
  contentTypeLabels,
} from "@/lib/marketing-content-types"

interface TopicRadarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ideas: TopicIdea[]
  isLoading?: boolean
  lastAnalysisCategory?: TopicCategory | null
  onCreateBrief: (ideaId: string) => void
  onApproveIdea: (ideaId: string) => void
  onRejectIdea: (ideaId: string) => void
}

export function TopicRadarModal({
  open,
  onOpenChange,
  ideas,
  isLoading = false,
  lastAnalysisCategory = null,
  onCreateBrief,
  onApproveIdea,
  onRejectIdea,
}: TopicRadarModalProps) {
  const [categoryFilter, setCategoryFilter] = useState<TopicCategory | 'all'>('all')
  const [recentlyApproved, setRecentlyApproved] = useState<string | null>(null)

  const getGapScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-amber-100 text-amber-800'
    return 'bg-slate-100 text-slate-800'
  }

  const getCategoryIcon = (category: TopicCategory) => {
    switch (category) {
      case 'generalized':
        return <Search className="w-3.5 h-3.5" />
      case 'competitor':
        return <Users className="w-3.5 h-3.5" />
      case 'market_trends':
        return <TrendingUp className="w-3.5 h-3.5" />
    }
  }

  const filteredIdeas = categoryFilter === 'all'
    ? ideas
    : ideas.filter(idea => idea.category === categoryFilter)

  const getCategoryCounts = () => {
    return {
      all: ideas.length,
      generalized: ideas.filter(i => i.category === 'generalized').length,
      competitor: ideas.filter(i => i.category === 'competitor').length,
      market_trends: ideas.filter(i => i.category === 'market_trends').length,
    }
  }

  const counts = getCategoryCounts()

  const handleApprove = (ideaId: string) => {
    setRecentlyApproved(ideaId)
    // Show animation briefly, then call the actual approve
    setTimeout(() => {
      onApproveIdea(ideaId)
      setRecentlyApproved(null)
    }, 800)
  }

  const handleReject = (ideaId: string) => {
    onRejectIdea(ideaId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Topic Radar
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                AI-identified content gaps and topic opportunities
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 py-3 border-b overflow-x-auto">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-[#407B9D] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            All Ideas ({counts.all})
          </button>
          <button
            onClick={() => setCategoryFilter('generalized')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              categoryFilter === 'generalized'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Search className="w-3.5 h-3.5" />
            {topicCategoryLabels.generalized} ({counts.generalized})
          </button>
          <button
            onClick={() => setCategoryFilter('competitor')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              categoryFilter === 'competitor'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Users className="w-3.5 h-3.5" />
            {topicCategoryLabels.competitor} ({counts.competitor})
          </button>
          <button
            onClick={() => setCategoryFilter('market_trends')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              categoryFilter === 'market_trends'
                ? 'bg-teal-600 text-white'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {topicCategoryLabels.market_trends} ({counts.market_trends})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-[#407B9D]/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#407B9D] animate-spin" />
                </div>
              </div>
              <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Analyzing Content Gaps...
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                {lastAnalysisCategory && (
                  <>
                    Running{' '}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${topicCategoryColors[lastAnalysisCategory]}`}>
                      {getCategoryIcon(lastAnalysisCategory)}
                      {topicCategoryLabels[lastAnalysisCategory]}
                    </span>{' '}
                    analysis...
                  </>
                )}
              </p>
              <div className="mt-6 max-w-xs mx-auto">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#407B9D] rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Ideas List */}
          {!isLoading && (
            <div className="space-y-4">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className={`p-4 border rounded-lg bg-white transition-all duration-300 ${
                    recentlyApproved === idea.id
                      ? 'scale-95 opacity-50 border-green-400 bg-green-50'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3
                          className="font-semibold text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {idea.topic}
                        </h3>
                        <Badge className={topicIdeaStatusColors[idea.status]}>
                          {topicIdeaStatusLabels[idea.status]}
                        </Badge>
                        <Badge className={`${topicCategoryColors[idea.category]} flex items-center gap-1`}>
                          {getCategoryIcon(idea.category)}
                          {topicCategoryLabels[idea.category]}
                        </Badge>
                      </div>
                      <p
                        className="text-sm text-muted-foreground mb-3"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {idea.rationale}
                      </p>
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Gap Score:</span>
                          <Badge className={getGapScoreColor(idea.gapScore)}>
                            {idea.gapScore}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Format:</span>
                          <span className="font-medium text-[#463939]">
                            {contentTypeLabels[idea.suggestedFormat]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#407B9D]" />
                          <span className="text-muted-foreground">
                            Generated {idea.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {recentlyApproved === idea.id ? (
                        <div className="flex items-center gap-2 text-green-600 animate-pulse">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Moving to Brief Builder...</span>
                        </div>
                      ) : (
                        <>
                          {idea.status === 'new' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(idea.id)}
                                className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(idea.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {idea.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => onCreateBrief(idea.id)}
                              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                            >
                              Create Brief
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                          {(idea.status === 'in_progress' || idea.status === 'completed') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#407B9D] text-[#407B9D]"
                            >
                              View Brief
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredIdeas.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {ideas.length === 0 ? 'No Ideas Yet' : 'No Ideas in This Category'}
                  </p>
                  <p className="text-muted-foreground max-w-md mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
                    {ideas.length === 0
                      ? 'Run an analysis from the Topic Radar card to discover content gaps and generate new topic ideas.'
                      : `No ideas in the "${topicCategoryLabels[categoryFilter as TopicCategory]}" category. Try selecting a different filter or run a new analysis.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredIdeas.length} topic idea{filteredIdeas.length !== 1 ? 's' : ''}
            {categoryFilter !== 'all' && ` in ${topicCategoryLabels[categoryFilter]}`}
          </p>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
