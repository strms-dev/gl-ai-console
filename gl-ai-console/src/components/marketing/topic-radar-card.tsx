"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react"

interface TopicRadarCardProps {
  newIdeasCount: number
  onOpenModal: () => void
  onRunAnalysis: () => void
}

export function TopicRadarCard({ newIdeasCount, onOpenModal, onRunAnalysis }: TopicRadarCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
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
            <Button
              variant="outline"
              size="sm"
              onClick={onRunAnalysis}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              Run Analysis
            </Button>
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
    </Card>
  )
}
