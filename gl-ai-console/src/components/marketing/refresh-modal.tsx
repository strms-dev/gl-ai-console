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
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart2,
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
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

// Task item for refresh workflow
interface RefreshTask {
  id: string
  action: string
  completed: boolean
  aiSuggestion?: string
  isLoadingSuggestion?: boolean
}

export function RefreshModal({
  open,
  onOpenChange,
  recommendations,
  onStartRefresh,
  onDismiss,
}: RefreshModalProps) {
  // View state: 'list' shows all recommendations, 'tasks' shows task checklist for active refresh
  const [view, setView] = useState<'list' | 'tasks'>('list')
  const [activeRecommendation, setActiveRecommendation] = useState<RefreshRecommendation | null>(null)
  const [tasks, setTasks] = useState<RefreshTask[]>([])
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const getRankingChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null
    const change = previous - current // positive means improved (lower rank is better)
    return change
  }

  // Start refresh and create task checklist
  const handleStartRefresh = (rec: RefreshRecommendation) => {
    setActiveRecommendation(rec)
    // Create tasks from recommended actions
    const newTasks: RefreshTask[] = rec.recommendedActions.map((action, index) => ({
      id: `task-${index}`,
      action,
      completed: false,
    }))
    setTasks(newTasks)
    setView('tasks')
    onStartRefresh(rec.id)
  }

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  // Toggle task expansion
  const handleToggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  // Get AI suggestion for a task
  const handleGetSuggestion = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, isLoadingSuggestion: true } : task
      )
    )

    // Simulate AI generating a suggestion
    setTimeout(() => {
      setTasks(prev =>
        prev.map(task => {
          if (task.id === taskId) {
            // Generate a context-aware suggestion based on the task
            let suggestion = ''
            if (task.action.toLowerCase().includes('statistics') || task.action.toLowerCase().includes('data')) {
              suggestion = `Here are the updated statistics for 2025:\n\n• Industry growth rate: 12.5% YoY\n• Average implementation time: 3-6 months\n• Customer satisfaction: 94%\n• ROI improvement: 35% average\n\nSources: Gartner 2025 Report, Forrester Q1 2025`
            } else if (task.action.toLowerCase().includes('section') || task.action.toLowerCase().includes('add')) {
              suggestion = `Suggested new section:\n\n## AI & Automation Trends in 2025\n\nThe landscape has shifted significantly:\n\n1. **AI-powered forecasting** - 67% of companies now use AI for financial predictions\n2. **Automated compliance** - New tools reducing audit prep time by 40%\n3. **Real-time reporting** - The standard is now weekly, not monthly\n\n*Consider adding specific client examples here*`
            } else if (task.action.toLowerCase().includes('meta') || task.action.toLowerCase().includes('description')) {
              suggestion = `Improved meta description:\n\n"Discover proven financial planning strategies for 2025. Learn how 500+ growing businesses improved cash flow, reduced costs, and achieved sustainable growth with our expert-backed framework."\n\n(155 characters - optimal for search)`
            } else if (task.action.toLowerCase().includes('link')) {
              suggestion = `Suggested internal links to add:\n\n• Link "cash flow management" to → /blog/13-week-cash-flow\n• Link "fractional CFO" to → /services/fractional-cfo\n• Link "Series A preparation" to → /blog/series-a-finance-checklist\n• Add related post callout → "You might also like: 5 Signs You Need a CFO"`
            } else {
              suggestion = `Here's a suggested approach:\n\n1. Review the current content structure\n2. Identify outdated references\n3. Update with current best practices\n4. Add relevant examples from recent client work\n5. Ensure all statistics reference 2025 data\n\n*Note: Consider A/B testing the updated version*`
            }
            return { ...task, aiSuggestion: suggestion, isLoadingSuggestion: false }
          }
          return task
        })
      )
      // Auto-expand the task to show suggestion
      setExpandedTasks(prev => new Set([...prev, taskId]))
    }, 1500)
  }

  // Mark all tasks complete and finish refresh
  const handleCompleteRefresh = () => {
    // All tasks should be complete
    setView('list')
    setActiveRecommendation(null)
    setTasks([])
    setExpandedTasks(new Set())
  }

  // Go back to list
  const handleBackToList = () => {
    setView('list')
    setActiveRecommendation(null)
    setTasks([])
    setExpandedTasks(new Set())
  }

  const allTasksComplete = tasks.every(task => task.completed)

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
                {view === 'list' ? 'Refresh Finder' : 'Refresh Tasks'}
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                {view === 'list'
                  ? 'Content that needs updating based on performance metrics'
                  : `Working on: ${activeRecommendation?.title}`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {view === 'list' ? (
          // List View - All recommendations
          <>
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
                                onClick={() => handleStartRefresh(rec)}
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
          </>
        ) : (
          // Tasks View - Task checklist for active refresh
          <>
            <div className="flex-1 overflow-y-auto py-4">
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#463939]">
                    {tasks.filter(t => t.completed).length} of {tasks.length} tasks complete
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-[#407B9D] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Task list */}
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isExpanded = expandedTasks.has(task.id)

                  return (
                    <div
                      key={task.id}
                      className={`border rounded-lg overflow-hidden transition-all ${
                        task.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                              task.completed
                                ? 'bg-[#C8E4BB] border-[#C8E4BB]'
                                : 'border-slate-300 hover:border-[#407B9D]'
                            }`}
                          >
                            {task.completed && <Check className="w-4 h-4 text-[#463939]" />}
                          </button>

                          {/* Task content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${task.completed ? 'text-muted-foreground line-through' : 'text-[#463939]'}`}>
                              {task.action}
                            </p>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleGetSuggestion(task.id)}
                                disabled={task.isLoadingSuggestion || !!task.aiSuggestion}
                                className="h-7 text-xs text-[#407B9D]"
                              >
                                {task.isLoadingSuggestion ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Getting suggestion...
                                  </>
                                ) : task.aiSuggestion ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                                    Suggestion ready
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Get AI suggestion
                                  </>
                                )}
                              </Button>

                              {task.aiSuggestion && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleExpanded(task.id)}
                                  className="h-7 text-xs"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3 mr-1" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                      Show
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* AI Suggestion content */}
                        {task.aiSuggestion && isExpanded && (
                          <div className="mt-3 ml-9 p-3 bg-[#407B9D]/5 border border-[#407B9D]/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-[#407B9D]" />
                              <span className="text-xs font-medium text-[#407B9D]">AI Suggestion</span>
                            </div>
                            <div className="text-sm text-[#463939] whitespace-pre-wrap">
                              {task.aiSuggestion}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleBackToList}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to List
              </Button>
              <Button
                onClick={handleCompleteRefresh}
                disabled={!allTasksComplete}
                className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark as Complete
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
