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
import { Lightbulb, Target, TrendingUp, CheckCircle, ArrowLeft } from "lucide-react"
import {
  LeadHypothesis,
  hypothesisStatusLabels,
  hypothesisStatusColors,
} from "@/lib/lead-discovery-types"

interface HypothesisLabModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hypotheses: LeadHypothesis[]
  onApprove: (hypothesisId: string) => void
  onReject: (hypothesisId: string) => void
  onMoveToPending: (hypothesisId: string) => void
}

export function HypothesisLabModal({
  open,
  onOpenChange,
  hypotheses,
  onApprove,
  onReject,
  onMoveToPending,
}: HypothesisLabModalProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-amber-100 text-amber-800'
    return 'bg-slate-100 text-slate-800'
  }

  // Filter out rejected hypotheses for display
  const activeHypotheses = hypotheses.filter(h => h.status !== 'rejected')
  const pendingHypotheses = activeHypotheses.filter(h => h.status === 'draft' || h.status === 'validating')
  const approvedHypotheses = activeHypotheses.filter(h => h.status === 'approved' || h.status === 'active' || h.status === 'completed')

  const HypothesisCard = ({ hypothesis }: { hypothesis: LeadHypothesis }) => (
    <div className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3
              className="font-semibold text-[#463939]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {hypothesis.title}
            </h3>
            <Badge className={hypothesisStatusColors[hypothesis.status]}>
              {hypothesisStatusLabels[hypothesis.status]}
            </Badge>
          </div>
          <p
            className="text-sm text-muted-foreground mb-3"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {hypothesis.description}
          </p>

          {/* Target Criteria */}
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Target Criteria
            </p>
            <div className="flex flex-wrap gap-2">
              {hypothesis.targetCriteria.map((criteria, idx) => (
                <Badge
                  key={idx}
                  className="text-xs bg-slate-50 border border-slate-200"
                >
                  <Target className="w-3 h-3 mr-1" />
                  {criteria}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Confidence:</span>
              <Badge className={getConfidenceColor(hypothesis.confidenceScore)}>
                {hypothesis.confidenceScore}%
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#407B9D]" />
              <span className="text-muted-foreground">
                Est. {hypothesis.estimatedLeadCount} leads
              </span>
            </div>
            {hypothesis.leadsGenerated > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600 font-medium">
                  {hypothesis.leadsGenerated} generated
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {(hypothesis.status === 'draft' || hypothesis.status === 'validating') && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(hypothesis.id)}
                className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(hypothesis.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Reject
              </Button>
            </>
          )}
          {(hypothesis.status === 'approved' || hypothesis.status === 'active' || hypothesis.status === 'completed') && (
            <>
              <Badge className="bg-green-100 text-green-800 py-1.5 px-3 justify-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Approved
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMoveToPending(hypothesis.id)}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Move to Pending
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Hypothesis Lab
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                Review and approve lead hypotheses for targeted outreach
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {/* Pending Review Section */}
            {pendingHypotheses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Pending Review ({pendingHypotheses.length})
                </h4>
                <div className="space-y-4">
                  {pendingHypotheses.map((hypothesis) => (
                    <HypothesisCard key={hypothesis.id} hypothesis={hypothesis} />
                  ))}
                </div>
              </div>
            )}

            {/* Approved Section */}
            {approvedHypotheses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Approved ({approvedHypotheses.length})
                </h4>
                <div className="space-y-4">
                  {approvedHypotheses.map((hypothesis) => (
                    <HypothesisCard key={hypothesis.id} hypothesis={hypothesis} />
                  ))}
                </div>
              </div>
            )}

            {activeHypotheses.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  No hypotheses yet. Create a new hypothesis to start generating lead ideas.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {activeHypotheses.length} hypothesis{activeHypotheses.length !== 1 ? 'es' : ''} total
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
