"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, Users, TrendingUp } from "lucide-react"
import {
  Influencer,
  influencerStatusLabels,
  influencerStatusColors,
  platformLabels,
  platformColors,
  icpMatchLabels,
  icpMatchColors,
} from "@/lib/lead-discovery-types"

interface InfluencerFinderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  influencers: Influencer[]
  onAddToTrigify: (influencerId: string) => void
  onReview: (influencerId: string) => void
  onReject: (influencerId: string) => void
}

export function InfluencerFinderModal({
  open,
  onOpenChange,
  influencers,
  onAddToTrigify,
  onReview,
  onReject,
}: InfluencerFinderModalProps) {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Influencer Finder
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                Discover and track influencers whose audience matches your ICP
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {influencers.map((influencer) => (
              <div
                key={influencer.id}
                className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3
                        className="font-semibold text-[#463939]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {influencer.name}
                      </h3>
                      <Badge className={platformColors[influencer.platform]}>
                        {platformLabels[influencer.platform]}
                      </Badge>
                      <Badge className={influencerStatusColors[influencer.status]}>
                        {influencerStatusLabels[influencer.status]}
                      </Badge>
                    </div>
                    <p
                      className="text-sm text-muted-foreground mb-3"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {influencer.icpMatchReason}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#407B9D]" />
                        <span className="font-medium text-[#463939]">
                          {formatFollowers(influencer.followerCount)} followers
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#407B9D]" />
                        <span className="text-muted-foreground">
                          {influencer.averageEngagement}% engagement
                        </span>
                      </div>
                      <Badge className={icpMatchColors[influencer.icpMatch]}>
                        {icpMatchLabels[influencer.icpMatch]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {influencer.niche.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs bg-slate-50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {influencer.status === 'discovered' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onReview(influencer.id)}
                          className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(influencer.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {influencer.status === 'reviewing' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onAddToTrigify(influencer.id)}
                          className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                        >
                          Add to Trigify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(influencer.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {(influencer.status === 'added_to_trigify' || influencer.status === 'tracking') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#407B9D] text-[#407B9D]"
                        onClick={() => window.open(influencer.profileUrl, '_blank')}
                      >
                        View Profile
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {influencers.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  No influencers discovered yet. Run a discovery to find matches.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {influencers.length} influencer{influencers.length !== 1 ? 's' : ''} discovered
          </p>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
