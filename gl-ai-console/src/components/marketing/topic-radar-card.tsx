"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, Sparkles, Search, TrendingUp, Users, ChevronDown, X } from "lucide-react"
import { TopicCategory, topicCategoryLabels, topicCategoryColors } from "@/lib/marketing-content-types"

interface TopicRadarCardProps {
  newIdeasCount: number
  onOpenModal: () => void
  onRunAnalysis: (category: TopicCategory) => void
}

export function TopicRadarCard({ newIdeasCount, onOpenModal, onRunAnalysis }: TopicRadarCardProps) {
  const [showCategorySelect, setShowCategorySelect] = useState(false)

  const categories: { value: TopicCategory; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'generalized',
      label: topicCategoryLabels.generalized,
      icon: <Search className="w-4 h-4" />,
      description: 'Find content gaps based on your existing library'
    },
    {
      value: 'competitor',
      label: topicCategoryLabels.competitor,
      icon: <Users className="w-4 h-4" />,
      description: 'Ideas based on competitor blog performance'
    },
    {
      value: 'market_trends',
      label: topicCategoryLabels.market_trends,
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Trending topics, regulations, economic changes'
    },
  ]

  const handleCategorySelect = (category: TopicCategory) => {
    setShowCategorySelect(false)
    onRunAnalysis(category)
  }

  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-7 h-7 text-[#407B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Topic Radar
              </CardTitle>
              {newIdeasCount > 0 && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]">
                  {newIdeasCount} New
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Discover content gaps and generate new topic ideas based on your existing content library and market trends.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              AI-powered gap analysis
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCategorySelect(!showCategorySelect)}
                className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
              >
                Run Analysis
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showCategorySelect ? 'rotate-180' : ''}`} />
              </Button>

              {/* Category Selection Dropdown */}
              {showCategorySelect && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                      Select Analysis Type
                    </span>
                    <button
                      onClick={() => setShowCategorySelect(false)}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="p-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategorySelect(category.value)}
                        className="w-full p-3 text-left rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-3 group"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${topicCategoryColors[category.value].replace('text-', 'bg-').split(' ')[0]}`}>
                          <span className={topicCategoryColors[category.value].split(' ')[1]}>
                            {category.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[#463939] group-hover:text-[#407B9D]" style={{ fontFamily: 'var(--font-heading)' }}>
                            {category.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                            {category.description}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#407B9D] mt-1 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              View Ideas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Backdrop for dropdown */}
      {showCategorySelect && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCategorySelect(false)}
        />
      )}
    </Card>
  )
}
