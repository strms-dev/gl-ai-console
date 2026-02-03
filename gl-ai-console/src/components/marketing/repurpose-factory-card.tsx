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
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#C8E4BB]/30 transition-all duration-300 hover:-translate-y-0.5 relative group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C8E4BB]/15 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8E4BB] to-[#95CBD7] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#C8E4BB]/20 group-hover:scale-105 transition-transform">
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
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">
                  {inProgressCount} In Progress
                </Badge>
              )}
              {readyToRepurposeCount > 0 && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB] border-none">
                  {readyToRepurposeCount} Ready
                </Badge>
              )}
            </div>
            <CardDescription className="leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Transform existing content into new formats. Turn blogs into videos, posts into guides, and more.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-full">
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
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Start Repurposing
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90 shadow-sm hover:shadow-md transition-all"
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
