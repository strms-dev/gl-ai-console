"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, ArrowRight, Send } from "lucide-react"

interface ClayPipelineCardProps {
  leadsInClayCount: number
  readyForOutreachCount: number
  onOpenModal: () => void
  onExport: () => void
}

export function ClayPipelineCard({ leadsInClayCount, readyForOutreachCount, onOpenModal, onExport }: ClayPipelineCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
            <Database className="w-7 h-7 text-[#407B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Clay Pipeline
              </CardTitle>
              {readyForOutreachCount > 0 && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]">
                  {readyForOutreachCount} Ready
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Unified view of all leads from both pipelines. Enrich data in Clay and manage outreach sequences.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Send className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {leadsInClayCount} total leads in pipeline
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              Export
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              View Pipeline
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
