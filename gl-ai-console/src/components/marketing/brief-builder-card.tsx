"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowRight, PenLine } from "lucide-react"

interface BriefBuilderCardProps {
  briefsInProgressCount: number
  onOpenModal: () => void
  onCreateBrief: () => void
}

export function BriefBuilderCard({ briefsInProgressCount, onOpenModal, onCreateBrief }: BriefBuilderCardProps) {
  return (
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#95CBD7]/30 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#95CBD7]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#95CBD7] to-[#407B9D] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#95CBD7]/20 group-hover:scale-105 transition-transform">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Brief Builder
              </CardTitle>
              {briefsInProgressCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">
                  {briefsInProgressCount} In Progress
                </Badge>
              )}
            </div>
            <CardDescription className="leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Create structured content briefs with outlines, keywords, and guidelines for your team.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-full">
            <PenLine className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              Structured content planning
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateBrief}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white transition-colors"
            >
              <PenLine className="w-3.5 h-3.5 mr-1" />
              New Brief
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90 shadow-sm hover:shadow-md transition-all"
            >
              View Briefs
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
