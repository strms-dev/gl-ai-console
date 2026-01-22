"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, Sparkles, ExternalLink } from "lucide-react"
import {
  TopicIdea,
  topicIdeaStatusLabels,
  topicIdeaStatusColors,
  contentTypeLabels,
} from "@/lib/marketing-content-types"

interface TopicRadarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ideas: TopicIdea[]
  onCreateBrief: (ideaId: string) => void
  onApproveIdea: (ideaId: string) => void
  onRejectIdea: (ideaId: string) => void
}

export function TopicRadarModal({
  open,
  onOpenChange,
  ideas,
  onCreateBrief,
  onApproveIdea,
  onRejectIdea,
}: TopicRadarModalProps) {
  const getGapScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-amber-100 text-amber-800'
    return 'bg-slate-100 text-slate-800'
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

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
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
                    </div>
                    <p
                      className="text-sm text-muted-foreground mb-3"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {idea.rationale}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
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
                    {idea.status === 'new' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApproveIdea(idea.id)}
                          className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRejectIdea(idea.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
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
                  </div>
                </div>
              </div>
            ))}

            {ideas.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  No topic ideas yet. Run an analysis to discover content gaps.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {ideas.length} topic idea{ideas.length !== 1 ? 's' : ''} identified
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
