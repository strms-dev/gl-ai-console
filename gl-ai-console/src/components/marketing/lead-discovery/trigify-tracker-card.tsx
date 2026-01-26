"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Radio, ArrowRight, Users } from "lucide-react"

interface TrigifyTrackerCardProps {
  trackingCount: number
  engagedLeadsCount: number
  onOpenModal: () => void
}

export function TrigifyTrackerCard({ trackingCount, engagedLeadsCount, onOpenModal }: TrigifyTrackerCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#95CBD7]/20 flex items-center justify-center flex-shrink-0">
            <Radio className="w-7 h-7 text-[#407B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Trigify Tracker
              </CardTitle>
              {trackingCount > 0 && (
                <Badge className="bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]">
                  {trackingCount} Tracking
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Monitor influencers in Trigify and track people who engage with their content. Push high-intent leads to Clay.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {engagedLeadsCount} engaged leads to review
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              View Engagements
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
