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
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-0.5 relative group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Content Refresh
              </CardTitle>
              {needsRefreshCount > 0 && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none animate-pulse">
                  {needsRefreshCount} High Priority
                </Badge>
              )}
            </div>
            <CardDescription className="leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Identify stale content that needs updating based on traffic trends, rankings, and freshness.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-50 px-3 py-1.5 rounded-full">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              Performance monitoring
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunAnalysis}
              className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Run Report
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90 shadow-sm hover:shadow-md transition-all"
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
