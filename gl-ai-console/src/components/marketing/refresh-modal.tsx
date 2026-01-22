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
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart2,
} from "lucide-react"
import {
  RefreshRecommendation,
  refreshPriorityLabels,
  refreshPriorityColors,
  contentTypeLabels,
  contentTypeColors,
  refreshTriggerLabels,
  refreshTriggerColors,
} from "@/lib/marketing-content-types"

interface RefreshModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recommendations: RefreshRecommendation[]
  onStartRefresh: (recommendationId: string) => void
  onDismiss: (recommendationId: string) => void
}

export function RefreshModal({
  open,
  onOpenChange,
  recommendations,
  onStartRefresh,
  onDismiss,
}: RefreshModalProps) {
  const getRankingChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null
    const change = previous - current // positive means improved (lower rank is better)
    return change
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100/50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Refresh Finder
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                Content that needs updating based on performance metrics
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const rankingChange = getRankingChange(rec.currentRanking, rec.previousRanking)

              return (
                <div
                  key={rec.id}
                  className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3
                          className="font-semibold text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {rec.title}
                        </h3>
                        <Badge className={refreshPriorityColors[rec.priority]}>
                          {refreshPriorityLabels[rec.priority]} Priority
                        </Badge>
                        <Badge className={contentTypeColors[rec.contentType]}>
                          {contentTypeLabels[rec.contentType]}
                        </Badge>
                        <Badge className={refreshTriggerColors[rec.refreshTrigger]}>
                          {refreshTriggerLabels[rec.refreshTrigger]}
                          {rec.timeSensitiveDate && ` (${rec.timeSensitiveDate})`}
                        </Badge>
                      </div>

                      {/* Metrics Row */}
                      <div className="flex items-center gap-6 text-sm mb-3 flex-wrap">
                        {rec.currentRanking && (
                          <div className="flex items-center gap-1">
                            <BarChart2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Ranking:</span>
                            <span className="font-medium text-[#463939]">
                              #{rec.currentRanking}
                            </span>
                            {rankingChange !== null && (
                              <span
                                className={`flex items-center ${
                                  rankingChange > 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {rankingChange > 0 ? (
                                  <TrendingUp className="w-3.5 h-3.5" />
                                ) : (
                                  <TrendingDown className="w-3.5 h-3.5" />
                                )}
                                {Math.abs(rankingChange)}
                              </span>
                            )}
                          </div>
                        )}
                        {rec.trafficChange !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Traffic:</span>
                            <span
                              className={`font-medium flex items-center ${
                                rec.trafficChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {rec.trafficChange >= 0 ? (
                                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                              )}
                              {rec.trafficChange >= 0 ? '+' : ''}
                              {rec.trafficChange}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Last updated:</span>
                          <span className="font-medium text-[#463939]">
                            {rec.lastUpdated}
                          </span>
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-md">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          RECOMMENDED ACTIONS
                        </p>
                        <ul className="text-sm text-[#463939] space-y-1">
                          {rec.recommendedActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <ArrowRight className="w-3.5 h-3.5 text-[#407B9D] mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {rec.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onStartRefresh(rec.id)}
                            className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Start Refresh
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDismiss(rec.id)}
                            className="text-muted-foreground hover:bg-slate-100"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        </>
                      )}
                      {rec.status === 'in_progress' && (
                        <Badge className="bg-amber-100 text-amber-800">
                          In Progress
                        </Badge>
                      )}
                      {rec.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  No refresh recommendations yet. Run a report to analyze your content.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {recommendations.filter((r) => r.status === 'pending').length} item
            {recommendations.filter((r) => r.status === 'pending').length !== 1 ? 's' : ''}{' '}
            need attention
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
