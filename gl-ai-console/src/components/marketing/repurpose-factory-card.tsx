"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowRight, Layers, Sparkles } from "lucide-react"

interface RepurposeFactoryCardProps {
  readyToRepurposeCount: number
  inProgressCount?: number
  onOpenModal: () => void
  onStartRepurposing?: () => void
}

export function RepurposeFactoryCard({ readyToRepurposeCount, inProgressCount = 0, onOpenModal, onStartRepurposing }: RepurposeFactoryCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-7 h-7 text-[#407B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Repurpose Content
              </CardTitle>
              {inProgressCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {inProgressCount} In Progress
                </Badge>
              )}
              {readyToRepurposeCount > 0 && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]">
                  {readyToRepurposeCount} Ready
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Transform existing content into new formats. Turn blogs into videos, posts into guides, and more.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              Multiply content value
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onStartRepurposing}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Start Repurposing
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              View Content
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
