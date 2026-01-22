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
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#95CBD7]/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-[#407B9D]" />
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
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {briefsInProgressCount} In Progress
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Create structured content briefs with outlines, keywords, and guidelines for your team.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              New Brief
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
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
