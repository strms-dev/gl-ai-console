"use client"

import { useState, useEffect } from "react"
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
  Play,
  FileText,
  Copy,
  Eye,
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
  triggerReport?: boolean
  onReportTriggered?: () => void
}

// Completed refresh tracking
interface CompletedRefresh {
  id: string
  title: string
  contentType: string
  completedAt: string
  tasksCompleted: number
  tasks: RefreshTask[]
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
  onStartRefresh,
  onDismiss,
  triggerReport,
  onReportTriggered,
}: RefreshModalProps) {
  // View state: 'list' shows all recommendations, 'tasks' shows task checklist for active refresh, 'completed' shows refreshed items
  const [view, setView] = useState<'list' | 'tasks' | 'completed'>('list')
  const [activeRecommendation, setActiveRecommendation] = useState<RefreshRecommendation | null>(null)
  const [tasks, setTasks] = useState<RefreshTask[]>([])
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  // Internal state for recommendations - starts empty
  const [internalRecommendations, setInternalRecommendations] = useState<RefreshRecommendation[]>([])
  const [isRunningReport, setIsRunningReport] = useState(false)
  const [completedRefreshes, setCompletedRefreshes] = useState<CompletedRefresh[]>([])
  const [expandedCompletedItems, setExpandedCompletedItems] = useState<Set<string>>(new Set())

  const toggleCompletedItemExpanded = (itemId: string) => {
    setExpandedCompletedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const getRankingChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null
    const change = previous - current // positive means improved (lower rank is better)
    return change
  }

  // Run Report - analyze content and generate recommendations
  const handleRunReport = () => {
    setIsRunningReport(true)

    // Simulate report generation with delay
    setTimeout(() => {
      // Generate test recommendations
      const testRecommendations: RefreshRecommendation[] = [
        {
          id: 'rec-1',
          contentId: 'content-1',
          title: 'The Complete Guide to Financial Planning for 2024',
          contentType: 'blog',
          currentRanking: 15,
          previousRanking: 8,
          trafficChange: -35,
          lastUpdated: '2024-03-15',
          recommendedActions: [
            'Update year references from 2024 to 2025',
            'Refresh statistics with latest industry data',
            'Add new section on AI-powered financial tools',
            'Update internal links to newer content',
          ],
          priority: 'high',
          status: 'pending',
          refreshTrigger: 'time_sensitive',
          timeSensitiveDate: '2024',
        },
        {
          id: 'rec-2',
          contentId: 'content-2',
          title: 'Cash Flow Management Best Practices',
          contentType: 'blog',
          currentRanking: 22,
          previousRanking: 12,
          trafficChange: -28,
          lastUpdated: '2024-06-01',
          recommendedActions: [
            'Update case study examples with recent client wins',
            'Refresh the 13-week forecast template',
            'Add section on automated cash flow tools',
          ],
          priority: 'medium',
          status: 'pending',
          refreshTrigger: 'analytics_decay',
        },
        {
          id: 'rec-3',
          contentId: 'content-3',
          title: 'Series A Preparation Checklist',
          contentType: 'case_study',
          trafficChange: -15,
          lastUpdated: '2024-08-20',
          recommendedActions: [
            'Update valuation benchmarks for 2025',
            'Add recent funding trends data',
            'Refresh investor expectations section',
          ],
          priority: 'low',
          status: 'pending',
          refreshTrigger: 'time_sensitive',
          timeSensitiveDate: '2024',
        },
      ]

      setInternalRecommendations(testRecommendations)
      setIsRunningReport(false)
    }, 2500)
  }

  // Handle external trigger to run report
  useEffect(() => {
    if (triggerReport && open && !isRunningReport) {
      handleRunReport()
      onReportTriggered?.()
    }
  }, [triggerReport, open, isRunningReport, onReportTriggered])

  // Dismiss a recommendation - removes it from the list
  const handleDismissRecommendation = (recId: string) => {
    setInternalRecommendations(prev => prev.filter(r => r.id !== recId))
    onDismiss(recId)
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
    if (activeRecommendation) {
      // Add to completed refreshes with task details
      const completedItem: CompletedRefresh = {
        id: activeRecommendation.id,
        title: activeRecommendation.title,
        contentType: activeRecommendation.contentType,
        completedAt: new Date().toISOString(),
        tasksCompleted: tasks.length,
        tasks: [...tasks],
      }
      setCompletedRefreshes(prev => [completedItem, ...prev])

      // Remove from recommendations list
      setInternalRecommendations(prev =>
        prev.filter(r => r.id !== activeRecommendation.id)
      )
    }

    setView('completed')
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
                {view === 'list' ? 'Refresh Finder' : view === 'completed' ? 'Refreshed Content' : 'Refresh Tasks'}
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                {view === 'list'
                  ? 'Content that needs updating based on performance metrics'
                  : view === 'completed'
                    ? 'Content you have recently refreshed'
                    : `Working on: ${activeRecommendation?.title}`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {view === 'list' ? (
          // List View - All recommendations
          <>
            {/* Tab bar for List vs Completed */}
            <div className="flex gap-2 border-b pb-2 mb-4">
              <button
                className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors bg-[#407B9D] text-white"
              >
                Needs Refresh
                {internalRecommendations.length > 0 && (
                  <Badge className="ml-2 bg-white/20 text-inherit">{internalRecommendations.length}</Badge>
                )}
              </button>
              <button
                onClick={() => setView('completed')}
                className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors text-muted-foreground hover:text-[#463939] hover:bg-slate-100"
              >
                Refreshed
                {completedRefreshes.length > 0 && (
                  <Badge className="ml-2 bg-green-100 text-green-800">{completedRefreshes.length}</Badge>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {/* Empty state */}
              {internalRecommendations.length === 0 && !isRunningReport && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    No content needs refreshing at the moment.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-body)' }}>
                    Click &quot;Run Report&quot; on the Content Refresh card to analyze your library.
                  </p>
                </div>
              )}

              {/* Loading state while running report */}
              {isRunningReport && (
                <div className="text-center py-12">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-[#407B9D]/20 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#407B9D] animate-spin" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Analyzing Content...
                  </p>
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    Checking performance metrics and identifying refresh opportunities.
                  </p>
                </div>
              )}

              {/* Recommendations list */}
              {internalRecommendations.length > 0 && !isRunningReport && (
                <div className="space-y-4">
                  {internalRecommendations.map((rec) => {
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
                                onClick={() => handleDismissRecommendation(rec.id)}
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
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {internalRecommendations.filter((r) => r.status === 'pending').length} item
                {internalRecommendations.filter((r) => r.status === 'pending').length !== 1 ? 's' : ''}{' '}
                need attention
              </p>
              <div className="flex gap-2">
                {internalRecommendations.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleRunReport}
                    disabled={isRunningReport}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Re-run Report
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        ) : view === 'completed' ? (
          // Completed View - Recently refreshed content
          <>
            {/* Tab bar for List vs Completed */}
            <div className="flex gap-2 border-b pb-2 mb-4">
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors text-muted-foreground hover:text-[#463939] hover:bg-slate-100"
              >
                Needs Refresh
                {internalRecommendations.length > 0 && (
                  <Badge className="ml-2 bg-amber-100 text-amber-800">{internalRecommendations.length}</Badge>
                )}
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors bg-[#407B9D] text-white"
              >
                Refreshed
                {completedRefreshes.length > 0 && (
                  <Badge className="ml-2 bg-white/20 text-inherit">{completedRefreshes.length}</Badge>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {completedRefreshes.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    No content has been refreshed yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedRefreshes.map((item) => {
                    const isExpanded = expandedCompletedItems.has(item.id)
                    return (
                      <div
                        key={item.id}
                        className="border rounded-lg bg-green-50 border-green-200 overflow-hidden"
                      >
                        {/* Clickable header */}
                        <div
                          className="p-4 cursor-pointer hover:bg-green-100/50 transition-colors"
                          onClick={() => toggleCompletedItemExpanded(item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3
                                  className="font-semibold text-[#463939]"
                                  style={{ fontFamily: 'var(--font-heading)' }}
                                >
                                  {item.title}
                                </h3>
                                <Badge className={contentTypeColors[item.contentType as keyof typeof contentTypeColors]}>
                                  {contentTypeLabels[item.contentType as keyof typeof contentTypeLabels]}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Complete
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Refreshed {new Date(item.completedAt).toLocaleDateString()} • {item.tasksCompleted} tasks completed
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded content showing completed tasks */}
                        {isExpanded && item.tasks && item.tasks.length > 0 && (
                          <div className="border-t border-green-200 bg-white p-4">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                              Completed Tasks
                            </h4>
                            <div className="space-y-2">
                              {item.tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                                >
                                  <div className="w-5 h-5 rounded-md bg-[#C8E4BB] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-[#463939]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#463939]">{task.action}</p>
                                    {task.aiSuggestion && (
                                      <div className="mt-2 p-2 bg-[#407B9D]/5 border border-[#407B9D]/20 rounded text-xs">
                                        <div className="flex items-center gap-1 mb-1 text-[#407B9D]">
                                          <Sparkles className="w-3 h-3" />
                                          <span className="font-medium">AI Suggestion Used</span>
                                        </div>
                                        <p className="text-[#463939] whitespace-pre-wrap line-clamp-3">
                                          {task.aiSuggestion}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {completedRefreshes.length} item{completedRefreshes.length !== 1 ? 's' : ''} refreshed
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
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#407B9D]" />
                                <span className="text-xs font-medium text-[#407B9D]">AI Suggestion</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    navigator.clipboard.writeText(task.aiSuggestion || '')
                                  }}
                                  className="h-6 text-xs px-2"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    // Apply suggestion = mark task as complete
                                    handleToggleTask(task.id)
                                  }}
                                  className="h-6 text-xs px-2 bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Apply
                                </Button>
                              </div>
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
