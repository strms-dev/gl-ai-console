"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, Sparkles } from "lucide-react"

interface InfluencerFinderCardProps {
  newDiscoveriesCount: number
  onOpenModal: () => void
  onRunDiscovery: () => void
}

export function InfluencerFinderCard({ newDiscoveriesCount, onOpenModal, onRunDiscovery }: InfluencerFinderCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
            <Search className="w-7 h-7 text-[#407B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Influencer Finder
              </CardTitle>
              {newDiscoveriesCount > 0 && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]">
                  {newDiscoveriesCount} New
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Discover influencers whose audience matches your ICP. Find thought leaders in finance, SaaS, and business growth.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              AI-powered ICP matching
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunDiscovery}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
            >
              Run Discovery
            </Button>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
