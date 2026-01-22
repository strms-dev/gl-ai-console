"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowRight, AlertTriangle } from "lucide-react"

interface RefreshFinderCardProps {
  needsRefreshCount: number
  onOpenModal: () => void
  onRunAnalysis: () => void
}

export function RefreshFinderCard({ needsRefreshCount, onOpenModal, onRunAnalysis }: RefreshFinderCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-amber-100/50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-7 h-7 text-[#407B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Refresh Finder
              </CardTitle>
              {needsRefreshCount > 0 && (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                  {needsRefreshCount} High Priority
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Identify stale content that needs updating based on traffic trends, rankings, and freshness.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              Performance monitoring
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunAnalysis}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              Run Report
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              View Report
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
